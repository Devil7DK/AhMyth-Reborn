import { type WebToServerEvents } from '../enums';

export interface IWebToServerEvents {
    [WebToServerEvents.LISTEN_FOR_VICTIMS]: () => void;
    [WebToServerEvents.STOP_LISTENING_FOR_VICTIMS]: () => void;
}
