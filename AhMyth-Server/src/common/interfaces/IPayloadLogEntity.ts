import { type PayloadLogStatus } from '../enums';
import { type IBaseEntity } from './IBaseEntity';

export interface IPayloadLogEntity extends IBaseEntity {
    payloadId: string;
    status: PayloadLogStatus;
    message: string;
    error?: string;
}
