import { type PayloadStatus } from '../enums';
import { type IBaseEntity } from './IBaseEntity';
import { type IGenerateAPKPayload } from './IGenerateAPKPayload';
import { type IPayloadLogEntity } from './IPayloadLogEntity';

export interface IPayloadEntity extends IBaseEntity, IGenerateAPKPayload {
    logs: IPayloadLogEntity[];
    existingAPKName?: string;
    status: PayloadStatus;
}
