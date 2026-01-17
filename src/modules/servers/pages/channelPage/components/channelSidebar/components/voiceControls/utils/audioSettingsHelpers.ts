import type { AudioSettingsStore } from '../../../../../../../../../../core';

/**
 * Безопасный вызов метода audioSettingsStore с обработкой ошибок
 */
export const safeAudioSettingsCall = async <T>(
    store: AudioSettingsStore,
    method: (store: AudioSettingsStore) => T | Promise<T>,
    onError: (error: unknown, context: string) => void,
    context: string
): Promise<void> => {
    try {
        const result = method(store);
        if (result instanceof Promise) {
            await result;
        }
    } catch (error: unknown) {
        onError(error, context);
    }
};

/**
 * Безопасный вызов Promise-метода audioSettingsStore
 */
export const safeAudioSettingsPromise = async (
    promise: Promise<unknown>,
    onError: (error: unknown, context: string) => void,
    context: string
): Promise<void> => {
    try {
        await promise;
    } catch (error: unknown) {
        onError(error, context);
    }
};
