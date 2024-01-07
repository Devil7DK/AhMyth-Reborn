import { relative } from 'path';
import Queue from 'queue';
import Container, { Inject, Service } from 'typedi';
import { DataSource, type Repository } from 'typeorm';

import { PayloadStatus, ServerToWebEvents } from '../../common/enums';
import { type IGenerateAPKPayload } from '../../common/interfaces';
import { config } from '../config';
import { PayloadEntity } from '../entities';
import { logger } from '../logger';
import { buildAPK } from '../utils/APKBuilder';
import { SocketService } from './SocketService';

@Service()
export class PayloadService {
    private readonly payloadRepository: Repository<PayloadEntity>;
    private readonly jobQueue: Queue;

    public constructor(@Inject(() => DataSource) dataSource: DataSource) {
        this.payloadRepository = dataSource.getRepository(PayloadEntity);
        this.jobQueue = new Queue({
            concurrency: 1,
            autostart: true,
        });

        logger.verbose('Queueing pending payloads...', {
            label: 'payload',
            action: 'queue-pending',
        });

        this.payloadRepository
            .find({ where: { status: PayloadStatus.PENDING } })
            .then((payloads) => {
                logger.info(`Found ${payloads.length} pending payloads!`, {
                    label: 'payload',
                    action: 'queue-pending',
                });

                payloads.forEach((payload) => {
                    this.queueJob(payload);
                });
            })
            .catch((error) => {
                logger.error('Failed to queue pending payloads!', {
                    error,
                    label: 'payload',
                    action: 'queue-pending',
                });
            });
    }

    private queueJob(payload: PayloadEntity): void {
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
    ): Promise<PayloadEntity> {
        // Can't inject SocketService at the top of the file because of circular dependency
        const socketService = Container.get(SocketService);

        const payloadEntity = this.payloadRepository.create({
            ...payload,
            status: PayloadStatus.PENDING,
            existingAPKName: existingAPK?.originalname,
            existingAPK: relative(
                config.APK_UPLOAD_PATH,
                existingAPK?.path ?? '',
            ),
        });

        const updatedEntity = await this.payloadRepository.save(payloadEntity);

        socketService.payloadsRoom.emit(
            ServerToWebEvents.PAYLOAD_ADDED,
            updatedEntity,
        );

        // Don't queue the job immediately, wait 3 seconds to allow the client to connect
        setTimeout(() => {
            this.queueJob(updatedEntity);
        }, 3000);

        return updatedEntity;
    }

    public async findById(id: string): Promise<PayloadEntity | null> {
        return await this.payloadRepository.findOne({ where: { id } });
    }

    public async list(): Promise<PayloadEntity[]> {
        return await this.payloadRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    public async delete(id: string): Promise<void> {
        await this.payloadRepository.delete({ id });
    }
}
