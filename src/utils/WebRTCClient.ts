import { reaction } from 'mobx';
import { iceServers } from '../configs/iceServers';
import type { Signal } from '../types/WebRTCClient.types';
import audioSettingsStore from '../store/AudioSettingsStore';
import participantVolumeStore from '../store/ParticipantVolumeStore';
import voiceActivityService from '../services/VoiceActivityService';
class WebRTCClient {
    public sendSignal: null | ((signal: Signal) => void) = null;

    public changeState: null | ((id: string, signal: Event) => void) = null;

    private readonly remoteStreams: Map<string, MediaStream> = new Map();
    private readonly peerConnections: Map<string, RTCPeerConnection> = new Map();
    private readonly remoteAudioElements: Map<string, HTMLAudioElement> = new Map();
    private readonly audioContexts: Map<string, AudioContext> = new Map();
    private readonly gainNodes: Map<string, GainNode> = new Map();
    private readonly audioSources: Map<string, MediaStreamAudioSourceNode> = new Map();

    private localStream: MediaStream | null = null;

    //управление Медиа
    public async initializeMedia() {
        console.log('WebRTCClient: Initializing media...');
        // Инициализируем VoiceActivity сервис
        voiceActivityService.initialize();
        
        // Проверяем, есть ли уже поток
        if (audioSettingsStore.stream && audioSettingsStore.stream.getAudioTracks().length > 0) {
            console.log('WebRTCClient: Stream already exists, setting up VoiceActivity immediately');
            this.setupLocalVoiceActivity();
        }
        
        reaction(
            () => audioSettingsStore.stream,
            (val) => {
                console.log('🚀 ~ WebRTCClient ~ reaction triggered ~ stream:', val);
                console.log('🚀 ~ WebRTCClient ~ reaction triggered ~ tracks:', val?.getAudioTracks().length || 0);
                this.resendlocalStream();
                this.setupLocalVoiceActivity();
            },
        );
    }

    //Логика подключения
    public createPeerConnection(id: string) {
        console.log('создание peerConnection c id', id);
        const newPeerConnection = new RTCPeerConnection({
            iceServers: iceServers,
            iceCandidatePoolSize: 10, // Увеличиваем пул кандидатов для лучшего соединения
            bundlePolicy: 'max-bundle', // Оптимизируем соединение
            rtcpMuxPolicy: 'require', // Обязательное мультиплексирование RTCP
        });

        newPeerConnection.onicecandidate = (event) => {
            console.log(event);
            if (!event.candidate) {
                console.error('candidate не существует');
                return;
            }
            if (!this.sendSignal) {
                console.error('sendSignal не существует');
                return;
            }
            this.sendSignal({
                to: id,
                type: 'candidate',
                candidate: event.candidate,
            });
        };

        newPeerConnection.onconnectionstatechange = (state) => {
            this.changeState && this.changeState(id, state);
        };

        newPeerConnection.ontrack = (event) => {
            console.log('ontrack', id, event.track.kind);
            if (event.track.kind === 'audio') {
                this.addRemoteStream(event.track, id);
            }
        };

        this.peerConnections.set(id, newPeerConnection);
        this.addLocalStream(id);
        return newPeerConnection;
    }

    public async createOffer(id: string) {
        console.log('создание офера');
        const peerConnection = this.createPeerConnection(id);
        try {
            // Создаем offer с оптимизированными параметрами для высокого качества звука
            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: false,
            });
            
            // Модифицируем SDP для максимального качества звука
            const modifiedSdp = this.optimizeSdpForHighQualityAudio(offer.sdp || '');
            const optimizedOffer: RTCSessionDescriptionInit = { type: offer.type, sdp: modifiedSdp };
            
            await peerConnection.setLocalDescription(optimizedOffer);
            const sdp = optimizedOffer.sdp;

            if (!this.sendSignal) {
                console.error('sendSignal не найден или равняется null');
                return;
            }

            if (!sdp) {
                console.error('offer.sdp не найден или равняется null');
                return;
            }

