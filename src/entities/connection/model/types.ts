/**
 * Connection Entity - чистый Domain-слой
 * Типы и интерфейсы для управления подключением.
 */

/** Статус подключения */
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting';

/** Конфигурация сервера */
export interface ServerConfig {
    /** URL бэкенд-сервера */
    url: string;
    /** Сохранён ли URL в localStorage */
    isCustom: boolean;
}

/** Результат проверки подключения */
export interface ConnectionCheckResult {
    isConnected: boolean;
    latency?: number;
    error?: string;
}

/** Информация о попытке переподключения */
export interface RetryInfo {
    /** Текущая попытка (1-based) */
    attempt: number;
    /** Максимальное количество попыток */
    maxAttempts: number;
    /** Секунд до следующей попытки */
    nextRetryIn: number;
    /** Всего прошло попыток */
    totalRetries: number;
}
