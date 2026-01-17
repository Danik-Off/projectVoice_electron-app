import { io, type Socket } from 'socket.io-client';
import { getCookie } from './cookie';
import { BASE_URL } from '../configs/apiConfig';
import { connectionStore } from '../core/store/ConnectionStore';

class SocketClient {
    private token: string;
    private socket: Socket | null;

    public constructor() {
        this.token = getCookie('token') ?? '';
        this.socket = null;
    }

    public connect() {
        if (this.socket?.connected === true) {
            return;
        }

        this.socket = io(BASE_URL, {
            path: '/socket',
            query: { token: this.token },
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        this.socket.on('connect', () => {
            // Соединение с Socket.IO установлено
            connectionStore.setConnected(true);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            connectionStore.setConnected(false);
        });

        this.socket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect' || reason === 'transport close') {
                connectionStore.setConnected(false);
            }
        });
    }

    public socketOn(ev: string, listner: (data: unknown) => void) {
        if (this.socket) {
            this.socket.on(ev, listner);
        }
    }

    public socketEmit(ev: string, ...args: unknown[]) {
        if (this.socket) {
            this.socket.emit(ev, ...args);
        }
    }

    public getSocketId(): string | undefined {
        return this.socket?.id;
    }
}

export default SocketClient;
