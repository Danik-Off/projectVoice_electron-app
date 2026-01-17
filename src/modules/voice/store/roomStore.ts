import { makeAutoObservable, runInAction } from 'mobx';
import { SocketClient, eventBus, VOICE_EVENTS } from '../../../core';
import { getToken } from '../../../shared/utils/storage';
import WebRTCClient from '../utils/WebRTCClient';
import { audioSettingsStore } from '../../../core';
import { notificationStore } from '../../../core';
import voiceActivityService, { type VoiceActivityEvent } from '../services/VoiceActivityService';
import type { Signal } from '../types/WebRTCClient.types';
import type {
    VoiceChannelConnectedEvent,
    VoiceChannelDisconnectedEvent,
    VoiceParticipantJoinedEvent,
    VoiceParticipantLeftEvent,
    VoiceParticipantsUpdatedEvent
} from '../../../core/events/events';
import type { UserData, Participant } from '../types/roomStore.types';

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

        // Убираем автоматическую инициализацию аудио из конструктора
        // Аудио будет инициализироваться только при подключении к голосовому каналу
        console.log('VoiceRoomStore: Constructor initialized (audio will be initialized on voice channel join)');
    }

    public connectToRoom(roomId: number, channelName?: string): void {
        // Проверяем, не подключен ли уже пользователь к голосовой комнате
        if (this.currentVoiceChannel) {
            if (this.currentVoiceChannel.id === roomId) {
                console.log('VoiceRoomStore: Already connected to this voice channel, just opening interface');
                notificationStore.addNotification(
                    `Вы уже подключены к голосовому каналу: ${this.currentVoiceChannel.name}`,
                    'info'
                );
                return;
            }
            console.log('VoiceRoomStore: Switching from channel', this.currentVoiceChannel.id, 'to channel', roomId);
            // Отключаемся от текущего канала перед подключением к новому
            this.disconnectToRoom();
        }

        const token = getToken(); // TODO отказаться от токена здесь и отправлять его при завпросе на подключение к серверу
        this.socketClient.socketEmit('join-room', roomId, token);

        // Инициализируем аудио только при подключении к голосовому каналу
        console.log('VoiceRoomStore: Initializing audio settings for voice channel...');
        audioSettingsStore.initMedia();

        // Инициализируем WebRTC и VAS при подключении к голосовому каналу
        console.log('VoiceRoomStore: Initializing WebRTC and VAS for voice call...');
        this.webRTCClient.initializeMedia();

        // Устанавливаем currentVoiceChannel напрямую (store уже observable через makeAutoObservable)
        this.currentVoiceChannel = { id: roomId, name: channelName || `Voice Channel ${roomId}` };
        console.log('VoiceRoomStore: currentVoiceChannel set to:', this.currentVoiceChannel);
        notificationStore.addNotification(
            `Подключились к голосовому каналу: ${channelName || `Voice Channel ${roomId}`}`,
            'info'
        );

        // Публикуем событие о подключении к голосовому каналу
        eventBus.emit(VOICE_EVENTS.CHANNEL_CONNECTED, {
            channelId: roomId,
            channelName: channelName || `Voice Channel ${roomId}`
        } as VoiceChannelConnectedEvent);
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
        console.log('VoiceRoomStore: Cleaning up audio resources after voice call...');
        audioSettingsStore.cleanup();

        // Очищаем VAS при отключении от голосового канала
        console.log('VoiceRoomStore: Cleaning up VAS after voice call...');
        voiceActivityService.cleanup();

        // Сохраняем ID канала перед очисткой для события
        const disconnectedChannelId = this.currentVoiceChannel?.id;

        // Устанавливаем currentVoiceChannel в null напрямую (store уже observable)
        this.currentVoiceChannel = null;
        console.log('VoiceRoomStore: currentVoiceChannel set to null');
        // Сбрасываем состояние активности речи для всех участников
        this.participants.forEach((participant) => {
            participant.isSpeaking = false;
        });

        // Публикуем событие об отключении от голосового канала
        if (disconnectedChannelId) {
            eventBus.emit(VOICE_EVENTS.CHANNEL_DISCONNECTED, {
                channelId: disconnectedChannelId
            } as VoiceChannelDisconnectedEvent);
        }
    }
    public muteMicrophone() {
        audioSettingsStore.setVolume(0);
    }
    public unmuteMicrophone() {
        audioSettingsStore.setVolume(100);
    }

    private setupServerResponseListeners() {
        this.socketClient.socketOn('connect', () => {
            console.log('Соединение с Socket.IO установлено');
        });
        this.socketClient.socketOn('created', (data: unknown) => {
            const room = data as { participants: Participant[] };
            console.log('Вы подключены ', room);
            runInAction(() => {
                // Исключаем локального пользователя из списка участников
                // так как он отображается отдельно в UI
                this.participants = room.participants.filter(
                    (participant: Participant) => participant.socketId !== this.socketClient.getSocketId()
                );
            });

            // Публикуем событие об обновлении участников
            eventBus.emit(VOICE_EVENTS.PARTICIPANTS_UPDATED, {
                participants: this.participants
            } as VoiceParticipantsUpdatedEvent);
        });
        this.socketClient.socketOn('user-connected', (data: unknown) => {
            const user = data as { socketId: string; userData: UserData };
            console.log(`Пользователь ${user.userData?.username || user.socketId} подключен`);
            this.webRTCClient.createOffer(user.socketId);
            runInAction(() => {
                // Проверяем, что это не локальный пользователь
                if (user.socketId !== this.socketClient.getSocketId()) {
                    const participant: Participant = {
                        socketId: user.socketId,
                        micToggle: true,
                        userData: user.userData,
                        isSpeaking: false
                    };
                    this.participants.push(participant);

                    // Публикуем событие о присоединении участника
                    eventBus.emit(VOICE_EVENTS.PARTICIPANT_JOINED, {
                        participant
                    } as VoiceParticipantJoinedEvent);
                }
            });
            notificationStore.addNotification(
                `${user.userData?.username || 'Пользователь'} присоединился к голосовому каналу`,
                'info'
            );
        });
        this.socketClient.socketOn('user-disconnected', (data: unknown) => {
            const socketId = data as string;
            console.log(`Пользователь отключен: ${socketId}`);
            const disconnectedUser = this.participants.find((user) => user.socketId === socketId);
            this.webRTCClient.disconnectPeer(socketId);
            runInAction(() => {
                this.participants = this.participants.filter((user) => user.socketId !== socketId);
            });

            // Публикуем событие об отключении участника
            eventBus.emit(VOICE_EVENTS.PARTICIPANT_LEFT, {
                socketId
            } as VoiceParticipantLeftEvent);

            if (disconnectedUser) {
                notificationStore.addNotification(
                    `${disconnectedUser.userData?.username || 'Пользователь'} покинул голосовой канал`,
                    'info'
                );
            }
        });
        this.socketClient.socketOn('signal', (data: unknown) => {
            const signal = data as Signal;
            console.log('Сигнал', signal);
            // Преобразуем Signal (с полем 'to') в формат, ожидаемый handleSignal (с полем 'from')
            this.webRTCClient.handleSignal({
                from: signal.to,
                type: signal.type,
                sdp: 'sdp' in signal ? signal.sdp : undefined,
                candidate:
                    'candidate' in signal
                        ? {
                              candidate: signal.candidate.candidate,
                              sdpMLineIndex: signal.candidate.sdpMLineIndex,
                              sdpMid: signal.candidate.sdpMid
                          }
                        : undefined
            });
        });
        this.socketClient.socketOn('connect_error', (data: unknown) => {
            const error = data as Error;
            console.error('Ошибка Socket.IO подключения:', error);
            notificationStore.addNotification('notifications.connectError', 'error');
        });
        this.socketClient.socketOn('disconnect', () => {
            console.log('Соединение с Socket.IO закрыто');
        });
    }
    private setupWebRTCSenders() {
        this.webRTCClient.sendSignal = (signal) => {
            this.socketClient.socketEmit('signal', signal);
        };
        this.webRTCClient.changeState = (id, event) => {
            console.log(`Изменен статус ${id}`, event);
        };
    }

    private setupVoiceActivityListeners(): void {
        voiceActivityService.addCallback((event: VoiceActivityEvent) => {
            runInAction(() => {
                if (event.userId === 'local') {
                    // Публикуем событие об изменении состояния локального пользователя
                    eventBus.emit(VOICE_EVENTS.LOCAL_SPEAKING_STATE_CHANGED, {
                        isSpeaking: event.isActive
                    });
                } else {
                    const participant = this.participants.find((p) => p.socketId === event.userId);
                    if (participant) {
                        participant.isSpeaking = event.isActive;

                        // Публикуем событие об обновлении участников
                        eventBus.emit(VOICE_EVENTS.PARTICIPANTS_UPDATED, {
                            participants: this.participants
                        } as VoiceParticipantsUpdatedEvent);
                    }
                }
            });
        });
    }

    // Получить состояние активности речи для участника
    public getParticipantSpeakingState(socketId: string): boolean {
        const participant = this.participants.find((p) => p.socketId === socketId);
        return participant?.isSpeaking || false;
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
