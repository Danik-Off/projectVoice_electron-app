/**
 * Адаптер ConnectionServiceAdapter - реализация IConnectionService.
 *
 * Этот слой ИМПОРТИРУЕТ интерфейс из model/ports.ts и реализует его
 * через существующий connectionStore (MobX).
 *
 * ВАЖНО: services -> model (правильно), а НЕ model -> services (неправильно).
 */

import { connectionStore } from '../../../core/store/ConnectionStore';
import type { IConnectionService } from '../model/ports';
import type { ConnectionStatus, ConnectionCheckResult, RetryInfo } from '../model/types';

/**
 * Реализация IConnectionService поверх connectionStore (MobX).
 *
 * Добавляет логику автоматических ретраев с таймером,
 * которой нет в оригинальном ConnectionStore.
 */
export class ConnectionServiceAdapter implements IConnectionService {
    private retryTimer: ReturnType<typeof setInterval> | null = null;
    private retryCount = 0;
    private maxRetries = 10;
    private retryDelaySeconds = 5;
    private nextRetryAt: number | null = null;

    /**
     * Проверка подключения к серверу через health-check эндпоинт.
     *
     * Использует публичный GET /api/ping, который возвращает { pong: true, timestamp }.
     * Если получен валидный ответ с pong: true — сервер здоров и подключён.
     * Если получен любой HTTP-ответ, но без pong: true — сервер доступен по сети,
     * но возможно работает другая версия API (считаем подключённым, логируем предупреждение).
     * Сетевая ошибка fetch (сервер недоступен, DNS не резолвится, таймаут) — отключён.
     */
    async checkConnection(): Promise<ConnectionCheckResult> {
        const startTime = Date.now();
        try {
            const response = await fetch(`${connectionStore.serverUrl}/api/ping`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            const latency = Date.now() - startTime;

            // Пытаемся распарсить ответ и проверить pong
            let pong = false;
            try {
                const body = (await response.json()) as { pong?: boolean };
                pong = body.pong === true;
            } catch {
                // Ответ не JSON — сервер доступен, но это не health-check
            }

            if (pong) {
                connectionStore.setConnected(true);
                return { isConnected: true, latency };
            }

            // Получили HTTP-ответ, но без pong — сервер доступен по сети
            if (response.ok || response.status > 0) {
                console.warn('Server reachable but /api/ping did not return expected response');
                connectionStore.setConnected(true);
                return { isConnected: true, latency };
            }

            connectionStore.setConnected(false);
            return { isConnected: false, latency };
        } catch (error) {
            const latency = Date.now() - startTime;
            connectionStore.setConnected(false);
            return {
                isConnected: false,
                latency,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /** Установить новый URL сервера */
    setServerUrl(url: string): void {
        this.stopRetrying();
        connectionStore.setServerUrl(url);
    }

    /** Начать автоматические попытки переподключения */
    startRetrying(): void {
        if (this.retryTimer !== null) {
            return; // Уже запущены
        }

        this.retryCount = 0;
        this.nextRetryAt = Date.now() + this.retryDelaySeconds * 1000;

        const attempt = async () => {
            if (this.retryCount >= this.maxRetries) {
                // Достигнут лимит - начинаем заново с большей задержкой
                this.retryCount = 0;
            }

            this.retryCount++;
            const result = await this.checkConnection();

            if (result.isConnected) {
                this.stopRetrying();
                connectionStore.setConnected(true);
                return;
            }

            this.nextRetryAt = Date.now() + this.retryDelaySeconds * 1000;
        };

        // Первая попытка сразу
        attempt().catch((err: unknown) => {
            console.error('Connection retry attempt failed:', err);
        });

        // Последующие через интервал
        this.retryTimer = setInterval(attempt, this.retryDelaySeconds * 1000);
    }

    /** Остановить автоматические попытки переподключения */
    stopRetrying(): void {
        if (this.retryTimer !== null) {
            clearInterval(this.retryTimer);
            this.retryTimer = null;
        }
        this.nextRetryAt = null;
    }

    /** Текущий статус подключения */
    get status(): ConnectionStatus {
        if (connectionStore.isConnected) {
            return 'connected';
        }
        if (this.retryTimer !== null) {
            return 'reconnecting';
        }
        if (connectionStore.isAttemptingToConnect) {
            return 'connecting';
        }
        return 'disconnected';
    }

    /** Текущий URL сервера */
    get serverUrl(): string {
        return connectionStore.serverUrl;
    }

    /** Открыта ли модалка настроек вручную */
    get isSettingsModalOpen(): boolean {
        return connectionStore.isSettingsModalOpen;
    }

    /** Открыть/закрыть модалку настроек вручную */
    setSettingsModalOpen(isOpen: boolean): void {
        connectionStore.setSettingsModalOpen(isOpen);
    }

    /** Информация о текущих попытках переподключения */
    get retryInfo(): RetryInfo | null {
        if (this.retryTimer === null && !connectionStore.isAttemptingToConnect) {
            return null;
        }

        const nextRetryIn =
            this.nextRetryAt !== null
                ? Math.max(0, Math.ceil((this.nextRetryAt - Date.now()) / 1000))
                : this.retryDelaySeconds;

        return {
            attempt: this.retryCount,
            maxAttempts: this.maxRetries,
            nextRetryIn,
            totalRetries: this.retryCount
        };
    }
}
