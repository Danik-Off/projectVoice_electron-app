/* eslint-disable max-lines -- WebRTC client with complex connection management */
import { reaction } from 'mobx';
import { iceServers, audioSettingsStore } from '../../../core';
import type { Signal } from '../types/WebRTCClient.types';
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

interface QualityParameters {
    maxBitrate: number;
    stereo: number;
    audioSampleRate: number;
}

interface StatsReportData {
    rtt: number;
    packetsLost: number;
    jitter: number;
    bitrate: number;
}

interface SdpReplaceParams {
    match: string;
    port: string;
    codecs: string;
    offset: number;
    string: string;
    groups?: { port?: string; codecs?: string };
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
    // eslint-disable-next-line require-await -- No await needed
    public async initializeMedia() {
        voiceActivityService.initialize();

        if (audioSettingsStore.stream != null && audioSettingsStore.stream.getAudioTracks().length > 0) {
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
        newPeerConnection.onicecandidate = (iceEvent) => {
            if (iceEvent.candidate == null) {
                return;
            }

            if (!this.sendSignal) {
                return;
            }

            try {
                this.sendSignal({
                    to: id,
                    type: 'candidate',
                    candidate: iceEvent.candidate
                });
            } catch (candidateError: unknown) {
                console.error('WebRTCClient: Error sending ICE candidate:', candidateError);
            }
        };

        // Обработка изменений состояния соединения
        newPeerConnection.onconnectionstatechange = () => {
            const state = newPeerConnection.connectionState;

            if (this.changeState != null) {
                const connectionEvent = new Event('connectionstatechange');
                this.changeState(id, connectionEvent);
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
        newPeerConnection.ontrack = (trackEvent) => {
            if (trackEvent.track.kind === 'audio') {
                this.addRemoteStream(trackEvent.track, id);
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
            const modifiedSdp = this.optimizeSdpWithSettings(offer.sdp ?? '');
            const optimizedOffer: RTCSessionDescriptionInit = {
                type: offer.type,
                sdp: modifiedSdp
            };

            await peerConnection.setLocalDescription(optimizedOffer);
            const sdp = optimizedOffer.sdp;

            if (this.sendSignal == null) {
                console.error('WebRTCClient: sendSignal not available');
                return;
            }

            if (sdp == null || sdp.length === 0) {
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

        if (peerConnection == null) {
            console.error('WebRTCClient: Peer connection not found for', id);
            return;
        }

        try {
            const answer = await peerConnection.createAnswer({
                voiceActivityDetection: true
            });

            // Оптимизируем SDP с учетом настроек качества
            const modifiedSdp = this.optimizeSdpWithSettings(answer.sdp ?? '');
            const optimizedAnswer = { ...answer, sdp: modifiedSdp };

            await peerConnection.setLocalDescription(optimizedAnswer);
            const sdp = optimizedAnswer.sdp;

            if (this.sendSignal == null) {
                console.error('WebRTCClient: sendSignal not available');
                return;
            }

            if (sdp == null || sdp.length === 0) {
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
        peerConnection ??= this.createPeerConnection(from);

        try {
            switch (type) {
                case 'offer': {
                    if (sdp == null || sdp.length === 0) {
                        console.error('WebRTCClient: Offer SDP is missing');
                        return;
                    }
                    const optimizedOfferSdp = this.optimizeSdpWithSettings(sdp);
                    const offerDescription: RTCSessionDescriptionInit = {
                        type: type as RTCSdpType,
                        sdp: optimizedOfferSdp
                    };
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offerDescription));
                    await this.createAnswer(from);
                    break;
                }
                case 'answer': {
                    if (sdp == null || sdp.length === 0) {
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

    // Получение параметров качества из store
    private getQualityParameters(): QualityParameters {
        const bitrate = audioSettingsStore.bitrate * 1000; // Конвертируем в биты
        const audioSampleRate = audioSettingsStore.sampleRate;
        const channelCount = audioSettingsStore.channelCount;
        const audioQuality = audioSettingsStore.audioQuality;

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
            default:
                maxBitrate = Math.min(maxBitrate, 320000);
                break;
        }

        return { maxBitrate, stereo, audioSampleRate };
    }

    // Оптимизация кодека Opus в SDP
    private optimizeOpusCodec(sdp: string, params: QualityParameters): string {
        const { maxBitrate, stereo, audioSampleRate } = params;

        // Настройки Opus кодека с учетом настроек качества
        return sdp.replace(/a=fmtp:111 (?<params>.+)/, () => {
            const optimizedParams = [
                'minptime=10',
                'useinbandfec=1', // FEC для восстановления пакетов
                `stereo=${stereo}`,
                `sprop-stereo=${stereo}`,
                `maxplaybackrate=${audioSampleRate}`,
                `maxaveragebitrate=${maxBitrate}`,
                `maxbitrate=${maxBitrate}`,
                'cbr=0', // Переменный битрейт
                'dtx=0', // Отключаем DTX для постоянного качества
                'application=voip'
            ].join(';');
            return `a=fmtp:111 ${optimizedParams}`;
        });
    }

    // Добавление параметров Opus если их нет
    private addOpusFmtpIfMissing(sdp: string, params: QualityParameters): string {
        const { maxBitrate, stereo, audioSampleRate } = params;

        if (sdp.includes('a=fmtp:111')) {
            return sdp;
        }

        const opusFmtp = `a=fmtp:111 minptime=10;useinbandfec=1;stereo=${stereo};sprop-stereo=${stereo};maxplaybackrate=${audioSampleRate};maxaveragebitrate=${maxBitrate};maxbitrate=${maxBitrate};cbr=0;dtx=0;application=voip`;

        const replaceRtcpFb = (
            _match: string,
            _line: string,
            _offset: number,
            _string: string,
            groups?: { line?: string }
        ): string => {
            const line = groups?.line ?? _line;
            return `${line}\n${opusFmtp}`;
        };

        return sdp.replace(/(?<line>a=rtcp-fb:111 .+)/, replaceRtcpFb);
    }

    // Улучшение RTCP feedback
    private enhanceRtcpFeedback(sdp: string): string {
        return sdp.replace(/a=rtcp-fb:111 (?<params>.+)/, () => {
            const enhancedParams = ['goog-remb', 'transport-cc', 'ccm fir', 'nack', 'nack pli'].join(' ');
            return `a=rtcp-fb:111 ${enhancedParams}`;
        });
    }

    // Замена кодека с приоритетом Opus
    private replaceWithOpusCodec(params: SdpReplaceParams): string {
        const port = params.groups?.port ?? params.port;
        const codecs = params.groups?.codecs ?? params.codecs;
        const opusCodec = '111';
        const codecsString = String(codecs);
        const newCodecs = `${opusCodec} ${codecsString.replace(opusCodec, '').trim()}`;
        return `m=audio ${port} RTP/SAVPF ${newCodecs}`;
    }

    // Приоритизация кодека Opus
    private prioritizeOpusCodec(sdp: string): string {
        return sdp.replace(
            /m=audio (?<port>\d+) RTP\/SAVPF (?<codecs>[\d\s]+)/,
            (...args: [string, string, string, number, string, { port?: string; codecs?: string }?]) => {
                const [match, port, codecs, offset, string, groups] = args;
                const params: SdpReplaceParams = { match, port, codecs, offset, string, groups };
                return this.replaceWithOpusCodec(params);
            }
        );
    }

    // Добавление audio level extension
    private addAudioLevelExtension(sdp: string): string {
        if (sdp.includes('urn:ietf:params:rtp-hdrext:ssrc-audio-level')) {
            return sdp;
        }

        const replaceExtmap = (
            _match: string,
            _line: string,
            _offset: number,
            _string: string,
            groups?: { line?: string }
        ): string => {
            const line = groups?.line ?? _line;
            return `${line}\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level`;
        };

        return sdp.replace(/(?<line>a=extmap:\d+ .+)/, replaceExtmap);
    }

    // Оптимизация SDP с учетом настроек из AudioSettingsStore
    private optimizeSdpWithSettings(sdp: string): string {
        const qualityParams = this.getQualityParameters();

        // Применяем все оптимизации последовательно
        let optimizedSdp = this.prioritizeOpusCodec(sdp);
        optimizedSdp = this.optimizeOpusCodec(optimizedSdp, qualityParams);
        optimizedSdp = this.addOpusFmtpIfMissing(optimizedSdp, qualityParams);
        optimizedSdp = this.enhanceRtcpFeedback(optimizedSdp);
        optimizedSdp = this.addAudioLevelExtension(optimizedSdp);

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
                sampleRate: audioSettingsStore.sampleRate ?? this.defaultSampleRate,
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
        const audioContextState = this.audioContexts.get(id)?.state;
        if (
            remoteStream.getAudioTracks().length > 0 &&
            audioContextState != null &&
            !audioContextState.includes('closed')
        ) {
            this.setupAudioProcessing(id, remoteStream);
        }
    }

    // Настройка обработки аудио с учетом настроек
    private setupAudioProcessing(id: string, remoteStream: MediaStream): void {
        const audioContext = this.audioContexts.get(id);
        const gainNode = this.gainNodes.get(id);

        if (audioContext == null || gainNode == null) {
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
        if (audioSettingsStore.stream == null) {
            console.error('WebRTCClient: No local stream available');
            return;
        }

        const newAudioTrack = audioSettingsStore.stream.getAudioTracks()[0];
        if (newAudioTrack == null) {
            console.error('WebRTCClient: No audio track in stream');
            return;
        }

        this.peerConnections.forEach((peerConnection, _socketId) => {
            const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'audio');
            if (sender != null && newAudioTrack != null) {
                try {
                    sender.replaceTrack(newAudioTrack).catch((error) => {
                        console.error('WebRTCClient: Error replacing track:', error);
                    });

                    newAudioTrack.enabled = !audioSettingsStore.isMicrophoneMuted;

                    // Обновляем параметры кодирования для адаптивного битрейта
                    if (sender.getParameters != null) {
                        const params = sender.getParameters();
                        if (params.encodings != null && params.encodings.length > 0) {
                            const bitrate = audioSettingsStore.bitrate * 1000;
                            params.encodings[0].maxBitrate = bitrate;
                            sender.setParameters(params).catch((error) => {
                                console.error('WebRTCClient: Error setting parameters:', error);
                            });
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

        if (audioSettingsStore.stream == null) {
            console.error('WebRTCClient: No local stream available');
            return;
        }

        audioSettingsStore.stream.getTracks().forEach((track) => {
            try {
                peerConnection.addTrack(track, audioSettingsStore.stream);
                // eslint-disable-next-line no-param-reassign -- Необходимо изменить состояние трека
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
                // eslint-disable-next-line no-param-reassign -- Необходимо изменить значение gain
                gainNode.gain.value = 0;
            } else {
                const volume = participantVolumeStore.getParticipantVolume(socketId);
                // eslint-disable-next-line no-param-reassign -- Необходимо изменить значение gain
                gainNode.gain.value = volume / 100;
            }
        });
    }

    public setParticipantVolume(socketId: string, volume: number): void {
        const gainNode = this.gainNodes.get(socketId);
        if (gainNode != null) {
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
        if (peerConnection != null) {
            peerConnection.close();
            this.peerConnections.delete(id);
        }

        const remoteStream = this.remoteStreams.get(id);
        if (remoteStream != null) {
            remoteStream.getTracks().forEach((track) => {
                track.stop();
            });
            this.remoteStreams.delete(id);
        }

        const audioElement = this.remoteAudioElements.get(id);
        if (audioElement != null) {
            this.remoteAudioElements.delete(id);
        }

        const audioContext = this.audioContexts.get(id);
        if (audioContext != null) {
            audioContext.close().catch(() => {
                // Ignore close errors
            });
            this.audioContexts.delete(id);
        }

        this.gainNodes.delete(id);
        this.audioSources.delete(id);

        // Останавливаем мониторинг качества
        const monitor = this.qualityMonitors.get(id);
        if (monitor != null) {
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

        if (audioSettingsStore.stream != null) {
            audioSettingsStore.stream.getTracks().forEach((track) => {
                track.stop();
            });
        }

        this.remoteStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => {
                track.stop();
            });
        });
        this.remoteStreams.clear();

        this.remoteAudioElements.clear();

        this.audioContexts.forEach((audioContext) => {
            audioContext.close().catch(() => {
                // Ignore close errors
            });
        });
        this.audioContexts.clear();
        this.gainNodes.clear();
        this.audioSources.clear();

        // Останавливаем все мониторы качества
        this.qualityMonitors.forEach((monitor) => {
            clearInterval(monitor);
        });
        this.qualityMonitors.clear();
        this.connectionQuality.clear();
        this.reconnectionStates.clear();

        participantVolumeStore.resetAllVolumes();
        voiceActivityService.cleanup();
    }

    // Настройка VoiceActivity
    private setupLocalVoiceActivity(): void {
        if (audioSettingsStore.stream != null) {
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

    // Парсинг статистики из WebRTC stats report
    private parseStatsReport(stats: RTCStatsReport): StatsReportData {
        let rtt = 0;
        let packetsLost = 0;
        let jitter = 0;
        let bitrate = 0;

        stats.forEach((report: unknown) => {
            const reportObj = report as {
                type?: unknown;
                mediaType?: unknown;
                roundTripTime?: unknown;
                packetsLost?: unknown;
                jitter?: unknown;
                bytesSent?: unknown;
            };

            const reportType = this.extractReportType(reportObj.type);
            const mediaType = this.extractMediaType(reportObj.mediaType);

            if (reportType === 'remote-inbound-rtp' && mediaType === 'audio') {
                rtt = typeof reportObj.roundTripTime === 'number' ? reportObj.roundTripTime : 0;
                packetsLost = typeof reportObj.packetsLost === 'number' ? reportObj.packetsLost : 0;
                jitter = typeof reportObj.jitter === 'number' ? reportObj.jitter : 0;
            }

            if (reportType === 'outbound-rtp' && mediaType === 'audio') {
                const bytesSent = reportObj.bytesSent;
                bitrate = ((typeof bytesSent === 'number' ? bytesSent : 0) * 8) / 1000; // kbps
            }
        });

        return { rtt, packetsLost, jitter, bitrate };
    }

    // Извлечение типа репорта
    private extractReportType(typeValue: unknown): string {
        if (typeValue == null) {
            return '';
        }
        if (typeof typeValue === 'string') {
            return typeValue;
        }
        if (typeof typeValue === 'number' || typeof typeValue === 'boolean') {
            return String(typeValue);
        }
        return '';
    }

    // Извлечение типа медиа
    private extractMediaType(mediaTypeValue: unknown): string | null {
        if (mediaTypeValue == null) {
            return null;
        }
        if (typeof mediaTypeValue === 'string') {
            return mediaTypeValue;
        }
        if (typeof mediaTypeValue === 'number' || typeof mediaTypeValue === 'boolean') {
            return String(mediaTypeValue);
        }
        return null;
    }

    // Определение качества соединения
    private determineConnectionQuality(statsData: StatsReportData): ConnectionQuality['quality'] {
        const { rtt, packetsLost, jitter } = statsData;

        if (rtt > 200 || packetsLost > 10 || jitter > 50) {
            return 'poor';
        }
        if (rtt > 100 || packetsLost > 5 || jitter > 30) {
            return 'fair';
        }
        if (rtt > 50 || packetsLost > 2 || jitter > 15) {
            return 'good';
        }
        return 'excellent';
    }

    // Мониторинг качества соединения
    private startQualityMonitoring(id: string): void {
        const monitor = setInterval(async () => {
            const peerConnection = this.peerConnections.get(id);
            if (peerConnection == null) {
                clearInterval(monitor);
                return;
            }

            try {
                const stats = await peerConnection.getStats();
                const statsData = this.parseStatsReport(stats);
                const quality = this.determineConnectionQuality(statsData);

                this.connectionQuality.set(id, {
                    ...statsData,
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
        if (peerConnection == null) {
            return;
        }

        const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'audio');
        if (sender?.getParameters == null) {
            return;
        }

        try {
            const params = sender.getParameters();
            if (params.encodings != null && params.encodings.length > 0) {
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
                    sender.setParameters(params).catch((error) => {
                        console.error('WebRTCClient: Error setting parameters:', error);
                    });
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
            if (sender?.getParameters != null) {
                try {
                    const params = sender.getParameters();
                    if (params.encodings != null && params.encodings.length > 0) {
                        const bitrate = audioSettingsStore.bitrate * 1000;
                        params.encodings[0].maxBitrate = bitrate;
                        sender.setParameters(params).catch((error) => {
                            console.error('WebRTCClient: Error setting parameters:', error);
                        });
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

        let reconnectionState = this.reconnectionStates.get(id);
        reconnectionState ??= {
            attempts: 0,
            maxAttempts: 3,
            backoff: 1000
        };

        if (reconnectionState.attempts < reconnectionState.maxAttempts) {
            reconnectionState.attempts++;
            reconnectionState.backoff *= 2; // Экспоненциальная задержка

            reconnectionState.timer = setTimeout(() => {
                // Попытка переподключения через создание нового offer
                this.createOffer(id).catch((error) => {
                    console.error('WebRTCClient: Error creating offer for reconnection:', error);
                });
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
