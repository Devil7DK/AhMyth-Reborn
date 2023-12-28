import { type ServerToWebEvents } from '../enums';
import { type IBaseEntity } from './IBaseEntity';
import { type IVictim } from './IVictim';

export interface IServerToWebEvents {
    [ServerToWebEvents.VICTIM_CONNECTED]: (
        victim: IBaseEntity & IVictim,
    ) => void;
    [ServerToWebEvents.VICTIM_DISCONNECTED]: (
        victim: IBaseEntity & IVictim,
    ) => void;
    [ServerToWebEvents.VICTIM_LISTENING_STATUS]: (listening: boolean) => void;
}
