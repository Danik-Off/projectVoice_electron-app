/**
 * Socket.io Client - базовый клиент для WebSocket соединений
 */
import { io, Socket } from 'socket.io-client';
import { getToken } from '../../shared/utils/storage';
import { appConfig } from '../config';

class SocketClient {
    private token: string;
    private socket: Socket | null;

    public constructor() {
        this.token = getToken() || '';
        this.socket = null;
    }

    public connect() {
        if (this.socket && this.socket.connected) {
            return;
        }

        // Всегда получаем актуальный токен из localStorage
        this.token = getToken() || '';

        this.socket = io(appConfig.socket.url, {
            path: appConfig.socket.path,
            query: { token: this.token },
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        this.socket.on('connect', () => {
            // Соединение с Socket.IO установлено
        });
    }

    public socketOn(ev: string, listner: (data: any) => void) {
        this.socket && this.socket.on(ev, listner);
    }

    public socketEmit(ev: string, ...args: any) {
        this.socket && this.socket.emit(ev, ...args);
    }

    public getSocketId(): string | undefined {
        return this.socket?.id;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export default SocketClient;