            this.sendSignal({
                to: id,
                type: 'offer',
                sdp: sdp,
            });
        } catch (error) {
            console.error('Ошибка при создании предложения:', error);
        }
    }

    public async createAnswer(id: string) {
        console.log('создание  ответа');
        const peerConnection = this.peerConnections.get(id);
        if (!peerConnection) {
            console.error('peerConnection не существует при создании ответа');
            return;
        }
        try {
            // Создаем answer с оптимизированными параметрами
            const answer = await peerConnection.createAnswer({
                voiceActivityDetection: true,
            });
            
            // Модифицируем SDP для максимального качества звука
            const modifiedSdp = this.optimizeSdpForHighQualityAudio(answer.sdp || '');
            const optimizedAnswer = { ...answer, sdp: modifiedSdp };
            
            await peerConnection.setLocalDescription(optimizedAnswer);
            const sdp = optimizedAnswer.sdp;

            if (!this.sendSignal) {
                console.error('sendSignalr не найден или равняется null');
                return;
            }

            if (!sdp) {
                console.error('answer.sdp не найден или равняется null');
                return;
            }
            this.sendSignal({
                to: id,
                type: 'answer',
                sdp: sdp,
            });
        } catch (error) {
            console.error('Ошибка при создании ответа:', error);
        }
    }

    public async handleSignal(data: any) {
        const { from, type, sdp, candidate } = data;
        console.log('обработка сигнала:', type);
        let peerConnection = this.peerConnections.get(from) || false;
        if (!peerConnection) {
            peerConnection = await this.createPeerConnection(from);
        }

        switch (type) {
            case 'offer':
                // Оптимизируем входящий SDP
                const optimizedOfferSdp = this.optimizeSdpForHighQualityAudio(sdp);
                await peerConnection.setRemoteDescription(new RTCSessionDescription({ 
                    type, 
                    sdp: optimizedOfferSdp 
                }));
                await this.createAnswer(from);
                break;
            case 'answer':
                // Оптимизируем входящий SDP
                const optimizedAnswerSdp = this.optimizeSdpForHighQualityAudio(sdp);
                await peerConnection.setRemoteDescription(new RTCSessionDescription({ 
                    type, 
                    sdp: optimizedAnswerSdp 
                }));
                break;
            case 'candidate':
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                break;
        }
    }

    // Метод для оптимизации SDP с максимальными параметрами качества звука
    private optimizeSdpForHighQualityAudio(sdp: string): string {
        let optimizedSdp = sdp;
        
        // Приоритет кодека Opus с максимальным битрейтом
        optimizedSdp = optimizedSdp.replace(
            /m=audio (\d+) RTP\/SAVPF ([\d\s]+)/,
            (_match, port, codecs) => {
                // Устанавливаем Opus как приоритетный кодек
                const opusCodec = '111'; // Opus кодек
                const newCodecs = `${opusCodec} ${codecs.replace(opusCodec, '').trim()}`;
                return `m=audio ${port} RTP/SAVPF ${newCodecs}`;
            }
        );
        
        // Настройки Opus кодека для максимального качества
        optimizedSdp = optimizedSdp.replace(
            /a=fmtp:111 (.+)/,
            (_match, _params) => {
                // Устанавливаем максимальные параметры качества для Opus
                const optimizedParams = [
                    'minptime=10',           // Минимальное время пакета
                    'useinbandfec=1',         // Включаем FEC для восстановления пакетов
                    'stereo=1',               // Включаем стерео если поддерживается
                    'sprop-stereo=1',        // Поддержка стерео
                    'maxplaybackrate=48000', // Максимальная частота дискретизации
                    'maxaveragebitrate=256000', // Максимальный битрейт
                    'cbr=0',                 // Переменный битрейт для лучшего качества
                    'dtx=0',                 // Отключаем DTX для постоянного качества
                    'application=voip'        // Оптимизация для VoIP
                ].join(';');
                return `a=fmtp:111 ${optimizedParams}`;
            }
        );
        
        // Добавляем параметры для высокого качества если их нет
        if (!optimizedSdp.includes('a=fmtp:111')) {
            const opusFmtp = 'a=fmtp:111 minptime=10;useinbandfec=1;stereo=1;sprop-stereo=1;maxplaybackrate=48000;maxaveragebitrate=256000;cbr=0;dtx=0;application=voip';
            optimizedSdp = optimizedSdp.replace(/(a=rtcp-fb:111 .+)/, `$1\n${opusFmtp}`);
        }
        
        // Настройки для уменьшения задержки
        optimizedSdp = optimizedSdp.replace(
            /a=rtcp-fb:111 (.+)/,
            (_match, _params) => {
                const enhancedParams = [
                    'goog-remb',     // Google REMB для адаптивного битрейта
                    'transport-cc', // Transport-wide congestion control
                    'ccm fir',      // Codec Control Messages
                    'nack',         // Negative acknowledgments
                    'nack pli'      // Picture Loss Indication
                ].join(' ');
                return `a=rtcp-fb:111 ${enhancedParams}`;
            }
        );
        
        // Настройки для лучшего качества звука
        optimizedSdp = optimizedSdp.replace(
            /a=extmap:(\d+) urn:ietf:params:rtp-hdrext:ssrc-audio-level/,
            'a=extmap:$1 urn:ietf:params:rtp-hdrext:ssrc-audio-level'
        );
        
        // Добавляем расширения для улучшения качества
        if (!optimizedSdp.includes('urn:ietf:params:rtp-hdrext:ssrc-audio-level')) {
            optimizedSdp = optimizedSdp.replace(
                /(a=extmap:\d+ .+)/,
                '$1\na=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level'
            );
        }
        
        console.log('SDP оптимизирован для высокого качества звука');
        return optimizedSdp;
    }

    //логика работы с потоками
    private addRemoteStream(track: any, id: string): void {
        console.log('попытка добавить поток', id);
        let remoteStream = this.remoteStreams.get(id);
        if (!remoteStream) {
            remoteStream = new MediaStream();
            this.remoteStreams.set(id, remoteStream);
            console.log('Удалённый поток добавлен для пользователя:', id);
            
            // Создаем аудио контекст для этого участника
            const audioContext = new AudioContext();
            const gainNode = audioContext.createGain();
            
            // Устанавливаем начальную громкость
            const initialVolume = participantVolumeStore.getParticipantVolume(id);
            gainNode.gain.value = initialVolume / 100;
            
            this.audioContexts.set(id, audioContext);
            this.gainNodes.set(id, gainNode);
            
            // Создаем аудио элемент, но не добавляем его в DOM
            // Используем только для получения потока
            const audioElement = document.createElement('audio');
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.muted = true; // Всегда muted, используем только Web Audio API
            
            // Добавляем обработчик для события loadedmetadata
            audioElement.addEventListener('loadedmetadata', () => {
                console.log('Аудио метаданные загружены для участника:', id);
                // Повторно пытаемся настроить аудио обработку после загрузки метаданных
                const currentStream = this.remoteStreams.get(id);
                if (currentStream && currentStream.getAudioTracks().length > 0) {
                    this.setupAudioProcessing(id, currentStream);
                }
            });
            
            // Не добавляем в DOM, используем только для Web Audio API
            this.remoteAudioElements.set(id, audioElement); // Сохраняем ссылку
        } else {
            console.log('remoteStream не существует ');
        }

        // Добавляем трек в поток
        remoteStream.addTrack(track);
        
        // Проверяем, есть ли аудио треки в потоке, и только тогда создаем источник
        if (remoteStream.getAudioTracks().length > 0 && !this.audioContexts.get(id)?.state.includes('closed')) {
            this.setupAudioProcessing(id, remoteStream);
        }
    }

    // Настройка аудио обработки для участника
    private setupAudioProcessing(id: string, remoteStream: MediaStream): void {
        const audioContext = this.audioContexts.get(id);
        const gainNode = this.gainNodes.get(id);
        
        if (!audioContext || !gainNode) {
            console.error('AudioContext или GainNode не найдены для участника:', id);
            return;
        }

        // Проверяем, не создан ли уже источник для этого участника
        if (this.audioSources.has(id)) {
            console.log('Аудио источник уже существует для участника:', id);
            return;
        }

        try {
            // Проверяем, что поток содержит аудио треки
            if (remoteStream.getAudioTracks().length === 0) {
                console.warn('Поток не содержит аудио треков для участника:', id);
                return;
            }

            // Создаем источник только если его еще нет и контекст активен
            if (!audioContext.state.includes('closed')) {
                const source = audioContext.createMediaStreamSource(remoteStream);
                
                // Создаем оптимизированную цепочку обработки для максимального качества
                const compressor = audioContext.createDynamicsCompressor();
                compressor.threshold.value = -24; // Более мягкий порог
                compressor.knee.value = 30; // Более мягкий переход
                compressor.ratio.value = 4; // Оптимальное соотношение
                compressor.attack.value = 0.003; // Быстрая атака
                compressor.release.value = 0.25; // Оптимальное восстановление
                
                // Добавляем фильтр для улучшения качества голоса
                const voiceEnhancer = audioContext.createBiquadFilter();
                voiceEnhancer.type = 'peaking';
                voiceEnhancer.frequency.value = 1500; // Оптимальная частота для голоса
                voiceEnhancer.Q.value = 0.7;
                voiceEnhancer.gain.value = 2; // Легкое усиление голосовых частот
                
                // Добавляем фильтр для подавления низкочастотных шумов
                const highpassFilter = audioContext.createBiquadFilter();
                highpassFilter.type = 'highpass';
                highpassFilter.frequency.value = 80; // Убираем низкочастотные шумы
                highpassFilter.Q.value = 0.5;
                
                // Добавляем фильтр для подавления высокочастотных шумов
                const lowpassFilter = audioContext.createBiquadFilter();
                lowpassFilter.type = 'lowpass';
                lowpassFilter.frequency.value = 8000; // Сохраняем важные голосовые частоты
                lowpassFilter.Q.value = 0.5;
                
                // Подключаем оптимизированную цепочку обработки
                source.connect(highpassFilter);
                highpassFilter.connect(lowpassFilter);
                lowpassFilter.connect(voiceEnhancer);
                voiceEnhancer.connect(compressor);
                compressor.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                this.audioSources.set(id, source);
                console.log('Аудио обработка настроена для участника:', id);
                
                // Настраиваем VoiceActivity для удаленного участника
                this.setupRemoteVoiceActivity(id, remoteStream);
            }
        } catch (error) {
            console.error('Ошибка при настройке аудио обработки для участника:', id, error);
        }
    }

    public resendlocalStream() {
        console.log('WebRTCClient: Resending local stream...');
        if (audioSettingsStore.stream) {
            const newAudioTrack = audioSettingsStore.stream.getAudioTracks()[0];
            console.log('WebRTCClient: New audio track:', newAudioTrack?.label, 'enabled:', newAudioTrack?.enabled);
            
            this.peerConnections.forEach((peerConnection, socketId) => {
                const sender = peerConnection.getSenders().find((s) => s.track?.kind === 'audio');
                if (sender && newAudioTrack) {
                    console.log('WebRTCClient: Replacing audio track for peer:', socketId);
                    sender.replaceTrack(newAudioTrack);
                    // Синхронизируем состояние mute
                    newAudioTrack.enabled = !audioSettingsStore.isMicrophoneMuted;
                    console.log('WebRTCClient: Audio track replaced, enabled:', newAudioTrack.enabled);
                } else {
                    console.warn('WebRTCClient: No audio sender found for peer:', socketId);
                }
            });
        } else {
            console.error('WebRTCClient: No local stream available for resending');
        }
    }

    private addLocalStream(id: string): void {
        const peerConnection = this.peerConnections.get(id);
        console.log('add-local-stream', peerConnection);
        if (audioSettingsStore.stream) {
            audioSettingsStore.stream.getTracks().forEach((track) => {
                //Если существет локальный стрим и пир для подключения то рассылаем стрим
                peerConnection && peerConnection.addTrack(track, audioSettingsStore.stream);
                track.enabled = !audioSettingsStore.isMicrophoneMuted;
            });
        } else {
            console.log('🚀 ~ WebRTCClient ~ addLocalStream ~ localStream:', this.localStream);
            console.error('чего то нет ');
        }
    }

    // Управление состоянием mute для всех удаленных аудиоэлементов
    public setRemoteAudioMuted(muted: boolean): void {
        this.gainNodes.forEach((gainNode, socketId) => {
            if (muted) {
                gainNode.gain.value = 0;
            } else {
                // Восстанавливаем громкость из store
                const volume = participantVolumeStore.getParticipantVolume(socketId);
                gainNode.gain.value = volume / 100;
            }
        });
    }

    // Управление громкостью конкретного участника
    public setParticipantVolume(socketId: string, volume: number): void {
        const gainNode = this.gainNodes.get(socketId);
        if (gainNode) {
            gainNode.gain.value = volume / 100;
            participantVolumeStore.setParticipantVolume(socketId, volume);
        }
    }

    // Получить громкость участника
    public getParticipantVolume(socketId: string): number {
        return participantVolumeStore.getParticipantVolume(socketId);
    }

    // отключение

    // если пользователь отключился
    public disconnectPeer(id: string) {
        const peerConnection = this.peerConnections.get(id);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(id);
            console.log(`Соединение с пользователем ${id} закрыто`);
        }

        const remoteStream = this.remoteStreams.get(id);
        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => track.stop());
            this.remoteStreams.delete(id);
        }

        // Удаляем аудиоэлемент
        const audioElement = this.remoteAudioElements.get(id);
        if (audioElement) {
            // Не нужно удалять из DOM, так как мы его не добавляли
            this.remoteAudioElements.delete(id);
        }

        // Очищаем аудио контекст и gain node
        const audioContext = this.audioContexts.get(id);
        if (audioContext) {
            audioContext.close();
            this.audioContexts.delete(id);
        }
        this.gainNodes.delete(id);
        this.audioSources.delete(id);

        // Останавливаем VoiceActivity для этого участника
        voiceActivityService.stopMonitoring(id);

        // Удаляем из store громкости
        participantVolumeStore.removeParticipant(id);
    }
    // когда мы сами отключаемся
    public disconect() {
        //закрываем потоки
        this.peerConnections.forEach((peerConnection) => {
            peerConnection.close();
        });
        this.peerConnections.clear();

        if (audioSettingsStore.stream) {
            audioSettingsStore.stream.getTracks().forEach((track) => track.stop());
        }

        //тормозим стримы
        this.remoteStreams.forEach((stream) => {
            stream.getTracks().forEach((track) => track.stop());
        });
        this.remoteStreams.clear();

        // Очищаем все аудиоэлементы
        this.remoteAudioElements.clear();

        // Закрываем все аудио контексты
        this.audioContexts.forEach((audioContext) => {
            audioContext.close();
        });
        this.audioContexts.clear();
        this.gainNodes.clear();
        this.audioSources.clear();

        // Очищаем store громкости
        participantVolumeStore.resetAllVolumes();
        
        // Очищаем VoiceActivity сервис
        voiceActivityService.cleanup();
    }

    // Настройка VoiceActivity для локального потока
    private setupLocalVoiceActivity(): void {
        if (audioSettingsStore.stream) {
            console.log('Setting up local VoiceActivity, stream tracks:', audioSettingsStore.stream.getAudioTracks().length);
            voiceActivityService.startMonitoring('local', audioSettingsStore.stream);
            console.log('VoiceActivity настроен для локального потока');
        } else {
            console.log('No stream available for local VoiceActivity setup');
        }
    }

    // Настройка VoiceActivity для удаленного участника
    private setupRemoteVoiceActivity(userId: string, remoteStream: MediaStream): void {
        voiceActivityService.startMonitoring(userId, remoteStream);
        console.log(`VoiceActivity настроен для удаленного участника: ${userId}`);
    }

    // Получить состояние активности речи пользователя
    public getUserVoiceActivity(userId: string): boolean {
        return voiceActivityService.getUserActivity(userId);
    }

    // Получить уровень громкости пользователя
    public getUserVolumeLevel(userId: string): number {
        return voiceActivityService.getUserVolume(userId);
    }
}

export default WebRTCClient;

