import { type ServerToWebEvents } from '../enums';
import { type IPayloadLogModel } from './IPayloadLogModel';
import { type IPayloadModel } from './IPayloadModel';
import { type IVictimModel } from './IVictimModel';

export interface IServerToWebEvents
    // eslint-disable-next-line @typescript-eslint/ban-types
    extends Record<ServerToWebEvents, Function> {
    [ServerToWebEvents.VICTIM_CONNECTED]: (victim: IVictimModel) => void;
    [ServerToWebEvents.VICTIM_DISCONNECTED]: (victim: IVictimModel) => void;
    [ServerToWebEvents.VICTIM_LISTENING_STATUS]: (listening: boolean) => void;

    [ServerToWebEvents.PAYLOAD_LIST]: (payloads: IPayloadModel[]) => void;
    [ServerToWebEvents.PAYLOAD_ADDED]: (payload: IPayloadModel) => void;
    [ServerToWebEvents.PAYLOAD_UPDATED]: (payload: IPayloadModel) => void;
    [ServerToWebEvents.PAYLOAD_DELETED]: (payloadId: string) => void;
    [ServerToWebEvents.PAYLOAD_LOG_ADDED]: (
        payloadLog: IPayloadLogModel,
    ) => void;
    [ServerToWebEvents.PAYLOAD_LOG_UPDATED]: (
        payloadLog: IPayloadLogModel,
    ) => void;
}
