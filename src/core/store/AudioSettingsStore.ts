import { makeAutoObservable, runInAction } from 'mobx';
import { notificationStore } from './NotificationStore';
import type { VoiceRoomStore } from '../../modules/voice/store/roomStore';
// Динамический импорт roomStore для избежания циклических зависимостей
let roomStore: VoiceRoomStore | null = null;
const getRoomStore = async () => {
    if (!roomStore) {
        const roomStoreModule = await import('../../modules/voice/store/roomStore');
        roomStore = roomStoreModule.default;
    }
    return roomStore;
};
import type { VoiceRoomStore } from '../../modules/voice/store/roomStore';

class AudioSettingsStore {
    public stream: MediaStream = new MediaStream();

    public microphoneDevices: MediaDeviceInfo[] = [];
    public speakerDevices: MediaDeviceInfo[] = [];
    public selectedMicrophone?: MediaDeviceInfo;
    public selectedSpeaker?: MediaDeviceInfo;

    // Режимы настроек
    public settingsMode: 'simple' | 'detailed' = 'simple';
    public audioQuality: 'low' | 'medium' | 'high' | 'ultra' = 'high';

    // Основные настройки - оптимизированы для максимального качества
    public echoCancellation = true;
    public noiseSuppression = true;
    public autoGainControl = true;
    public sampleRate = 48000; // Максимальная частота дискретизации для лучшего качества
    public sampleSize = 24; // Увеличенная разрядность для лучшего качества
    public channelCount = 2; // Стерео для лучшего качества звука
    public latency = 50; // Минимальная задержка для лучшего отклика
    public volume = 80; // Оптимальная громкость по умолчанию
    public isMicrophoneMuted = false;
    public isSpeakerMuted = false;

    // Дополнительные настройки для детального режима - оптимизированы для максимального качества
    public bitrate = 256; // Максимальный битрейт для лучшего качества
    public bufferSize = 2048; // Уменьшенный буфер для меньшей задержки
    public compressionLevel = 0.1; // Минимальное сжатие для лучшего качества
    public voiceEnhancement = true; // Улучшение голоса
    public voiceClarity = 0.8; // Максимальная четкость голоса
    public backgroundNoiseReduction = 0.8; // Максимальное снижение шума
    public voiceBoost = 0.3; // Оптимальное усиление голоса
    public bassBoost = 0.2; // Усиление басов для лучшего звучания
    public trebleBoost = 0.2; // Усиление высоких частот для четкости
    public stereoEnhancement = true; // Включаем стерео улучшение
    public spatialAudio = true; // Включаем пространственный звук
    public voiceIsolation = true; // Изоляция голоса
    public dynamicRangeCompression = 0.2; // Минимальное сжатие для лучшего качества

    private _stream: MediaStream = new MediaStream();
    private audioContext = new AudioContext();
    private gainNode: GainNode = new GainNode(this.audioContext);
    private audioSource: MediaStreamAudioSourceNode | null = null;

    // Кэш для аудио процессоров для обновления в реальном времени
    private audioProcessors: {
        voiceEnhancer?: BiquadFilterNode;
        voiceIsolator?: BiquadFilterNode;
        voiceBooster?: BiquadFilterNode;
        bassBooster?: BiquadFilterNode;
        trebleBooster?: BiquadFilterNode;
        compressor?: DynamicsCompressorNode;
        stereoEnhancer?: BiquadFilterNode;
        spatialProcessor?: BiquadFilterNode;
    } = {};

    public constructor() {
        makeAutoObservable(this);
        this.fetchAudioDevices();
    }

    public initMedia() {
        // Проверяем, не инициализирован ли уже поток и активен ли он
        if (
            this._stream &&
            this._stream.getAudioTracks().length > 0 &&
            this._stream.getAudioTracks().some((track) => track.readyState === 'live')
        ) {
            console.log('AudioSettingsStore: Media stream already exists and is active, skipping initialization');
            return;
        }
        console.log('AudioSettingsStore: Initializing media stream...');
        this.updateMediaStream();
    }

