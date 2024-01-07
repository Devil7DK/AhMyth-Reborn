import { randomUUID } from 'crypto';
import { rm } from 'fs-extra';
import { diskStorage, type Options as MulterOptions } from 'multer';
import { resolve } from 'path';
import {
    BadRequestError,
    Body,
    Delete,
    JsonController,
    Post,
    UploadedFile,
} from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { PackagingMode, ServerToWebEvents } from '../../common/enums';
import { type IObjectResponse, type IResponse } from '../../common/interfaces';
import { config } from '../config';
import { GenerateAPKPayload } from '../dtos';
import { type PayloadEntity } from '../entities';
import { logger } from '../logger';
import { PayloadService, SocketService } from '../services';

const uploadOptions: MulterOptions = {
    fileFilter(_, file, callback) {
        if (!file.originalname.endsWith('.apk')) {
            callback(new BadRequestError('Only APK files are allowed'));
        } else {
            callback(null, true);
        }
    },
    storage: diskStorage({
        destination: config.APK_UPLOAD_PATH,
        filename: (_, __, callback) => {
            callback(null, `${randomUUID()}.apk`);
        },
    }),
};

@Service()
@JsonController('/payload')
export class PayloadController {
    @Inject(() => PayloadService)
    private readonly payloadService!: PayloadService;

    @Inject(() => SocketService)
    private readonly socketService!: SocketService;

    @Post('/generate-apk')
    public async generateApk(
        @Body() body: GenerateAPKPayload,
        @UploadedFile('existingAPK', {
            required: false,
            options: uploadOptions,
        })
        existingAPK?: Express.Multer.File,
    ): Promise<IObjectResponse<PayloadEntity>> {
        if (
            body.packagingMode === PackagingMode.BIND_TO_EXISTING_APK &&
            (existingAPK === undefined || existingAPK === null)
        ) {
            throw new BadRequestError(
                'Existing APK file is required when packaging mode is set to BIND_TO_EXISTING_APK',
            );
        }

        const payload = await this.payloadService.create(body, existingAPK);

        return {
            message: 'Payload generation started successfully',
            data: payload,
        };
    }

    @Delete('/:id')
    public async delete(id: string): Promise<IResponse> {
        const payload = await this.payloadService.findById(id);

        if (!payload) {
            throw new BadRequestError('Payload not found');
        }

        await this.payloadService.delete(id);

        try {
            await rm(
                resolve(
                    process.cwd(),
                    config.APK_OUTPUT_PATH,
                    `${payload.id}.apk`,
                ),
            );
        } catch (error) {
            logger.warn(`Failed to delete APK file for payload ${payload.id}`, {
                label: 'payload',
                action: 'delete',
                error,
            });
        }

        this.socketService.payloadsRoom.emit(
            ServerToWebEvents.PAYLOAD_DELETED,
            payload.id,
        );

        return {
            message: 'Payload deleted successfully',
        };
    }
}
