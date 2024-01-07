import { type ServerToWebEvents } from '../enums';
import { type IBaseEntity } from './IBaseEntity';
import { type IPayloadEntity } from './IPayloadEntity';
import { type IPayloadLogEntity } from './IPayloadLogEntity';
import { type IVictim } from './IVictim';

export interface IServerToWebEvents
    // eslint-disable-next-line @typescript-eslint/ban-types
    extends Record<ServerToWebEvents, Function> {
    [ServerToWebEvents.VICTIM_CONNECTED]: (
        victim: IBaseEntity & IVictim,
    ) => void;
    [ServerToWebEvents.VICTIM_DISCONNECTED]: (
        victim: IBaseEntity & IVictim,
    ) => void;
    [ServerToWebEvents.VICTIM_LISTENING_STATUS]: (listening: boolean) => void;

    [ServerToWebEvents.PAYLOAD_LIST]: (payloads: IPayloadEntity[]) => void;
    [ServerToWebEvents.PAYLOAD_ADDED]: (payload: IPayloadEntity) => void;
    [ServerToWebEvents.PAYLOAD_UPDATED]: (payload: IPayloadEntity) => void;
    [ServerToWebEvents.PAYLOAD_DELETED]: (payloadId: string) => void;
    [ServerToWebEvents.PAYLOAD_LOG_ADDED]: (
        payloadLog: IPayloadLogEntity,
    ) => void;
    [ServerToWebEvents.PAYLOAD_LOG_UPDATED]: (
        payloadLog: IPayloadLogEntity,
    ) => void;
}
