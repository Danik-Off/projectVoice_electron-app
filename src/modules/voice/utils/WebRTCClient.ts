import { reaction } from 'mobx';
import { iceServers } from '../../../core';
import type { Signal } from '../types/WebRTCClient.types';
import { audioSettingsStore } from '../../../core';
import participantVolumeStore from '../store/ParticipantVolumeStore';
import voiceActivityService from '../services/VoiceActivityService';

interface ConnectionQuality {
    rtt: number;
    packetsLost: number;
    jitter: number;
    bitrate: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface ReconnectionState {
    attempts: number;
    maxAttempts: number;
    backoff: number;
    timer?: ReturnType<typeof setTimeout>;
}

class WebRTCClient {
    public sendSignal: null | ((signal: Signal) => void) = null;
    public changeState: null | ((id: string, signal: Event) => void) = null;

    private readonly remoteStreams: Map<string, MediaStream> = new Map();
    private readonly peerConnections: Map<string, RTCPeerConnection> = new Map();
    private readonly remoteAudioElements: Map<string, HTMLAudioElement> = new Map();
    private readonly audioContexts: Map<string, AudioContext> = new Map();
    private readonly gainNodes: Map<string, GainNode> = new Map();
    private readonly audioSources: Map<string, MediaStreamAudioSourceNode> = new Map();
    private readonly connectionQuality: Map<string, ConnectionQuality> = new Map();
    private readonly reconnectionStates: Map<string, ReconnectionState> = new Map();
    private readonly qualityMonitors: Map<string, ReturnType<typeof setInterval>> = new Map();
    private readonly defaultSampleRate = 48000;

    // Инициализация медиа с реакцией на изменения настроек
    public async initializeMedia() {
        voiceActivityService.initialize();

        if (audioSettingsStore.stream && audioSettingsStore.stream.getAudioTracks().length > 0) {
            this.setupLocalVoiceActivity();
        }

        // Реакция на изменения потока
        reaction(
            () => audioSettingsStore.stream,
            () => {
                this.resendlocalStream();
                this.setupLocalVoiceActivity();
            }
        );

        // Реакция на изменения настроек качества
        reaction(
            () => ({
                bitrate: audioSettingsStore.bitrate,
                sampleRate: audioSettingsStore.sampleRate,
                audioQuality: audioSettingsStore.audioQuality
            }),
            () => {
                this.updateAllConnectionsQuality();
            }
        );
    }

    // Создание peer connection с оптимизированными настройками
    public createPeerConnection(id: string) {
        const newPeerConnection = new RTCPeerConnection({
            iceServers,
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
            // Дополнительные оптимизации
            iceTransportPolicy: 'all' // Используем и STUN и TURN
        });

        // Обработка ICE кандидатов с улучшенной обработкой ошибок
        newPeerConnection.onicecandidate = (event) => {
            if (!event.candidate) {
                return;
            }

            if (!this.sendSignal) {
                return;
            }

            try {
                this.sendSignal({
                    to: id,
                    type: 'candidate',
                    candidate: event.candidate
                });
            } catch (error) {
                console.error('WebRTCClient: Error sending ICE candidate:', error);
            }
        };

        // Обработка изменений состояния соединения
        newPeerConnection.onconnectionstatechange = () => {
            const state = newPeerConnection.connectionState;

            if (this.changeState) {
                this.changeState(id, new Event('connectionstatechange'));
            }

            // Обработка проблем с соединением
            if (state === 'failed' || state === 'disconnected') {
                this.handleConnectionProblem(id, state);
            } else if (state === 'connected') {
                this.handleConnectionSuccess(id);
            }
        };

        // Обработка ICE соединения
        newPeerConnection.oniceconnectionstatechange = () => {
            const iceState = newPeerConnection.iceConnectionState;

            if (iceState === 'failed' || iceState === 'disconnected') {
                this.handleConnectionProblem(id, iceState);
            }
        };

        // Обработка получения треков
        newPeerConnection.ontrack = (event) => {
            if (event.track.kind === 'audio') {
                this.addRemoteStream(event.track, id);
            }
        };

        this.peerConnections.set(id, newPeerConnection);
        this.addLocalStream(id);

        // Начинаем мониторинг качества соединения
        this.startQualityMonitoring(id);

        return newPeerConnection;
    }

