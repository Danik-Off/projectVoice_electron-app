/* eslint-disable max-lines */
import { makeAutoObservable, runInAction } from 'mobx';
import { notificationStore } from './NotificationStore';
import type { VoiceRoomStore } from '../../modules/voice/store/roomStore';
// Динамический импорт roomStore для избежания циклических зависимостей
let roomStore: VoiceRoomStore | null = null;
const getRoomStore = async (): Promise<VoiceRoomStore | null> => {
    if (roomStore !== null) {
        return roomStore;
    }
    const roomStoreModule = await import('../../modules/voice/store/roomStore');
    const loadedStore = roomStoreModule.default;
    // eslint-disable-next-line require-atomic-updates
    roomStore = loadedStore;
    return roomStore;
};

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

    // Дополнительные настройки для детального режима
    public bitrate = 256; // Максимальный битрейт для лучшего качества
    public bufferSize = 2048; // Уменьшенный буфер для меньшей задержки
    public compressionLevel = 0.1; // Минимальное сжатие для лучшего качества
    public voiceEnhancement = true; // Улучшение голоса (presence EQ)
    public voiceClarity = 0.6; // Умеренная четкость голоса (пресенс-фильтр)
    public backgroundNoiseReduction = 0.8; // Максимальное снижение шума
    public voiceBoost = 0; // Дополнительное усиление громкости голоса (makeup gain), нейтрально по умолчанию
    public bassBoost = 0; // Усиление низких частот, нейтрально по умолчанию
    public trebleBoost = 0; // Усиление высоких частот, нейтрально по умолчанию
    public dynamicRangeCompression = 0.2; // Мягкая компрессия для стабильной громкости без "рации"

    private _stream: MediaStream = new MediaStream();
    private audioContext = new AudioContext();
    private gainNode: GainNode = new GainNode(this.audioContext);
    private audioSource: MediaStreamAudioSourceNode | null = null;

    // Кэш для аудио процессоров для обновления в реальном времени
    private audioProcessors: {
        presence?: BiquadFilterNode;
        makeupGain?: GainNode;
        bassBooster?: BiquadFilterNode;
        trebleBooster?: BiquadFilterNode;
        compressor?: DynamicsCompressorNode;
    } = {};

    public constructor() {
        makeAutoObservable(this);
        this.fetchAudioDevices().catch(() => {
            // Error handled in fetchAudioDevices
        });
    }

    public initMedia() {
        // Проверяем, не инициализирован ли уже поток и активен ли он
        if (
            this._stream !== null &&
            this._stream.getAudioTracks().length > 0 &&
            this._stream.getAudioTracks().some((track) => track.readyState === 'live')
        ) {
            console.warn('AudioSettingsStore: Media stream already exists and is active, skipping initialization');
            return;
        }
        console.warn('AudioSettingsStore: Initializing media stream...');
        this.updateMediaStream().catch(() => {
            // Error handled in updateMediaStream
        });
    }

    public cleanup() {
        console.warn('AudioSettingsStore: Cleaning up media resources...');

        // Останавливаем все треки
        if (this._stream !== null) {
            this._stream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        if (this.stream !== null) {
            this.stream.getTracks().forEach((track) => {
                track.stop();
            });
        }

        // Закрываем аудио контекст
        if (this.audioContext !== null && this.audioContext.state !== 'closed') {
            this.audioContext.close().catch(() => {
                // Error handled silently
            });
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

        console.warn('AudioSettingsStore: Media resources cleaned up');
    }

    // Проверка, нужен ли микрофон в данный момент
    public isMicrophoneNeeded(): boolean {
        return this._stream !== null && this._stream.getAudioTracks().length > 0;
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
                this.sampleRate = 24000;
                this.sampleSize = 16;
                this.bitrate = 96;
                this.latency = 100;
                this.echoCancellation = true;
                this.noiseSuppression = true;
                this.autoGainControl = true;
                this.voiceEnhancement = true;
                this.voiceClarity = 0.4;
                this.backgroundNoiseReduction = 0.6;
                this.voiceBoost = 0;
                this.bassBoost = 0;
                this.trebleBoost = 0;
                this.dynamicRangeCompression = 0.2;
                break;
            case 'medium':
                this.sampleRate = 48000;
                this.sampleSize = 24;
                this.bitrate = 192;
                this.latency = 75;
                this.echoCancellation = true;
                this.noiseSuppression = true;
                this.autoGainControl = true;
                this.voiceEnhancement = true;
                this.voiceClarity = 0.5;
                this.backgroundNoiseReduction = 0.7;
                this.voiceBoost = 0;
                this.bassBoost = 0;
                this.trebleBoost = 0;
                this.dynamicRangeCompression = 0.2;
                break;
            case 'high':
                this.sampleRate = 48000;
                this.sampleSize = 24;
                this.bitrate = 320;
                this.latency = 50;
                this.echoCancellation = true;
                this.noiseSuppression = true;
                this.autoGainControl = true;
                this.voiceEnhancement = true;
                this.voiceClarity = 0.6;
                this.backgroundNoiseReduction = 0.8;
                this.voiceBoost = 0;
                this.bassBoost = 0;
                this.trebleBoost = 0;
                this.dynamicRangeCompression = 0.15;
                break;
            case 'ultra':
                this.sampleRate = 48000;
                this.sampleSize = 32;
                this.bitrate = 512;
                this.latency = 25;
                this.echoCancellation = true;
                this.noiseSuppression = true;
                this.autoGainControl = true;
                this.voiceEnhancement = true;
                this.voiceClarity = 0.6;
                this.backgroundNoiseReduction = 0.9;
                this.voiceBoost = 0;
                this.bassBoost = 0;
                this.trebleBoost = 0;
                this.dynamicRangeCompression = 0.1;
                break;
            default:
                // Default to high quality settings
                this.sampleRate = 48000;
                this.sampleSize = 24;
                this.bitrate = 320;
                this.latency = 50;
                this.echoCancellation = true;
                this.noiseSuppression = true;
                this.autoGainControl = true;
                this.voiceEnhancement = true;
                this.voiceClarity = 0.6;
                this.backgroundNoiseReduction = 0.8;
                this.voiceBoost = 0;
                this.bassBoost = 0;
                this.trebleBoost = 0;
                this.dynamicRangeCompression = 0.15;
                break;
        }
        this.updateMediaStream().catch(() => {
            // Error handled in updateMediaStream
        });
    }

    // Методы для изменения настроек (требуют пересоздания потока)
    public async setEchoCancellation(value: boolean) {
        if (this.echoCancellation === value) {
            return;
        }
        this.echoCancellation = value;
        await this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
        }
    }

    public async setNoiseSuppression(value: boolean) {
        if (this.noiseSuppression === value) {
            return;
        }
        this.noiseSuppression = value;
        await this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
        }
    }

    public async setAutoGainControl(value: boolean) {
        if (this.autoGainControl === value) {
            return;
        }
        this.autoGainControl = value;
        await this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
        }
    }

    public async setSampleRate(rate: number) {
        if (this.sampleRate === rate) {
            return;
        }
        this.sampleRate = rate;
        await this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
        }
    }

    public async setSampleSize(size: number) {
        if (this.sampleSize === size) {
            return;
        }
        this.sampleSize = size;
        await this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
        }
    }

    public setLatency(latency: number) {
        this.latency = latency;
        // Задержка не требует пересоздания потока
    }

    public setChannelCount(channelCount: 'stereo' | 'mono') {
        this.channelCount = channelCount === 'stereo' ? 2 : 1;
        this.updateMediaStream().catch(() => {
            // Error handled in updateMediaStream
        });
    }

    public async setSpeaker(deviceId: string): Promise<void> {
        const foundDevice = this.speakerDevices.find((d) => d.deviceId === deviceId);
        if (foundDevice != null) {
            this.selectedSpeaker = foundDevice;
            // Реально переключаем устройство вывода для звука удаленных участников
            const store = await getRoomStore();
            if (store != null) {
                await store.webRTCClient.setOutputDevice(deviceId);
            }
        }
    }

    public async setMicrophone(deviceId: string): Promise<void> {
        const foundDevice = this.microphoneDevices.find((d) => d.deviceId === deviceId);
        if (foundDevice != null && this.selectedMicrophone?.deviceId !== deviceId) {
            console.warn(
                'AudioSettingsStore: Switching microphone from',
                this.selectedMicrophone?.deviceId,
                'to',
                deviceId
            );
            this.selectedMicrophone = foundDevice;

            try {
                // Принудительно обновляем поток при смене микрофона
                await this.updateMediaStream(true);

                // Показываем уведомление об успехе
                notificationStore.addNotification(
                    `Микрофон изменен на: ${foundDevice.label ?? 'Неизвестное устройство'}`,
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
        if (this.gainNode != null) {
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
        await this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
        }
    }

    public async setBufferSize(bufferSize: number): Promise<void> {
        if (this.bufferSize === bufferSize) {
            return;
        }
        this.bufferSize = bufferSize;
        await this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
        }
    }

    public async setCompressionLevel(level: number): Promise<void> {
        if (this.compressionLevel === level) {
            return;
        }
        this.compressionLevel = Math.max(0, Math.min(1, level));
        await this.updateMediaStream();
        // Обновляем WebRTC поток через roomStore
        const store = await getRoomStore();
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
        }
    }

    // Метод для принудительного применения всех настроек
    public async applyAllSettings(): Promise<void> {
        try {
            console.warn('AudioSettingsStore: Applying all audio settings...');

            // Обновляем медиа поток с новыми настройками
            await this.updateMediaStream(true);

            // Если пользователь подключен к голосовому каналу, переподключаемся
            const store = await getRoomStore();
            const voiceStore = store;

            if (voiceStore?.currentVoiceChannel !== null) {
                console.warn('AudioSettingsStore: Reconnecting to voice channel with new settings...');
                const currentChannel = voiceStore.currentVoiceChannel;

                // Отключаемся от текущего канала
                voiceStore.disconnectToRoom();

                // Небольшая задержка для корректного отключения
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Переподключаемся с новыми настройками
                voiceStore.connectToRoom(currentChannel.id, currentChannel.name);
                console.warn('AudioSettingsStore: Reconnected to voice channel with new settings');
            } else {
                // Если не подключен к каналу, просто обновляем WebRTC поток
                if (voiceStore?.webRTCClient?.resendlocalStream !== null) {
                    voiceStore.webRTCClient.resendlocalStream();
                }
                console.warn('AudioSettingsStore: Settings applied (not connected to voice channel)');
            }
        } catch (error) {
            console.error('AudioSettingsStore: Error applying all settings:', error);
            throw error;
        }
    }

    // Метод для сброса настроек к умолчанию
    public async resetToDefaults(): Promise<void> {
        console.warn('AudioSettingsStore: Resetting to default settings...');

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
        this.voiceClarity = 0.6;
        this.backgroundNoiseReduction = 0.8;
        this.voiceBoost = 0;
        this.bassBoost = 0;
        this.trebleBoost = 0;
        this.dynamicRangeCompression = 0.15;

        // Применяем настройки (включая переподключение если нужно)
        await this.applyAllSettings();

        console.warn('AudioSettingsStore: Settings reset to defaults');
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
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
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
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
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
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
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
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
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
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
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
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
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
        if (store?.webRTCClient?.resendlocalStream !== null) {
            store.webRTCClient.resendlocalStream();
        }
    }

    public toggleMicrophoneMute(): void {
        this.isMicrophoneMuted = !this.isMicrophoneMuted;
        if (this.isMicrophoneMuted) {
            // Отключаем микрофон
            /* eslint-disable no-param-reassign */
            this._stream.getAudioTracks().forEach((audioTrack) => {
                audioTrack.enabled = false;
            });
            // Также отключаем в обработанном потоке
            this.stream.getAudioTracks().forEach((audioTrack) => {
                audioTrack.enabled = false;
            });
            /* eslint-enable no-param-reassign */
        } else {
            // Включаем микрофон
            /* eslint-disable no-param-reassign */
            this._stream.getAudioTracks().forEach((audioTrack) => {
                audioTrack.enabled = true;
            });
            // Также включаем в обработанном потоке
            this.stream.getAudioTracks().forEach((audioTrack) => {
                audioTrack.enabled = true;
            });
            /* eslint-enable no-param-reassign */
        }
    }

    public async toggleSpeakerMute(): Promise<void> {
        this.isSpeakerMuted = !this.isSpeakerMuted;

        // Управляем удаленными аудиоэлементами через roomStore
        const store = await getRoomStore();
        // Используем экземпляр WebRTCClient из roomStore
        if (store?.webRTCClient !== null) {
            store.webRTCClient.setRemoteAudioMuted(this.isSpeakerMuted);
        }

        console.warn('Speaker mute toggled:', this.isSpeakerMuted);
    }

    // Получение списка аудиоустройств
    private fetchAudioDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();

            runInAction(() => {
                this.microphoneDevices = devices.filter((d) => d.kind === 'audioinput');
                this.speakerDevices = devices.filter((d) => d.kind === 'audiooutput');

                // Устанавливаем микрофон по умолчанию только если он еще не выбран
                if (this.selectedMicrophone == null && this.microphoneDevices.length > 0) {
                    this.selectedMicrophone = this.microphoneDevices[0];
                }

                // Устанавливаем динамик по умолчанию только если он еще не выбран
                if (this.selectedSpeaker == null && this.speakerDevices.length > 0) {
                    this.selectedSpeaker = this.speakerDevices[0];
                }
            });
        } catch (error) {
            console.error('Error fetching audio devices:', error);
        }
    };

    // Обновляет список устройств (теперь с реальными label/deviceId, т.к. разрешение
    // уже выдано) и синхронизирует selectedMicrophone с устройством, которое браузер
    // реально выдал в потоке - это может отличаться от того, что было запрошено
    private async syncMicrophoneSelectionWithGrantedDevice(): Promise<void> {
        await this.fetchAudioDevices();

        const grantedDeviceId = this._stream.getAudioTracks()[0]?.getSettings().deviceId;
        if (grantedDeviceId == null) {
            return;
        }

        const grantedDevice = this.microphoneDevices.find((d) => d.deviceId === grantedDeviceId);
        if (grantedDevice != null) {
            runInAction(() => {
                this.selectedMicrophone = grantedDevice;
            });
        }
    }

    private async updateMediaStream(forceUpdate = false) {
        try {
            console.warn('AudioSettingsStore: Starting media stream update...', forceUpdate ? '(forced)' : '');
            await this.ensureAudioContextIsRunning();

            // Проверяем, нужно ли пересоздавать поток
            const needsRecreation =
                forceUpdate ||
                this._stream === null ||
                this._stream.getAudioTracks().length === 0 ||
                this._stream.getAudioTracks().some((track) => track.readyState === 'ended');

            if (!needsRecreation) {
                console.warn('AudioSettingsStore: Existing media stream is still valid, skipping recreation');
                return;
            }

            console.warn('AudioSettingsStore: Recreating media stream...');

            // Останавливаем предыдущий поток
            if (this._stream !== null) {
                this._stream.getTracks().forEach((audioTrack) => {
                    audioTrack.stop();
                });
            }

            const streamPromise = navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: this.echoCancellation,
                    noiseSuppression: this.noiseSuppression,
                    autoGainControl: this.autoGainControl,
                    sampleRate: this.sampleRate,
                    sampleSize: this.sampleSize,
                    channelCount: this.channelCount,
                    deviceId: this.selectedMicrophone?.deviceId,
                    groupId: this.selectedMicrophone?.groupId
                } satisfies MediaTrackConstraints,
                video: false
            });

            const stream = await streamPromise;

            runInAction(() => {
                this._stream = stream;
            });

            console.warn(
                'AudioSettingsStore: getUserMedia success, audio tracks:',
                this._stream.getAudioTracks().length
            );

            // До получения разрешения enumerateDevices() отдаёт урезанный список
            // (пустые label, временные deviceId) - обновляем список и синхронизируем
            // выбранный микрофон с реально выданным устройством теперь, когда разрешение есть
            await this.syncMicrophoneSelectionWithGrantedDevice();

            this.prepareMediaStream();

            // Обновляем WebRTC поток после смены микрофона
            if (forceUpdate) {
                console.warn('AudioSettingsStore: Updating WebRTC stream after microphone change...');
                // Обновляем WebRTC поток через roomStore
                const store = await getRoomStore();
                if (store?.webRTCClient?.resendlocalStream != null) {
                    store.webRTCClient.resendlocalStream();
                }
            }
        } catch (error) {
            console.error('AudioSettingsStore: Error updating media stream:', error);
        }
    }
    private prepareMediaStream() {
        try {
            console.warn('AudioSettingsStore: Preparing media stream with enhanced settings...');

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

            console.warn(
                'AudioSettingsStore: Enhanced media stream prepared, output tracks:',
                this.stream.getAudioTracks().length
            );
            console.warn(
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
            console.warn('AudioSettingsStore: Updating realtime audio settings...');

            // Если нет активного потока, пропускаем обновление
            if (this._stream === null || this._stream.getAudioTracks().length === 0) {
                console.warn('AudioSettingsStore: No active stream, skipping realtime update');
                return;
            }

            // Обновляем параметры существующих процессоров
            if (this.audioProcessors.presence) {
                this.audioProcessors.presence.gain.value = this.voiceClarity * 3; // до +3дБ presence-EQ
            }

            if (this.audioProcessors.makeupGain) {
                this.audioProcessors.makeupGain.gain.value = 1 + this.voiceBoost * 0.5; // до +50% (~+3.5дБ) громкости
            }

            if (this.audioProcessors.bassBooster) {
                this.audioProcessors.bassBooster.gain.value = this.bassBoost * 6;
            }

            if (this.audioProcessors.trebleBooster) {
                this.audioProcessors.trebleBooster.gain.value = this.trebleBoost * 6;
            }

            if (this.audioProcessors.compressor) {
                const compressionRatio = 1 + this.dynamicRangeCompression * 3; // 1-4, мягкая компрессия
                this.audioProcessors.compressor.ratio.value = compressionRatio;
            }

            console.warn('AudioSettingsStore: Realtime settings updated successfully');
        } catch (error) {
            console.error('AudioSettingsStore: Error updating realtime settings:', error);
        }
    }

    private createAudioProcessingChain() {
        const input = this.audioContext.createGain();
        const output = this.audioContext.createGain();

        let currentNode: AudioNode = input;

        // Мягкий high-pass/low-pass, чтобы убрать рокот/наводки, не трогая полосу голоса
        if (this.echoCancellation === true || this.noiseSuppression === true || this.autoGainControl === true) {
            const { highpassFilter, lowpassFilter } = this.createVoiceEnhancementFilters();
            currentNode.connect(highpassFilter);
            currentNode = highpassFilter;
            currentNode.connect(lowpassFilter);
            currentNode = lowpassFilter;
        }

        // Presence-EQ для разборчивости голоса (замена прежних дублирующих enhancer+booster фильтров)
        if (this.voiceEnhancement) {
            const presence = this.createVoicePresence();
            this.audioProcessors.presence = presence;
            currentNode.connect(presence);
            currentNode = presence;
        }

        // Усиление громкости голоса (простой makeup gain, отдельно от EQ)
        if (this.voiceBoost > 0) {
            const makeupGain = this.createMakeupGain();
            this.audioProcessors.makeupGain = makeupGain;
            currentNode.connect(makeupGain);
            currentNode = makeupGain;
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

        // Мягкая компрессия для стабильной громкости
        if (this.dynamicRangeCompression > 0) {
            const compressor = this.createDynamicCompressor();
            this.audioProcessors.compressor = compressor;
            currentNode.connect(compressor);
            currentNode = compressor;
        }

        // Финальный лимитер - защита от клиппинга при суммировании всех gain-стадий выше
        const limiter = this.createOutputLimiter();
        currentNode.connect(limiter);
        currentNode = limiter;

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

    private createVoicePresence() {
        // Один умеренный presence-фильтр вместо прежних двух почти одинаковых
        // peaking-фильтров (voiceEnhancer + voiceBooster) в той же полосе частот
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = 2500; // Присутствие/разборчивость согласных
        filter.Q.value = 0.8;
        filter.gain.value = this.voiceClarity * 3; // до +3дБ
        return filter;
    }

    private createMakeupGain() {
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1 + this.voiceBoost * 0.5; // до +50% (~+3.5дБ)
        return gainNode;
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
        // Мягкая компрессия для ровной громкости, а не "рация"-эффект
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 20;
        compressor.ratio.value = 1 + this.dynamicRangeCompression * 3; // 1-4
        compressor.attack.value = 0.003;
        compressor.release.value = 0.3;
        return compressor;
    }

    private createOutputLimiter() {
        // Финальный safety-limiter: несколько gain-стадий выше суммарно могут
        // превысить 0дБ - лимитер не даёт этому превратиться в клиппинг/искажения
        const limiter = this.audioContext.createDynamicsCompressor();
        limiter.threshold.value = -3;
        limiter.knee.value = 0;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.001;
        limiter.release.value = 0.1;
        return limiter;
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

        console.warn('Тестирование динамиков...');
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
                console.warn('Микрофон работает, есть звук');
            } else {
                console.warn('Микрофон не регистрирует звук');
            }

            requestAnimationFrame(checkMicrophone);
        };

        // Запуск проверки
        checkMicrophone();
    }
}

const audioSettingsStore = new AudioSettingsStore();
export default audioSettingsStore;
export type { AudioSettingsStore };
