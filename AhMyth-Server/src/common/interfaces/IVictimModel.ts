import { type VictimStatus } from '../enums';
import { type IBaseModel } from './IBaseModel';

export interface IVictimModel extends IBaseModel {
    deviceId: string;
    ip: string;
    port: number;
    country: string;
    manf: string;
    model: string;
    release: string;
    status: VictimStatus;
}
