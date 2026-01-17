import { useMemo } from 'react';
import { audioSettingsStore } from '../../../../../../../../../core';

type ErrorHandler = (error: unknown, context: string) => void;

interface WrappedAudioSettingsStore {
    // Синхронные методы
    volume: number;
    latency: number;
    setVolume: (value: number) => void;
    setLatency: (value: number) => void;
    testMicrophone: () => void;
    testSpeakers: () => void;

    // Асинхронные методы (обёрнутые с обработкой ошибок)
    autoGainControl: boolean;
    echoCancellation: boolean;
    noiseSuppression: boolean;
    voiceIsolation: boolean;
    voiceEnhancement: boolean;
    spatialAudio: boolean;
    stereoEnhancement: boolean;
    bassBoost: number;
    trebleBoost: number;
    voiceBoost: number;
    voiceClarity: number;
    backgroundNoiseReduction: number;
    dynamicRangeCompression: number;
    bitrate: number;
    bufferSize: number;
    compressionLevel: number;
    sampleRate: number;

    setAutoGainControl: (value: boolean) => void;
    setEchoCancellation: (value: boolean) => void;
    setNoiseSuppression: (value: boolean) => void;
    setVoiceIsolation: (value: boolean) => void;
    setVoiceEnhancement: (value: boolean) => void;
    setSpatialAudio: (value: boolean) => void;
    setStereoEnhancement: (value: boolean) => void;
    setBassBoost: (value: number) => void;
    setTrebleBoost: (value: number) => void;
    setVoiceBoost: (value: number) => void;
    setVoiceClarity: (value: number) => void;
    setBackgroundNoiseReduction: (value: number) => void;
    setDynamicRangeCompression: (value: number) => void;
    setBitrate: (value: number) => void;
    setBufferSize: (value: number) => void;
    setCompressionLevel: (value: number) => void;
    setSampleRate: (value: number) => void;
}

const wrapAsync =
    <T extends unknown[]>(method: (...args: T) => Promise<void>, context: string, onError: ErrorHandler) =>
    (...args: T) => {
        method(...args).catch((error: unknown) => {
            onError(error, context);
        });
    };

const wrapSync =
    <T extends unknown[]>(method: (...args: T) => void, context: string, onError: ErrorHandler) =>
    (...args: T) => {
        try {
            method(...args);
        } catch (error: unknown) {
            onError(error, context);
        }
    };

const createSyncMethods = (onError: ErrorHandler) => ({
    setVolume: wrapSync((v: number) => audioSettingsStore.setVolume(v), 'Error setting volume', onError),
    setLatency: wrapSync((v: number) => audioSettingsStore.setLatency(v), 'Error setting latency', onError),
    testMicrophone: wrapSync(() => audioSettingsStore.testMicrophone(), 'Error testing microphone', onError),
    testSpeakers: wrapSync(() => audioSettingsStore.testSpeakers(), 'Error testing speakers', onError)
});

const createAsyncMethods = (onError: ErrorHandler) => ({
    setAutoGainControl: wrapAsync(
        (v: boolean) => audioSettingsStore.setAutoGainControl(v),
        'Error setting auto gain control',
        onError
    ),
    setEchoCancellation: wrapAsync(
        (v: boolean) => audioSettingsStore.setEchoCancellation(v),
        'Error setting echo cancellation',
        onError
    ),
    setNoiseSuppression: wrapAsync(
        (v: boolean) => audioSettingsStore.setNoiseSuppression(v),
        'Error setting noise suppression',
        onError
    ),
    setVoiceIsolation: wrapAsync(
        (v: boolean) => audioSettingsStore.setVoiceIsolation(v),
        'Error setting voice isolation',
        onError
    ),
    setVoiceEnhancement: wrapAsync(
        (v: boolean) => audioSettingsStore.setVoiceEnhancement(v),
        'Error setting voice enhancement',
        onError
    ),
    setSpatialAudio: wrapAsync(
        (v: boolean) => audioSettingsStore.setSpatialAudio(v),
        'Error setting spatial audio',
        onError
    ),
    setStereoEnhancement: wrapAsync(
        (v: boolean) => audioSettingsStore.setStereoEnhancement(v),
        'Error setting stereo enhancement',
        onError
    ),
    setBassBoost: wrapAsync((v: number) => audioSettingsStore.setBassBoost(v), 'Error setting bass boost', onError),
    setTrebleBoost: wrapAsync(
        (v: number) => audioSettingsStore.setTrebleBoost(v),
        'Error setting treble boost',
        onError
    ),
    setVoiceBoost: wrapAsync((v: number) => audioSettingsStore.setVoiceBoost(v), 'Error setting voice boost', onError),
    setVoiceClarity: wrapAsync(
        (v: number) => audioSettingsStore.setVoiceClarity(v),
        'Error setting voice clarity',
        onError
    ),
    setBackgroundNoiseReduction: wrapAsync(
        (v: number) => audioSettingsStore.setBackgroundNoiseReduction(v),
        'Error setting background noise reduction',
        onError
    ),
    setDynamicRangeCompression: wrapAsync(
        (v: number) => audioSettingsStore.setDynamicRangeCompression(v),
        'Error setting dynamic range compression',
        onError
    ),
    setBitrate: wrapAsync((v: number) => audioSettingsStore.setBitrate(v), 'Error setting bitrate', onError),
    setBufferSize: wrapAsync((v: number) => audioSettingsStore.setBufferSize(v), 'Error setting buffer size', onError),
    setCompressionLevel: wrapAsync(
        (v: number) => audioSettingsStore.setCompressionLevel(v),
        'Error setting compression level',
        onError
    ),
    setSampleRate: wrapAsync((v: number) => audioSettingsStore.setSampleRate(v), 'Error setting sample rate', onError)
});

/**
 * Хук для безопасной работы с audioSettingsStore с автоматической обработкой ошибок
 */
export const useAudioSettingsHandler = (onError: ErrorHandler): WrappedAudioSettingsStore =>
    useMemo(
        () => ({
            // Прямые свойства
            volume: audioSettingsStore.volume,
            latency: audioSettingsStore.latency,
            autoGainControl: audioSettingsStore.autoGainControl,
            echoCancellation: audioSettingsStore.echoCancellation,
            noiseSuppression: audioSettingsStore.noiseSuppression,
            voiceIsolation: audioSettingsStore.voiceIsolation,
            voiceEnhancement: audioSettingsStore.voiceEnhancement,
            spatialAudio: audioSettingsStore.spatialAudio,
            stereoEnhancement: audioSettingsStore.stereoEnhancement,
            bassBoost: audioSettingsStore.bassBoost,
            trebleBoost: audioSettingsStore.trebleBoost,
            voiceBoost: audioSettingsStore.voiceBoost,
            voiceClarity: audioSettingsStore.voiceClarity,
            backgroundNoiseReduction: audioSettingsStore.backgroundNoiseReduction,
            dynamicRangeCompression: audioSettingsStore.dynamicRangeCompression,
            bitrate: audioSettingsStore.bitrate,
            bufferSize: audioSettingsStore.bufferSize,
            compressionLevel: audioSettingsStore.compressionLevel,
            sampleRate: audioSettingsStore.sampleRate,

            // Синхронные и асинхронные методы
            ...createSyncMethods(onError),
            ...createAsyncMethods(onError)
        }),
        [onError]
    );
