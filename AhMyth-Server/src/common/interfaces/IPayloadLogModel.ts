import { type PayloadLogStatus } from '../enums';
import { type IBaseModel } from './IBaseModel';

export interface IPayloadLogModel extends IBaseModel {
    payloadId: string;
    status: PayloadLogStatus;
    message: string;
    error?: string;
}