    public cleanup() {
        console.log('AudioSettingsStore: Cleaning up media resources...');

        // Останавливаем все треки
        if (this._stream) {
            this._stream.getTracks().forEach((track) => track.stop());
        }
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
        }

        // Закрываем аудио контекст
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }

        // Сбрасываем потоки
        this._stream = new MediaStream();
        this.stream = new MediaStream();

        // Пересоздаем аудио контекст для следующего использования
        this.audioContext = new AudioContext();
        this.gainNode = new GainNode(this.audioContext);
        this.audioSource = null;

        // Очищаем кэш процессоров
        this.audioProcessors = {};

        console.log('AudioSettingsStore: Media resources cleaned up');
    }

    // Проверка, нужен ли микрофон в данный момент
    public isMicrophoneNeeded(): boolean {
        return this._stream && this._stream.getAudioTracks().length > 0;
    }

    // Проверка, активен ли микрофон (не заглушен)
    public isMicrophoneActive(): boolean {
        if (!this.isMicrophoneNeeded()) {
            return false;
        }
        return this._stream.getAudioTracks().some((track) => track.enabled && track.readyState === 'live');
    }

    // Методы для управления режимами
    public setSettingsMode(mode: 'simple' | 'detailed') {
        this.settingsMode = mode;
        if (mode === 'simple') {
            this.applySimpleQualitySettings();
        }
    }

    public setAudioQuality(quality: 'low' | 'medium' | 'high' | 'ultra') {
        this.audioQuality = quality;
        this.applySimpleQualitySettings();
    }

    private applySimpleQualitySettings() {
        switch (this.audioQuality) {
            case 'low':
                this.sampleRate = 24000; // Улучшенная частота даже для низкого качества
                this.sampleSize = 16;
                this.bitrate = 96; // Увеличенный битрейт
                this.latency = 100; // Уменьшенная задержка
                this.echoCancellation = true;
                this.noiseSuppression = true;
                this.autoGainControl = true;
                this.voiceEnhancement = true; // Включаем даже для низкого качества
                this.voiceIsolation = true;
                this.voiceClarity = 0.5; // Улучшенная четкость
                this.backgroundNoiseReduction = 0.6;
                this.voiceBoost = 0.2;
                this.bassBoost = 0.1;
                this.trebleBoost = 0.1;
                this.dynamicRangeCompression = 0.2;
                this.stereoEnhancement = false;
                this.spatialAudio = false;
                break;
            case 'medium':
                this.sampleRate = 48000; // Максимальная частота для среднего качества
                this.sampleSize = 24; // Увеличенная разрядность
                this.bitrate = 192; // Высокий битрейт
                this.latency = 75; // Минимальная задержка
                this.echoCancellation = true;
                this.noiseSuppression = true;
                this.autoGainControl = true;
                this.voiceEnhancement = true;
                this.voiceIsolation = true;
                this.voiceClarity = 0.7; // Высокая четкость
                this.backgroundNoiseReduction = 0.7;
                this.voiceBoost = 0.25;
                this.bassBoost = 0.15;
                this.trebleBoost = 0.15;
                this.dynamicRangeCompression = 0.2;
                this.stereoEnhancement = true;
                this.spatialAudio = true;
                break;
            case 'high':
                this.sampleRate = 48000; // Максимальная частота дискретизации
                this.sampleSize = 24; // Максимальная разрядность
                this.bitrate = 320; // Максимальный битрейт
                this.latency = 50; // Минимальная задержка
                this.echoCancellation = true;
                this.noiseSuppression = true;
                this.autoGainControl = true;
                this.voiceEnhancement = true;
                this.voiceIsolation = true;
                this.voiceClarity = 0.9; // Максимальная четкость
                this.backgroundNoiseReduction = 0.8;
                this.voiceBoost = 0.3;
                this.bassBoost = 0.2;
                this.trebleBoost = 0.2;
                this.dynamicRangeCompression = 0.1; // Минимальное сжатие
                this.stereoEnhancement = true;
                this.spatialAudio = true;
                break;
            case 'ultra':
                this.sampleRate = 48000; // Максимальная частота дискретизации
                this.sampleSize = 32; // Профессиональная разрядность
                this.bitrate = 512; // Профессиональный битрейт
                this.latency = 25; // Минимальная задержка
                this.echoCancellation = true;
                this.noiseSuppression = true;
                this.autoGainControl = true;
                this.voiceEnhancement = true;
                this.voiceIsolation = true;
                this.voiceClarity = 1.0; // Максимальная четкость
                this.backgroundNoiseReduction = 0.9;
                this.voiceBoost = 0.4;
                this.bassBoost = 0.3;
                this.trebleBoost = 0.3;
                this.dynamicRangeCompression = 0.05; // Минимальное сжатие
                this.stereoEnhancement = true;
                this.spatialAudio = true;
                break;
        }
        this.updateMediaStream();
    }

    // Методы для изменения настроек (требуют пересоздания потока)
    public async setEchoCancellation(value: boolean) {
        if (this.echoCancellation === value) {
            return;
        }
        this.echoCancellation = value;
        this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setNoiseSuppression(value: boolean) {
        if (this.noiseSuppression === value) {
            return;
        }
        this.noiseSuppression = value;
        this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setAutoGainControl(value: boolean) {
        if (this.autoGainControl === value) {
            return;
        }
        this.autoGainControl = value;
        this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setSampleRate(rate: number) {
        if (this.sampleRate === rate) {
            return;
        }
        this.sampleRate = rate;
        this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setSampleSize(size: number) {
        if (this.sampleSize === size) {
            return;
        }
        this.sampleSize = size;
        this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public setLatency(latency: number) {
        this.latency = latency;
        // Задержка не требует пересоздания потока
    }

    public setChannelCount(channelCount: 'stereo' | 'mono') {
        this.channelCount = channelCount === 'stereo' ? 2 : 1;
        this.updateMediaStream();
    }

    public async setSpeaker(deviceId: string): Promise<void> {
        const device = this.speakerDevices.find((device) => device.deviceId === deviceId);
        if (device) {
            this.selectedSpeaker = device;
            // Применяем выбранное устройство к удаленным аудиоэлементам
            const store = await getRoomStore();
            (store as VoiceRoomStore).webRTCClient?.setRemoteAudioMuted(this.isSpeakerMuted);
        }
    }

    public async setMicrophone(deviceId: string): Promise<void> {
        const device = this.microphoneDevices.find((device) => device.deviceId === deviceId);
        if (device && this.selectedMicrophone?.deviceId !== deviceId) {
            console.log(
                'AudioSettingsStore: Switching microphone from',
                this.selectedMicrophone?.deviceId,
                'to',
                deviceId
            );
            this.selectedMicrophone = device;

            try {
                // Принудительно обновляем поток при смене микрофона
                await this.updateMediaStream(true);

                // Показываем уведомление об успехе
                notificationStore.addNotification(
                    `Микрофон изменен на: ${device.label || 'Неизвестное устройство'}`,
                    'success'
                );
            } catch (error) {
                console.error('AudioSettingsStore: Error switching microphone:', error);

                // Показываем уведомление об ошибке
                notificationStore.addNotification(
                    `Ошибка при смене микрофона: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
                    'error'
                );
            }
        }
    }

    public setVolume(newVolume: number): void {
        this.volume = newVolume;
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume / 50;
        }
        // Не пересоздаем поток для изменения громкости
    }

    // Методы для дополнительных настроек (требуют пересоздания потока)
    public async setBitrate(bitrate: number): Promise<void> {
        if (this.bitrate === bitrate) {
            return;
        }
        this.bitrate = bitrate;
        this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setBufferSize(bufferSize: number): Promise<void> {
        if (this.bufferSize === bufferSize) {
            return;
        }
        this.bufferSize = bufferSize;
        this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setCompressionLevel(level: number): Promise<void> {
        if (this.compressionLevel === level) {
            return;
        }
        this.compressionLevel = Math.max(0, Math.min(1, level));
        this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    // Метод для принудительного применения всех настроек
    public async applyAllSettings(): Promise<void> {
        try {
            console.log('AudioSettingsStore: Applying all audio settings...');

            // Обновляем медиа поток с новыми настройками
            await this.updateMediaStream(true);

            // Если пользователь подключен к голосовому каналу, переподключаемся
            const store = await getRoomStore();
            const voiceStore = store as VoiceRoomStore;

            if (voiceStore.currentVoiceChannel) {
                console.log('AudioSettingsStore: Reconnecting to voice channel with new settings...');
                const currentChannel = voiceStore.currentVoiceChannel;

                // Отключаемся от текущего канала
                voiceStore.disconnectToRoom();

                // Небольшая задержка для корректного отключения
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Переподключаемся с новыми настройками
                voiceStore.connectToRoom(currentChannel.id, currentChannel.name);
                console.log('AudioSettingsStore: Reconnected to voice channel with new settings');
            } else {
                // Если не подключен к каналу, просто обновляем WebRTC поток
                if (voiceStore.webRTCClient?.resendlocalStream) {
                    voiceStore.webRTCClient.resendlocalStream();
                }
                console.log('AudioSettingsStore: Settings applied (not connected to voice channel)');
            }
        } catch (error) {
            console.error('AudioSettingsStore: Error applying all settings:', error);
            throw error;
        }
    }

    // Метод для сброса настроек к умолчанию
    public async resetToDefaults(): Promise<void> {
        console.log('AudioSettingsStore: Resetting to default settings...');

        // Сбрасываем основные настройки
        this.echoCancellation = true;
        this.noiseSuppression = true;
        this.autoGainControl = true;
        this.volume = 80;
        this.sampleRate = 48000;
        this.bitrate = 256;
        this.latency = 50;
        this.channelCount = 2;
        this.audioQuality = 'high';

        // Сбрасываем дополнительные настройки
        this.voiceEnhancement = true;
        this.voiceClarity = 0.8;
        this.backgroundNoiseReduction = 0.8;
        this.voiceBoost = 0.3;
        this.bassBoost = 0.2;
        this.trebleBoost = 0.2;
        this.stereoEnhancement = true;
        this.spatialAudio = true;
        this.voiceIsolation = true;
        this.dynamicRangeCompression = 0.2;

        // Применяем настройки (включая переподключение если нужно)
        await this.applyAllSettings();

        console.log('AudioSettingsStore: Settings reset to defaults');
    }

    // Методы для настроек в реальном времени (не требуют пересоздания потока)
    public async setVoiceEnhancement(enabled: boolean): Promise<void> {
        if (this.voiceEnhancement === enabled) {
            return;
        }
        this.voiceEnhancement = enabled;
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setVoiceClarity(clarity: number): Promise<void> {
        if (this.voiceClarity === clarity) {
            return;
        }
        this.voiceClarity = Math.max(0, Math.min(1, clarity));
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setBackgroundNoiseReduction(reduction: number): Promise<void> {
        if (this.backgroundNoiseReduction === reduction) {
            return;
        }
        this.backgroundNoiseReduction = Math.max(0, Math.min(1, reduction));
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setVoiceBoost(boost: number): Promise<void> {
        if (this.voiceBoost === boost) {
            return;
        }
        this.voiceBoost = Math.max(0, Math.min(1, boost));
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setBassBoost(boost: number): Promise<void> {
        if (this.bassBoost === boost) {
            return;
        }
        this.bassBoost = Math.max(0, Math.min(1, boost));
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setTrebleBoost(boost: number): Promise<void> {
        if (this.trebleBoost === boost) {
            return;
        }
        this.trebleBoost = Math.max(0, Math.min(1, boost));
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setStereoEnhancement(enabled: boolean): Promise<void> {
        if (this.stereoEnhancement === enabled) {
            return;
        }
        this.stereoEnhancement = enabled;
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setSpatialAudio(enabled: boolean): Promise<void> {
        if (this.spatialAudio === enabled) {
            return;
        }
        this.spatialAudio = enabled;
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setVoiceIsolation(enabled: boolean): Promise<void> {
        if (this.voiceIsolation === enabled) {
            return;
        }
        this.voiceIsolation = enabled;
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public async setDynamicRangeCompression(compression: number): Promise<void> {
        if (this.dynamicRangeCompression === compression) {
            return;
        }
        this.dynamicRangeCompression = Math.max(0, Math.min(1, compression));
        this.updateRealtimeSettings();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
            (store as VoiceRoomStore).webRTCClient.resendlocalStream();
        }
    }

    public toggleMicrophoneMute(): void {
        this.isMicrophoneMuted = !this.isMicrophoneMuted;
        if (this.isMicrophoneMuted) {
            // Отключаем микрофон
            this._stream.getAudioTracks().forEach((track) => {
                track.enabled = false;
            });
            // Также отключаем в обработанном потоке
            this.stream.getAudioTracks().forEach((track) => {
                track.enabled = false;
            });
        } else {
            // Включаем микрофон
            this._stream.getAudioTracks().forEach((track) => {
                track.enabled = true;
            });
            // Также включаем в обработанном потоке
            this.stream.getAudioTracks().forEach((track) => {
                track.enabled = true;
            });
        }
    }

    public async toggleSpeakerMute(): Promise<void> {
        this.isSpeakerMuted = !this.isSpeakerMuted;

        // Управляем удаленными аудиоэлементами через roomStore
        const store = await getRoomStore();
        // Используем экземпляр WebRTCClient из roomStore
        (store as VoiceRoomStore).webRTCClient?.setRemoteAudioMuted(this.isSpeakerMuted);

        console.log('Speaker mute toggled:', this.isSpeakerMuted);
    }

    // Получение списка аудиоустройств
    private fetchAudioDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();

            runInAction(() => {
                this.microphoneDevices = devices.filter((device) => device.kind === 'audioinput');
                this.speakerDevices = devices.filter((device) => device.kind === 'audiooutput');

                // Устанавливаем микрофон по умолчанию только если он еще не выбран
                if (!this.selectedMicrophone && this.microphoneDevices.length > 0) {
                    this.selectedMicrophone = this.microphoneDevices[0];
                }

                // Устанавливаем динамик по умолчанию только если он еще не выбран
                if (!this.selectedSpeaker && this.speakerDevices.length > 0) {
                    this.selectedSpeaker = this.speakerDevices[0];
                }
            });
        } catch (error) {
            console.error('Error fetching audio devices:', error);
        }
    };

    private async updateMediaStream(forceUpdate: boolean = false) {
        try {
            console.log('AudioSettingsStore: Starting media stream update...', forceUpdate ? '(forced)' : '');
            await this.ensureAudioContextIsRunning();

            // Проверяем, нужно ли пересоздавать поток
            const needsRecreation =
                forceUpdate ||
                !this._stream ||
                this._stream.getAudioTracks().length === 0 ||
                this._stream.getAudioTracks().some((track) => track.readyState === 'ended');

            if (!needsRecreation) {
                console.log('AudioSettingsStore: Existing media stream is still valid, skipping recreation');
                return;
            }

            console.log('AudioSettingsStore: Recreating media stream...');

            // Останавливаем предыдущий поток
            if (this._stream) {
                this._stream.getTracks().forEach((track) => track.stop());
            }

            runInAction(async () => {
                console.log(
                    'AudioSettingsStore: Requesting getUserMedia with device:',
                    this.selectedMicrophone?.deviceId
                );
                this._stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: this.echoCancellation,
                        noiseSuppression: this.noiseSuppression,
                        autoGainControl: this.autoGainControl,
                        sampleRate: this.sampleRate,
                        sampleSize: this.sampleSize,
                        channelCount: this.channelCount,
                        deviceId: this.selectedMicrophone?.deviceId,
                        groupId: this.selectedMicrophone?.groupId
                    } as MediaTrackConstraints,
                    video: false
                });
                console.log(
                    'AudioSettingsStore: getUserMedia success, audio tracks:',
                    this._stream.getAudioTracks().length
                );
                this.prepareMediaStream();

                // Обновляем WebRTC поток после смены микрофона
                if (forceUpdate) {
                    console.log('AudioSettingsStore: Updating WebRTC stream after microphone change...');
                    // Обновляем WebRTC поток через roomStore
                    const store = await getRoomStore();
                    if ((store as VoiceRoomStore).webRTCClient?.resendlocalStream) {
                        (store as VoiceRoomStore).webRTCClient.resendlocalStream();
                    }
                }
            });
        } catch (error) {
            console.error('AudioSettingsStore: Error updating media stream:', error);
        }
    }
    private prepareMediaStream() {
        try {
            console.log('AudioSettingsStore: Preparing media stream with enhanced settings...');

            // Очищаем предыдущие процессоры
            this.audioProcessors = {};

            // Создаем источник из потока микрофона
            this.audioSource = this.audioContext.createMediaStreamSource(this._stream);

            // Создаем GainNode для регулировки громкости
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume / 50;

            // Подключаем источник к GainNode
            this.audioSource.connect(this.gainNode);

            // Создаем destination для выходного потока
            const destination = this.audioContext.createMediaStreamDestination();

            // Создаем цепочку обработки аудио
            const audioChain = this.createAudioProcessingChain();

            // Подключаем цепочку обработки
            this.gainNode.connect(audioChain.input);
            audioChain.output.connect(destination);

            // Сохраняем новый поток
            this.stream = destination.stream;

            // Применяем настройки в реальном времени после создания цепочки
            this.updateRealtimeSettings();

            console.log(
                'AudioSettingsStore: Enhanced media stream prepared, output tracks:',
                this.stream.getAudioTracks().length
            );
            console.log(
                'AudioSettingsStore: Applied settings - Voice Enhancement:',
                this.voiceEnhancement,
                'Voice Clarity:',
                this.voiceClarity,
                'Noise Reduction:',
                this.backgroundNoiseReduction
            );
        } catch (error) {
            console.error('AudioSettingsStore: Error preparing media stream:', error);
        }
    }

    // Обновление настроек в реальном времени без пересоздания потока
    private updateRealtimeSettings() {
        try {
            console.log('AudioSettingsStore: Updating realtime audio settings...');

            // Если нет активного потока, пропускаем обновление
            if (!this._stream || this._stream.getAudioTracks().length === 0) {
                console.log('AudioSettingsStore: No active stream, skipping realtime update');
                return;
            }

            // Обновляем параметры существующих процессоров
            if (this.audioProcessors.voiceEnhancer) {
                this.audioProcessors.voiceEnhancer.gain.value = this.voiceClarity * 3;
                console.log('AudioSettingsStore: Updated voice enhancer gain:', this.voiceClarity * 3);
            }

            if (this.audioProcessors.voiceBooster) {
                this.audioProcessors.voiceBooster.gain.value = this.voiceBoost * 8;
                console.log('AudioSettingsStore: Updated voice booster gain:', this.voiceBoost * 8);
            }

            if (this.audioProcessors.bassBooster) {
                this.audioProcessors.bassBooster.gain.value = this.bassBoost * 5;
                console.log('AudioSettingsStore: Updated bass booster gain:', this.bassBoost * 5);
            }

            if (this.audioProcessors.trebleBooster) {
                this.audioProcessors.trebleBooster.gain.value = this.trebleBoost * 5;
                console.log('AudioSettingsStore: Updated treble booster gain:', this.trebleBoost * 5);
            }

            if (this.audioProcessors.compressor) {
                const compressionRatio = 1 + this.dynamicRangeCompression * 8; // 1-9
                this.audioProcessors.compressor.ratio.value = compressionRatio;
                console.log('AudioSettingsStore: Updated compressor ratio:', compressionRatio);
            }

            // Обновляем параметры фильтров шумоподавления
            if (this.audioProcessors.voiceIsolator) {
                // Обновляем частоты фильтрации в зависимости от уровня шумоподавления
                const cutoffFreq = 300 + this.backgroundNoiseReduction * 200; // 300-500 Hz
                this.audioProcessors.voiceIsolator.frequency.value = cutoffFreq;
                console.log('AudioSettingsStore: Updated voice isolator frequency:', cutoffFreq);
            }

            console.log('AudioSettingsStore: Realtime settings updated successfully');
        } catch (error) {
            console.error('AudioSettingsStore: Error updating realtime settings:', error);
        }
    }

    private createAudioProcessingChain() {
        const input = this.audioContext.createGain();
        const output = this.audioContext.createGain();

        let currentNode = input;

        // Базовые фильтры
        if (this.echoCancellation || this.noiseSuppression || this.autoGainControl) {
            const { highpassFilter, lowpassFilter } = this.createVoiceEnhancementFilters();
            currentNode.connect(highpassFilter);
            currentNode = highpassFilter;
            currentNode.connect(lowpassFilter);
            currentNode = lowpassFilter;
        }

        // Улучшение голоса
        if (this.voiceEnhancement) {
            const voiceEnhancer = this.createVoiceEnhancer();
            this.audioProcessors.voiceEnhancer = voiceEnhancer;
            currentNode.connect(voiceEnhancer);
            currentNode = voiceEnhancer;
        }

        // Изоляция голоса
        if (this.voiceIsolation) {
            const voiceIsolator = this.createVoiceIsolator();
            this.audioProcessors.voiceIsolator = voiceIsolator;
            currentNode.connect(voiceIsolator);
            currentNode = voiceIsolator;
        }

        // Усиление голоса
        if (this.voiceBoost > 0) {
            const voiceBooster = this.createVoiceBooster();
            this.audioProcessors.voiceBooster = voiceBooster;
            currentNode.connect(voiceBooster);
            currentNode = voiceBooster;
        }

        // Усиление басов
        if (this.bassBoost > 0) {
            const bassBooster = this.createBassBooster();
            this.audioProcessors.bassBooster = bassBooster;
            currentNode.connect(bassBooster);
            currentNode = bassBooster;
        }

        // Усиление высоких частот
        if (this.trebleBoost > 0) {
            const trebleBooster = this.createTrebleBooster();
            this.audioProcessors.trebleBooster = trebleBooster;
            currentNode.connect(trebleBooster);
            currentNode = trebleBooster;
        }

        // Динамическое сжатие
        if (this.dynamicRangeCompression > 0) {
            const compressor = this.createDynamicCompressor();
            this.audioProcessors.compressor = compressor;
            currentNode.connect(compressor);
            currentNode = compressor;
        }

        // Стерео улучшение
        if (this.stereoEnhancement) {
            const stereoEnhancer = this.createStereoEnhancer();
            this.audioProcessors.stereoEnhancer = stereoEnhancer;
            currentNode.connect(stereoEnhancer);
            currentNode = stereoEnhancer;
        }

        // Пространственный звук
        if (this.spatialAudio) {
            const spatialProcessor = this.createSpatialProcessor();
            this.audioProcessors.spatialProcessor = spatialProcessor;
            currentNode.connect(spatialProcessor);
            currentNode = spatialProcessor;
        }

        currentNode.connect(output);

        return { input, output };
    }

    private async ensureAudioContextIsRunning() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    private createVoiceEnhancementFilters() {
        // Создаем более мягкие фильтры для предотвращения эффекта "бочки"
        const highpassFilter = this.audioContext.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.value = 80; // Более мягкий срез низких частот
        highpassFilter.Q.value = 0.5; // Мягкий переход

        // Создаем низкочастотный фильтр для удаления высокочастотных шумов
        const lowpassFilter = this.audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.value = 8000; // Расширяем диапазон для лучшего качества голоса
        lowpassFilter.Q.value = 0.5; // Мягкий переход

        return { highpassFilter, lowpassFilter };
    }

    private createVoiceEnhancer() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 1500; // Оптимальная частота для голоса
        filter.Q.value = 0.7; // Более мягкий резонанс
        filter.gain.value = this.voiceClarity * 3; // Уменьшенное усиление для предотвращения искажений
        return filter;
    }

    private createVoiceIsolator() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200; // Оптимальная частота для речи
        filter.Q.value = 1.2; // Более мягкая изоляция
        return filter;
    }

    private createVoiceBooster() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 1200; // Оптимальная частота для голоса
        filter.Q.value = 0.5; // Мягкий резонанс
        filter.gain.value = this.voiceBoost * 8; // Уменьшенное усиление
        return filter;
    }

    private createBassBooster() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowshelf';
        filter.frequency.value = 250;
        filter.gain.value = this.bassBoost * 10; // Усиление басов
        return filter;
    }

    private createTrebleBooster() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highshelf';
        filter.frequency.value = 3000;
        filter.gain.value = this.trebleBoost * 10; // Усиление высоких частот
        return filter;
    }

    private createDynamicCompressor() {
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        return compressor as AudioNode; // Приводим к типу AudioNode для совместимости
    }

    private createStereoEnhancer() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 2000;
        filter.Q.value = 0.3;
        filter.gain.value = 3; // Легкое стерео улучшение
        return filter;
    }

    private createSpatialProcessor() {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 1000;
        filter.Q.value = 0.5;
        filter.gain.value = 2; // Пространственный эффект
        return filter;
    }

    public testSpeakers(): void {
        if (!this.selectedSpeaker) {
            console.error('Нет выбранных динамиков для тестирования');
            return;
        }

        // Создаем аудиоконтекст
        const audioContext = new window.AudioContext();

        // Создаем осциллятор для тестового звука
        const oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440 Hz (A4 нота)
        oscillator.type = 'sine'; // Синусоидальная волна

        // Создаем усилитель (gain node)
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Громкость 50%

        // Подключаем осциллятор к усилителю, а усилитель — к выходу
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Запускаем осциллятор
        oscillator.start();

        // Останавливаем осциллятор через 1 секунду
        oscillator.stop(audioContext.currentTime + 1);

        console.log('Тестирование динамиков...');
    }

    public testMicrophone(): void {
        if (!this.selectedMicrophone) {
            console.error('Нет выбранного микрофона для тестирования');
            return;
        }

        // Создание аудио контекста и источника для записи
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const bufferSize = 2048;
        const microphoneStream = this._stream; // Поток микрофона, который мы получаем

        const microphoneSource = audioContext.createMediaStreamSource(microphoneStream);
        microphoneSource.connect(analyser);

        // Установка параметров для анализа
        analyser.fftSize = bufferSize;

        const buffer = new Float32Array(analyser.frequencyBinCount);

        // Функция для анализа звука
        const checkMicrophone = () => {
            analyser.getFloatFrequencyData(buffer);

            // Проверка, если есть значительная активность на микрофоне
            if (buffer.some((value) => value > -50)) {
                // Примерная пороговая величина
                console.log('Микрофон работает, есть звук');
            } else {
                console.log('Микрофон не регистрирует звук');
            }

            requestAnimationFrame(checkMicrophone);
        };

        // Запуск проверки
        checkMicrophone();
    }
}

const audioSettingsStore = new AudioSettingsStore();
export default audioSettingsStore;
