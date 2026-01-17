import { makeAutoObservable, runInAction } from 'mobx';
import SocketClient from '../utils/SocketClient';
import { getCookie } from '../utils/cookie';
import WebRTCClient from '../utils/WebRTCClient';
import audioSettingsStore from './AudioSettingsStore';
import notificationStore from './NotificationStore';
import voiceActivityService, { type VoiceActivityEvent } from '../services/VoiceActivityService';
import type { UserData, Participant } from '../modules/voice/types/roomStore.types';

export class VoiceRoomStore {
    public participants: Participant[] = [];
    public currentVoiceChannel: { id: number; name: string } | null = null;
    public state = '';

    private socketClient: SocketClient = new SocketClient();
    public webRTCClient: WebRTCClient = new WebRTCClient();

    public constructor() {
        makeAutoObservable(this);
        this.socketClient.connect();
        this.setupServerResponseListeners();
        this.setupWebRTCSenders();
        this.setupVoiceActivityListeners();
    }

    public connectToRoom(roomId: number, channelName?: string): void {
        // Проверяем, не подключен ли уже пользователь к голосовой комнате
        if (this.currentVoiceChannel) {
            if (this.currentVoiceChannel.id === roomId) {
                notificationStore.addNotification(
                    `Вы уже подключены к голосовому каналу: ${this.currentVoiceChannel.name}`,
                    'info'
                );
                return;
            }

            // Отключаемся от текущего канала перед подключением к новому
            this.disconnectToRoom();
        }

        const token = getCookie('token'); // TODO отказаться от токена здесь и отправлять его при завпросе на подключение к серверу
        this.socketClient.socketEmit('join-room', roomId, token);

        // Инициализируем аудио только при подключении к голосовому каналу

        audioSettingsStore.initMedia();

        // Инициализируем WebRTC и VAS при подключении к голосовому каналу

        this.webRTCClient.initializeMedia();

        runInAction(() => {
            this.currentVoiceChannel = { id: roomId, name: channelName ?? `Voice Channel ${roomId}` };
        });
        notificationStore.addNotification(
            `Подключились к голосовому каналу: ${channelName ?? `Voice Channel ${roomId}`}`,
            'info'
        );
    }
    // Проверка, подключен ли пользователь к голосовой комнате
    public isConnectedToVoiceChannel(): boolean {
        return this.currentVoiceChannel !== null;
    }

    // Получение информации о текущем голосовом канале
    public getCurrentVoiceChannel(): { id: number; name: string } | null {
        return this.currentVoiceChannel;
    }

    public disconnectToRoom(): void {
        this.socketClient.socketEmit('leave-room');
        this.webRTCClient.disconect();

        // Очищаем аудио ресурсы при отключении от голосового канала
        audioSettingsStore.cleanup();

        // Очищаем VAS при отключении от голосового канала
        voiceActivityService.cleanup();

        runInAction(() => {
            this.currentVoiceChannel = null;
            // Сбрасываем состояние активности речи для всех участников
            this.participants.forEach((participant) => {
                // eslint-disable-next-line no-param-reassign -- Необходимо обновить состояние участника
                participant.isSpeaking = false;
            });
        });
    }
    public muteMicrophone() {
        audioSettingsStore.setVolume(0);
    }
    public unmuteMicrophone() {
        audioSettingsStore.setVolume(100);
    }

    private setupServerResponseListeners() {
        // this.socketClient.socketOn('connect', () => {
        //     console.log('Соединение с Socket.IO установлено');
        // });
        this.socketClient.socketOn('created', (room: unknown) => {
            const roomData = room as { participants: Participant[] };
            runInAction(() => {
                // Исключаем локального пользователя из списка участников
                // так как он отображается отдельно в UI
                this.participants = roomData.participants.filter(
                    (participant: Participant) => participant.socketId !== this.socketClient.getSocketId()
                );
            });
        });
        this.socketClient.socketOn('user-connected', (data: unknown) => {
            const user = data as { socketId: string; userData: UserData };
            this.webRTCClient.createOffer(user.socketId).catch(() => {
                // Error handled in createOffer
            });
            runInAction(() => {
                // Проверяем, что это не локальный пользователь
                if (user.socketId !== this.socketClient.getSocketId()) {
                    this.participants.push({
                        socketId: user.socketId,
                        micToggle: true,
                        userData: user.userData,
                        isSpeaking: false
                    });
                }
            });
            notificationStore.addNotification(
                `${user.userData?.username || 'Пользователь'} присоединился к голосовому каналу`,
                'info'
            );
        });
        this.socketClient.socketOn('user-disconnected', (data: unknown) => {
            const socketId = data as string;
            const disconnectedUser = this.participants.find((user) => user.socketId === socketId);
            this.webRTCClient.disconnectPeer(socketId);
            runInAction(() => {
                this.participants = this.participants.filter((user) => user.socketId !== socketId);
            });
            if (disconnectedUser) {
                notificationStore.addNotification(
                    `${disconnectedUser.userData?.username || 'Пользователь'} покинул голосовой канал`,
                    'info'
                );
            }
        });
        this.socketClient.socketOn('signal', (data: unknown) => {
            this.webRTCClient
                .handleSignal(data as { from: string; type: string; sdp?: string; candidate?: RTCIceCandidateInit })
                .catch(() => {
                    // Error handled in handleSignal
                });
        });
        this.socketClient.socketOn('connect_error', (connectError: unknown) => {
            console.error('Ошибка Socket.IO подключения:', connectError);
            notificationStore.addNotification('notifications.connectError', 'error');
        });
        // this.socketClient.socketOn('disconnect', () => {
        //     console.log('Соединение с Socket.IO закрыто');
        // });
    }
    private setupWebRTCSenders() {
        this.webRTCClient.sendSignal = (signal) => {
            this.socketClient.socketEmit('signal', signal);
        };
        // this.webRTCClient.changeState = (id, event) => {
        //     console.log(`Изменен статус ${id}`, event);
        // };
    }

    private setupVoiceActivityListeners(): void {
        voiceActivityService.addCallback((voiceEvent: VoiceActivityEvent) => {
            runInAction(() => {
                const participant = this.participants.find((p) => p.socketId === voiceEvent.userId);
                if (participant != null) {
                    participant.isSpeaking = voiceEvent.isActive;
                }
            });
        });
    }

    // Получить состояние активности речи для участника
    public getParticipantSpeakingState(socketId: string): boolean {
        const participant = this.participants.find((p) => p.socketId === socketId);
        return participant?.isSpeaking ?? false;
    }

    // Получить состояние активности речи для локального пользователя
    public getLocalSpeakingState(): boolean {
        return voiceActivityService.getUserActivity('local');
    }

    // Получить уровень громкости участника
    public getParticipantVolumeLevel(socketId: string): number {
        return voiceActivityService.getUserVolume(socketId);
    }

    // Получить уровень громкости локального пользователя
    public getLocalVolumeLevel(): number {
        return voiceActivityService.getUserVolume('local');
    }
}
const voiceRoomStore = new VoiceRoomStore();
export default voiceRoomStore;
