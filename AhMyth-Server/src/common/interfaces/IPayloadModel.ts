import { type PayloadStatus } from '../enums';
import { type IBaseModel } from './IBaseModel';
import { type IGenerateAPKPayload } from './IGenerateAPKPayload';
import { type IPayloadLogModel } from './IPayloadLogModel';

export interface IPayloadModel extends IBaseModel, IGenerateAPKPayload {
    logs: IPayloadLogModel[];
    existingAPKName?: string;
    status: PayloadStatus;
}