    // Создание offer с оптимизацией под настройки качества
    public async createOffer(id: string) {
        const peerConnection = this.createPeerConnection(id);

        try {
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            });

            // Оптимизируем SDP с учетом настроек качества
            const modifiedSdp = this.optimizeSdpWithSettings(offer.sdp || '');
            const optimizedOffer: RTCSessionDescriptionInit = {
                type: offer.type,
                sdp: modifiedSdp
            };

            await peerConnection.setLocalDescription(optimizedOffer);
            const sdp = optimizedOffer.sdp;

            if (!this.sendSignal) {
                console.error('WebRTCClient: sendSignal not available');
                return;
            }

            if (!sdp) {
                console.error('WebRTCClient: Offer SDP is empty');
                return;
            }

            this.sendSignal({
                to: id,
                type: 'offer',
                sdp
            });
        } catch (error) {
            console.error('WebRTCClient: Error creating offer:', error);
            this.handleConnectionError(id, error);
        }
    }

    // Создание answer с оптимизацией
    public async createAnswer(id: string) {
        const peerConnection = this.peerConnections.get(id);

        if (!peerConnection) {
            console.error('WebRTCClient: Peer connection not found for', id);
            return;
        }

        try {
            const answer = await peerConnection.createAnswer({
                voiceActivityDetection: true
            });

            // Оптимизируем SDP с учетом настроек качества
            const modifiedSdp = this.optimizeSdpWithSettings(answer.sdp || '');
            const optimizedAnswer = { ...answer, sdp: modifiedSdp };

            await peerConnection.setLocalDescription(optimizedAnswer);
            const sdp = optimizedAnswer.sdp;

            if (!this.sendSignal) {
                console.error('WebRTCClient: sendSignal not available');
                return;
            }

            if (!sdp) {
                console.error('WebRTCClient: Answer SDP is empty');
                return;
            }

            this.sendSignal({
                to: id,
                type: 'answer',
                sdp
            });
        } catch (error) {
            console.error('WebRTCClient: Error creating answer:', error);
            this.handleConnectionError(id, error);
        }
    }

    // Обработка сигналов с улучшенной обработкой ошибок
    public async handleSignal(data: { from: string; type: string; sdp?: string; candidate?: RTCIceCandidateInit }) {
        const { from, type, sdp, candidate } = data;

        let peerConnection = this.peerConnections.get(from);
        if (!peerConnection) {
            peerConnection = this.createPeerConnection(from);
        }

        try {
            switch (type) {
                case 'offer': {
                    if (!sdp) {
                        console.error('WebRTCClient: Offer SDP is missing');
                        return;
                    }
                    const optimizedOfferSdp = this.optimizeSdpWithSettings(sdp);
                    await peerConnection.setRemoteDescription(
                        new RTCSessionDescription({ type, sdp: optimizedOfferSdp })
                    );
                    await this.createAnswer(from);
                    break;
                }
                case 'answer': {
                    if (!sdp) {
                        console.error('WebRTCClient: Answer SDP is missing');
                        return;
                    }
                    const optimizedAnswerSdp = this.optimizeSdpWithSettings(sdp);
                    await peerConnection.setRemoteDescription(
                        new RTCSessionDescription({ type, sdp: optimizedAnswerSdp })
                    );
                    break;
                }
                case 'candidate': {
                    if (!candidate) {
                        console.error('WebRTCClient: ICE candidate is missing');
                        return;
                    }
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    break;
                }
                default:
                    console.warn('WebRTCClient: Unknown signal type:', type);
            }
        } catch (error) {
            console.error('WebRTCClient: Error handling signal:', error);
            this.handleConnectionError(from, error);
        }
    }

    // Оптимизация SDP с учетом настроек из AudioSettingsStore
    private optimizeSdpWithSettings(sdp: string): string {
        let optimizedSdp = sdp;

        // Получаем настройки качества из store
        const bitrate = audioSettingsStore.bitrate * 1000; // Конвертируем в биты
        const sampleRate = audioSettingsStore.sampleRate;
        const channelCount = audioSettingsStore.channelCount;
        const audioQuality = audioSettingsStore.audioQuality;

        // Определяем параметры в зависимости от качества
        let maxBitrate = bitrate;
        let stereo = channelCount === 2 ? 1 : 0;

        // Адаптируем параметры под уровень качества
        switch (audioQuality) {
            case 'low':
                maxBitrate = Math.min(maxBitrate, 96000);
                stereo = 0; // Моно для экономии трафика
                break;
            case 'medium':
                maxBitrate = Math.min(maxBitrate, 192000);
                break;
            case 'high':
                maxBitrate = Math.min(maxBitrate, 320000);
                break;
            case 'ultra':
                maxBitrate = Math.min(maxBitrate, 512000);
                break;
        }

        // Приоритет кодека Opus
        optimizedSdp = optimizedSdp.replace(/m=audio (\d+) RTP\/SAVPF ([\d\s]+)/, (_match, port, codecs) => {
            const opusCodec = '111';
            const newCodecs = `${opusCodec} ${codecs.replace(opusCodec, '').trim()}`;
            return `m=audio ${port} RTP/SAVPF ${newCodecs}`;
        });

        // Настройки Opus кодека с учетом настроек качества
        optimizedSdp = optimizedSdp.replace(/a=fmtp:111 (.+)/, () => {
            const optimizedParams = [
                'minptime=10',
                'useinbandfec=1', // FEC для восстановления пакетов
                `stereo=${stereo}`,
                `sprop-stereo=${stereo}`,
                `maxplaybackrate=${sampleRate}`,
                `maxaveragebitrate=${maxBitrate}`,
                `maxbitrate=${maxBitrate}`,
                'cbr=0', // Переменный битрейт
                'dtx=0', // Отключаем DTX для постоянного качества
                'application=voip'
            ].join(';');
            return `a=fmtp:111 ${optimizedParams}`;
        });

        // Добавляем параметры если их нет
        if (!optimizedSdp.includes('a=fmtp:111')) {
            const opusFmtp = `a=fmtp:111 minptime=10;useinbandfec=1;stereo=${stereo};sprop-stereo=${stereo};maxplaybackrate=${sampleRate};maxaveragebitrate=${maxBitrate};maxbitrate=${maxBitrate};cbr=0;dtx=0;application=voip`;
            optimizedSdp = optimizedSdp.replace(/(a=rtcp-fb:111 .+)/, `$1\n${opusFmtp}`);
        }

        // Настройки для адаптивного битрейта и контроля перегрузки
        optimizedSdp = optimizedSdp.replace(/a=rtcp-fb:111 (.+)/, () => {
            const enhancedParams = ['goog-remb', 'transport-cc', 'ccm fir', 'nack', 'nack pli'].join(' ');
            return `a=rtcp-fb:111 ${enhancedParams}`;
        });

        // Добавляем расширения для улучшения качества
        if (!optimizedSdp.includes('urn:ietf:params:rtp-hdrext:ssrc-audio-level')) {
            optimizedSdp = optimizedSdp.replace(
                /(a=extmap:\d+ .+)/,
                '$1\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level'
            );
        }

        return optimizedSdp;
    }

    // Добавление удаленного потока с улучшенной обработкой
    private addRemoteStream(track: MediaStreamTrack, id: string): void {
        let remoteStream = this.remoteStreams.get(id);
        if (!remoteStream) {
            remoteStream = new MediaStream();
            this.remoteStreams.set(id, remoteStream);

            // Создаем аудио контекст с оптимальными настройками
            const audioContext = new AudioContext({
                sampleRate: audioSettingsStore.sampleRate || this.defaultSampleRate,
                latencyHint: audioSettingsStore.latency < 100 ? 'interactive' : 'balanced'
            });

            const gainNode = audioContext.createGain();
            const initialVolume = participantVolumeStore.getParticipantVolume(id);
            gainNode.gain.value = initialVolume / 100;

            this.audioContexts.set(id, audioContext);
            this.gainNodes.set(id, gainNode);

            // Создаем аудио элемент для воспроизведения
            const audioElement = document.createElement('audio');
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.muted = true; // Используем только Web Audio API

            audioElement.addEventListener('loadedmetadata', () => {
                const currentStream = this.remoteStreams.get(id);
                if (currentStream && currentStream.getAudioTracks().length > 0) {
                    this.setupAudioProcessing(id, currentStream);
                }
            });

            this.remoteAudioElements.set(id, audioElement);
        }

        // Добавляем трек в поток
        remoteStream.addTrack(track);

        // Настраиваем обработку аудио если поток готов
        if (remoteStream.getAudioTracks().length > 0 && !this.audioContexts.get(id)?.state.includes('closed')) {
            this.setupAudioProcessing(id, remoteStream);
        }
    }

    // Настройка обработки аудио с учетом настроек
    private setupAudioProcessing(id: string, remoteStream: MediaStream): void {
        const audioContext = this.audioContexts.get(id);
        const gainNode = this.gainNodes.get(id);

        if (!audioContext || !gainNode) {
            console.error('WebRTCClient: AudioContext or GainNode not found for', id);
            return;
        }

        if (this.audioSources.has(id)) {
            return;
        }

        try {
            if (remoteStream.getAudioTracks().length === 0) {
                return;
            }

            if (!audioContext.state.includes('closed')) {
                const source = audioContext.createMediaStreamSource(remoteStream);

                // Прямое подключение для максимального качества
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);

                this.audioSources.set(id, source);

                this.setupRemoteVoiceActivity(id, remoteStream);
            }
        } catch (error) {
            console.error('WebRTCClient: Error setting up audio processing:', error);
        }
    }

    // Обновление локального потока
    public resendlocalStream() {
        if (!audioSettingsStore.stream) {
            console.error('WebRTCClient: No local stream available');
            return;
        }

        const newAudioTrack = audioSettingsStore.stream.getAudioTracks()[0];
        if (!newAudioTrack) {
            console.error('WebRTCClient: No audio track in stream');
            return;
        }

        this.peerConnections.forEach((peerConnection, socketId) => {
            const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'audio');
            if (sender && newAudioTrack) {
                try {
                    sender.replaceTrack(newAudioTrack);
                    newAudioTrack.enabled = !audioSettingsStore.isMicrophoneMuted;

                    // Обновляем параметры кодирования для адаптивного битрейта
                    if (sender.getParameters) {
                        const params = sender.getParameters();
                        if (params.encodings && params.encodings.length > 0) {
                            const bitrate = audioSettingsStore.bitrate * 1000;
                            params.encodings[0].maxBitrate = bitrate;
                            sender.setParameters(params);
                        }
                    }
                } catch (error) {
                    console.error('WebRTCClient: Error replacing track:', error);
                }
            }
        });
    }

    // Добавление локального потока
    private addLocalStream(id: string): void {
        const peerConnection = this.peerConnections.get(id);
        if (!peerConnection) {
            console.error('WebRTCClient: Peer connection not found for', id);
            return;
        }

        if (!audioSettingsStore.stream) {
            console.error('WebRTCClient: No local stream available');
            return;
        }

        audioSettingsStore.stream.getTracks().forEach((track) => {
            try {
                peerConnection.addTrack(track, audioSettingsStore.stream);
                track.enabled = !audioSettingsStore.isMicrophoneMuted;
            } catch (error) {
                console.error('WebRTCClient: Error adding track:', error);
            }
        });
    }

    // Управление громкостью
    public setRemoteAudioMuted(muted: boolean): void {
        this.gainNodes.forEach((gainNode, socketId) => {
            if (muted) {
                gainNode.gain.value = 0;
            } else {
                const volume = participantVolumeStore.getParticipantVolume(socketId);
                gainNode.gain.value = volume / 100;
            }
        });
    }

    public setParticipantVolume(socketId: string, volume: number): void {
        const gainNode = this.gainNodes.get(socketId);
        if (gainNode) {
            gainNode.gain.value = volume / 100;
            participantVolumeStore.setParticipantVolume(socketId, volume);
        }
    }

    public getParticipantVolume(socketId: string): number {
        return participantVolumeStore.getParticipantVolume(socketId);
    }

    // Отключение участника
    public disconnectPeer(id: string) {
        const peerConnection = this.peerConnections.get(id);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(id);
        }

        const remoteStream = this.remoteStreams.get(id);
        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => track.stop());
            this.remoteStreams.delete(id);
        }

        const audioElement = this.remoteAudioElements.get(id);
        if (audioElement) {
            this.remoteAudioElements.delete(id);
        }

        const audioContext = this.audioContexts.get(id);
        if (audioContext) {
            audioContext.close();
            this.audioContexts.delete(id);
        }

        this.gainNodes.delete(id);
        this.audioSources.delete(id);

        // Останавливаем мониторинг качества
        const monitor = this.qualityMonitors.get(id);
        if (monitor) {
            clearInterval(monitor);
            this.qualityMonitors.delete(id);
        }

        this.connectionQuality.delete(id);
        this.reconnectionStates.delete(id);

        voiceActivityService.stopMonitoring(id);
        participantVolumeStore.removeParticipant(id);
    }

    // Полное отключение
    public disconect() {
        this.peerConnections.forEach((peerConnection) => {
            peerConnection.close();
        });
        this.peerConnections.clear();

        if (audioSettingsStore.stream) {
            audioSettingsStore.stream.getTracks().forEach((track) => track.stop());
        }

        this.remoteStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });
        this.remoteStreams.clear();

        this.remoteAudioElements.clear();

        this.audioContexts.forEach((audioContext) => {
            audioContext.close();
        });
        this.audioContexts.clear();
        this.gainNodes.clear();
        this.audioSources.clear();

        // Останавливаем все мониторы качества
        this.qualityMonitors.forEach((monitor) => clearInterval(monitor));
        this.qualityMonitors.clear();
        this.connectionQuality.clear();
        this.reconnectionStates.clear();

        participantVolumeStore.resetAllVolumes();
        voiceActivityService.cleanup();
    }

    // Настройка VoiceActivity
    private setupLocalVoiceActivity(): void {
        if (audioSettingsStore.stream) {
            voiceActivityService.startMonitoring('local', audioSettingsStore.stream);
        }
    }

    private setupRemoteVoiceActivity(userId: string, remoteStream: MediaStream): void {
        voiceActivityService.startMonitoring(userId, remoteStream);
    }

    public getUserVoiceActivity(userId: string): boolean {
        return voiceActivityService.getUserActivity(userId);
    }

    public getUserVolumeLevel(userId: string): number {
        return voiceActivityService.getUserVolume(userId);
    }

    // Мониторинг качества соединения
    private startQualityMonitoring(id: string): void {
        const monitor = setInterval(async () => {
            const peerConnection = this.peerConnections.get(id);
            if (!peerConnection) {
                clearInterval(monitor);
                return;
            }

            try {
                const stats = await peerConnection.getStats();
                let rtt = 0;
                let packetsLost = 0;
                let jitter = 0;
                let bitrate = 0;

                stats.forEach((report) => {
                    if (report.type === 'remote-inbound-rtp' && report.mediaType === 'audio') {
                        rtt = report.roundTripTime || 0;
                        packetsLost = report.packetsLost || 0;
                        jitter = report.jitter || 0;
                    }
                    if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
                        bitrate = ((report.bytesSent || 0) * 8) / 1000; // kbps
                    }
                });

                // Определяем качество соединения
                let quality: ConnectionQuality['quality'] = 'excellent';
                if (rtt > 200 || packetsLost > 10 || jitter > 50) {
                    quality = 'poor';
                } else if (rtt > 100 || packetsLost > 5 || jitter > 30) {
                    quality = 'fair';
                } else if (rtt > 50 || packetsLost > 2 || jitter > 15) {
                    quality = 'good';
                }

                this.connectionQuality.set(id, {
                    rtt,
                    packetsLost,
                    jitter,
                    bitrate,
                    quality
                });

                // Адаптивная настройка битрейта при плохом качестве
                if (quality === 'poor' || quality === 'fair') {
                    this.adjustBitrateForQuality(id, quality);
                }
            } catch (error) {
                console.error('WebRTCClient: Error monitoring quality:', error);
            }
        }, 5000); // Проверяем каждые 5 секунд

        this.qualityMonitors.set(id, monitor);
    }

    // Адаптивная настройка битрейта
    private adjustBitrateForQuality(id: string, quality: ConnectionQuality['quality']): void {
        const peerConnection = this.peerConnections.get(id);
        if (!peerConnection) {
            return;
        }

        const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'audio');
        if (!sender?.getParameters) {
            return;
        }

        try {
            const params = sender.getParameters();
            if (params.encodings && params.encodings.length > 0) {
                const currentBitrate = audioSettingsStore.bitrate * 1000;
                let newBitrate = currentBitrate;

                // Снижаем битрейт при плохом качестве
                if (quality === 'poor') {
                    newBitrate = Math.max(64000, currentBitrate * 0.5);
                } else if (quality === 'fair') {
                    newBitrate = Math.max(96000, currentBitrate * 0.75);
                }

                if (newBitrate !== currentBitrate) {
                    params.encodings[0].maxBitrate = newBitrate;
                    sender.setParameters(params);
                }
            }
        } catch (error) {
            console.error('WebRTCClient: Error adjusting bitrate:', error);
        }
    }

    // Обновление качества всех соединений
    private updateAllConnectionsQuality(): void {
        this.peerConnections.forEach((peerConnection) => {
            const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'audio');
            if (sender?.getParameters) {
                try {
                    const params = sender.getParameters();
                    if (params.encodings && params.encodings.length > 0) {
                        const bitrate = audioSettingsStore.bitrate * 1000;
                        params.encodings[0].maxBitrate = bitrate;
                        sender.setParameters(params);
                    }
                } catch (error) {
                    console.error('WebRTCClient: Error updating connection quality:', error);
                }
            }
        });
    }

    // Обработка проблем с соединением
    private handleConnectionProblem(id: string, state: string): void {
        console.warn(`WebRTCClient: Connection problem for ${id}:`, state);

        const reconnectionState = this.reconnectionStates.get(id) || {
            attempts: 0,
            maxAttempts: 3,
            backoff: 1000
        };

        if (reconnectionState.attempts < reconnectionState.maxAttempts) {
            reconnectionState.attempts++;
            reconnectionState.backoff *= 2; // Экспоненциальная задержка

            reconnectionState.timer = setTimeout(() => {
                // Попытка переподключения через создание нового offer
                this.createOffer(id);
            }, reconnectionState.backoff);

            this.reconnectionStates.set(id, reconnectionState);
        } else {
            console.error(`WebRTCClient: Max reconnection attempts reached for ${id}`);
            this.reconnectionStates.delete(id);
        }
    }

    // Обработка успешного соединения
    private handleConnectionSuccess(id: string): void {
        this.reconnectionStates.delete(id);
    }

    // Обработка ошибок соединения
    private handleConnectionError(id: string, error: unknown): void {
        console.error(`WebRTCClient: Connection error for ${id}:`, error);
        // Можно добавить уведомления пользователю или логирование
    }

    // Получение качества соединения
    public getConnectionQuality(id: string): ConnectionQuality | undefined {
        return this.connectionQuality.get(id);
    }
}

export default WebRTCClient;
