import { rename } from 'fs-extra';
import { resolve } from 'path';
import Queue from 'queue';
import Container, { Service } from 'typedi';

import { PayloadStatus, ServerToWebEvents } from '../../common/enums';
import { type IGenerateAPKPayload } from '../../common/interfaces';
import { config } from '../config';
import { PayloadModel } from '../database';
import { logger } from '../logger';
import { buildAPK } from '../utils/APKBuilder';
import { SocketService } from './SocketService';

@Service()
export class PayloadService {
    private readonly jobQueue: Queue;

    public constructor() {
        this.jobQueue = new Queue({
            concurrency: 1,
            autostart: true,
        });

        logger.verbose('Queueing pending payloads...', {
            label: 'payload',
            action: 'queue-pending',
        });

        // PayloadModel.findAll({ where: { status: PayloadStatus.PENDING } })
        //     .then((payloads) => {
        //         logger.info(`Found ${payloads.length} pending payloads!`, {
        //             label: 'payload',
        //             action: 'queue-pending',
        //         });

        //         payloads.forEach((payload) => {
        //             this.queueJob(payload);
        //         });
        //     })
        //     .catch((error) => {
        //         logger.error('Failed to queue pending payloads!', {
        //             error,
        //             label: 'payload',
        //             action: 'queue-pending',
        //         });
        //     });
    }

    private queueJob(payload: PayloadModel): void {
        logger.verbose(`Queuing payload ${payload.id}...`, {
            label: 'payload',
            action: 'queue',
        });

        this.jobQueue.push((callback) => {
            logger.info(`Processing payload ${payload.id}...`, {
                label: 'payload',
                action: 'process',
            });

            buildAPK(payload)
                .then(() => {
                    logger.info(
                        `Payload ${payload.id} processed successfully!`,
                        {
                            label: 'payload',
                            action: 'process',
                        },
                    );

                    if (callback) {
                        callback();
                    }
                })
                .catch((error: Error) => {
                    logger.error(`Failed to process payload ${payload.id}!`, {
                        error,
                        label: 'payload',
                        action: 'process',
                    });

                    if (callback) {
                        callback(error);
                    }
                });
        });

        this.jobQueue.start((error) => {
            if (error) {
                logger.error('Failed to start job queue!', {
                    error,
                    label: 'payload',
                    action: 'queue',
                });
            }
        });
    }

    public async create(
        payload: IGenerateAPKPayload,
        existingAPK: Express.Multer.File | undefined,
    ): Promise<PayloadModel> {
        // Can't inject SocketService at the top of the file because of circular dependency
        const socketService = Container.get(SocketService);

        const payloadModel = await PayloadModel.create({
            ...payload,
            status: PayloadStatus.PENDING,
            existingAPKName: existingAPK?.originalname,
        });

        try {
            if (existingAPK) {
                await rename(
                    existingAPK.path,
                    resolve(
                        process.cwd(),
                        config.APK_UPLOAD_PATH,
                        `${payloadModel.id}.apk`,
                    ),
                );
            }
        } catch (error) {
            logger.error('Failed to move existing APK file!', {
                error,
                label: 'payload',
                action: 'create',
            });
        }

        socketService.payloadsRoom.emit(
            ServerToWebEvents.PAYLOAD_ADDED,
            payloadModel,
        );

        // Don't queue the job immediately, wait 3 seconds to allow the client to connect
        setTimeout(() => {
            this.queueJob(payloadModel);
        }, 3000);

        return payloadModel;
    }

    public async findById(id: string): Promise<PayloadModel | null> {
        return await PayloadModel.findOne({ where: { id } });
    }

    public async list(): Promise<PayloadModel[]> {
        return await PayloadModel.findAll({
            order: [['createdAt', 'DESC']],
        });
    }

    public async delete(id: string): Promise<void> {
        await PayloadModel.destroy({ where: { id } });
    }
}
