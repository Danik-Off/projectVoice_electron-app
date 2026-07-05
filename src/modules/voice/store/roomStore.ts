import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { SocketClient, eventBus, VOICE_EVENTS, audioSettingsStore, notificationStore } from '../../../core';
import { getToken } from '../../../shared/utils/storage';
import WebRTCClient from '../utils/WebRTCClient';
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

        // Рассылаем собеседникам реальное состояние мьюта при его изменении,
        // чтобы иконка микрофона у других участников не была фиктивной
        reaction(
            () => audioSettingsStore.isMicrophoneMuted,
            (muted) => {
                if (this.currentVoiceChannel != null) {
                    this.broadcastMicState(muted);
                }
            }
        );

        // Убираем автоматическую инициализацию аудио из конструктора
        // Аудио будет инициализироваться только при подключении к голосовому каналу
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

        const token = getToken(); // TODO отказаться от токена здесь и отправлять его при завпросе на подключение к серверу
        this.socketClient.socketEmit('join-room', roomId, token);

        // Инициализируем аудио только при подключении к голосовому каналу

        audioSettingsStore.initMedia();

        // Инициализируем WebRTC и VAS при подключении к голосовому каналу

        this.webRTCClient.initializeMedia().catch((error) => {
            console.error('Error initializing WebRTC media:', error);
        });

        // Устанавливаем currentVoiceChannel напрямую (store уже observable через makeAutoObservable)
        const channelNameValue = channelName ?? `Voice Channel ${roomId}`;
        this.currentVoiceChannel = { id: roomId, name: channelNameValue };

        notificationStore.addNotification(`Подключились к голосовому каналу: ${channelNameValue}`, 'info');

        // Публикуем событие о подключении к голосовому каналу
        const connectedEvent: VoiceChannelConnectedEvent = {
            channelId: roomId,
            channelName: channelNameValue
        };
        eventBus.emit(VOICE_EVENTS.CHANNEL_CONNECTED, connectedEvent);
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

        // Сохраняем ID канала перед очисткой для события
        const disconnectedChannelId = this.currentVoiceChannel?.id;

        // Устанавливаем currentVoiceChannel в null напрямую (store уже observable)
        this.currentVoiceChannel = null;

        // Сбрасываем состояние активности речи для всех участников
        this.participants.forEach((participant) => {
            // eslint-disable-next-line no-param-reassign -- Необходимо обновить состояние участника
            participant.isSpeaking = false;
        });

        // Публикуем событие об отключении от голосового канала
        if (disconnectedChannelId != null) {
            const disconnectedEvent: VoiceChannelDisconnectedEvent = {
                channelId: disconnectedChannelId
            };
            eventBus.emit(VOICE_EVENTS.CHANNEL_DISCONNECTED, disconnectedEvent);
        }
    }
    private setupServerResponseListeners() {
        // this.socketClient.socketOn('connect', () => {
        //     console.log('Соединение с Socket.IO установлено');
        // });
        this.socketClient.socketOn('created', (data: unknown) => {
            const roomData = data as { participants: Participant[] };
            const room: { participants: Participant[] } = {
                participants: roomData.participants
            };

            runInAction(() => {
                // Исключаем локального пользователя из списка участников
                // так как он отображается отдельно в UI
                this.participants = room.participants.filter(
                    (participant: Participant) => participant.socketId !== this.socketClient.getSocketId()
                );
            });

            // Публикуем событие об обновлении участников
            const participantsUpdatedEvent: VoiceParticipantsUpdatedEvent = {
                participants: this.participants
            };
            eventBus.emit(VOICE_EVENTS.PARTICIPANTS_UPDATED, participantsUpdatedEvent);
        });
        this.socketClient.socketOn('user-connected', (data: unknown) => {
            const userData = data as { socketId: string; userData: UserData };
            const user: { socketId: string; userData: UserData } = {
                socketId: userData.socketId,
                userData: userData.userData
            };
            const username = user.userData?.username ?? user.socketId;
            console.warn(`Пользователь ${username} подключен`);
            this.webRTCClient.createOffer(user.socketId).catch((error) => {
                console.error('Error creating offer:', error);
            });
            // Сообщаем новому участнику наше текущее состояние микрофона
            this.webRTCClient.sendSignal?.({
                to: user.socketId,
                type: 'mic-state',
                muted: audioSettingsStore.isMicrophoneMuted
            });
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
                    const participantJoinedEvent: VoiceParticipantJoinedEvent = {
                        participant
                    };
                    eventBus.emit(VOICE_EVENTS.PARTICIPANT_JOINED, participantJoinedEvent);
                }
            });
            const joinedUsername = user.userData?.username ?? 'Пользователь';
            notificationStore.addNotification(`${joinedUsername} присоединился к голосовому каналу`, 'info');
        });
        this.socketClient.socketOn('user-disconnected', (data: unknown) => {
            const socketId = data as string;

            const disconnectedUser = this.participants.find((user) => user.socketId === socketId);
            this.webRTCClient.disconnectPeer(socketId);
            runInAction(() => {
                this.participants = this.participants.filter((user) => user.socketId !== socketId);
            });

            // Публикуем событие об отключении участника
            const participantLeftEvent: VoiceParticipantLeftEvent = {
                socketId
            };
            eventBus.emit(VOICE_EVENTS.PARTICIPANT_LEFT, participantLeftEvent);

            if (disconnectedUser != null) {
                const disconnectedUsername = disconnectedUser.userData?.username ?? 'Пользователь';
                notificationStore.addNotification(`${disconnectedUsername} покинул голосовой канал`, 'info');
            }
        });
        this.socketClient.socketOn('signal', (data: unknown) => {
            this.handleIncomingSignal(data);
        });
        this.socketClient.socketOn('connect_error', (data: unknown) => {
            const connectError = data as Error;
            console.error('Ошибка Socket.IO подключения:', connectError);
            notificationStore.addNotification('notifications.connectError', 'error');
        });

        // this.socketClient.socketOn('disconnect', () => {
        //     console.log('Соединение с Socket.IO закрыто');
        // });
    }

    private handleIncomingSignal(data: unknown): void {
        const signalData = data as Signal & { from?: string };

        // Сервер при релее сигнала кладёт id отправителя в поле 'from', а не 'to'
        // ('to' - это поле для ИСХОДЯЩИХ сигналов, куда мы адресуем сообщение через
        // sendSignal). Раньше здесь ошибочно читалось signalData.to, из-за чего id
        // отправителя всегда получался undefined - предпочитаем 'from', если оно есть
        const signalFrom = signalData.from ?? signalData.to;
        const signalType = signalData.type;

        if (signalFrom == null) {
            console.error('WebRTCClient: Incoming signal has no sender id (from/to):', signalData);
            return;
        }

        // 'mic-state' - не WebRTC-сигнал, а сообщение о реальном состоянии мьюта
        // собеседника; обновляем участника и не отдаём это webRTCClient.handleSignal
        if (signalType === 'mic-state') {
            const muted = signalData.muted;
            runInAction(() => {
                const participant = this.participants.find((p) => p.socketId === signalFrom);
                if (participant != null) {
                    participant.micToggle = !muted;
                }
            });
            return;
        }

        const signalSdp = 'sdp' in signalData && signalData.sdp != null ? signalData.sdp : null;
        const signalCandidate = 'candidate' in signalData && signalData.candidate != null ? signalData.candidate : null;

        const handleSignalData: { from: string; type: string; sdp?: string; candidate?: RTCIceCandidateInit } = {
            from: signalFrom,
            type: signalType
        };
        if (signalSdp != null) {
            handleSignalData.sdp = signalSdp;
        }
        if (signalCandidate != null) {
            const candidateInit: RTCIceCandidateInit = {
                candidate: String(signalCandidate.candidate),
                sdpMLineIndex: signalCandidate.sdpMLineIndex != null ? Number(signalCandidate.sdpMLineIndex) : null,
                sdpMid: signalCandidate.sdpMid != null ? String(signalCandidate.sdpMid) : null
            };
            handleSignalData.candidate = candidateInit;
        }
        this.webRTCClient.handleSignal(handleSignalData).catch((signalError: unknown) => {
            console.error('Error handling signal:', signalError);
        });
    }

    // Рассылка реального состояния мьюта всем текущим участникам голосового канала
    private broadcastMicState(muted: boolean): void {
        this.participants.forEach((participant) => {
            this.webRTCClient.sendSignal?.({
                to: participant.socketId,
                type: 'mic-state',
                muted
            });
        });
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
                if (voiceEvent.userId === 'local') {
                    // Публикуем событие об изменении состояния локального пользователя
                    eventBus.emit(VOICE_EVENTS.LOCAL_SPEAKING_STATE_CHANGED, {
                        isSpeaking: voiceEvent.isActive
                    });
                } else {
                    const participant = this.participants.find((p) => p.socketId === voiceEvent.userId);
                    if (participant != null) {
                        participant.isSpeaking = voiceEvent.isActive;

                        // Публикуем событие об обновлении участников
                        const participantsUpdatedEvent: VoiceParticipantsUpdatedEvent = {
                            participants: this.participants
                        };
                        eventBus.emit(VOICE_EVENTS.PARTICIPANTS_UPDATED, participantsUpdatedEvent);
                    }
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
