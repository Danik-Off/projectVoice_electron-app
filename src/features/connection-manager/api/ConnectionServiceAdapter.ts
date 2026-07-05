/**
 * Адаптер ConnectionServiceAdapter - реализация IConnectionService.
 *
 * Этот слой ИМПОРТИРУЕТ интерфейс из entities/connection/model/ports.ts
 * и реализует его через существующий connectionStore (MobX).
 *
 * ВАЖНО: api -> model (правильно), а НЕ model -> api (неправильно).
 */

import { connectionStore } from '../../../core/store/ConnectionStore';
import type {
    IConnectionService,
    ConnectionStatus,
    ConnectionCheckResult,
    RetryInfo
} from '../../../entities/connection';

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

    /** Проверка подключения через ping к API */
    async checkConnection(): Promise<ConnectionCheckResult> {
        const startTime = Date.now();
        try {
            const response = await fetch(`${connectionStore.serverUrl}/api/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            const latency = Date.now() - startTime;
            if (response.ok) {
                connectionStore.setConnected(true);
                return { isConnected: true, latency };
            }
            return { isConnected: false, error: `HTTP ${response.status}` };
        } catch (error) {
            const latency = Date.now() - startTime;
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
        attempt();

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

        const nextRetryIn = this.nextRetryAt !== null
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
