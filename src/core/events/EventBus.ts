/**
 * EventBus - шина событий для связи между модулями
 * Модули должны общаться только через события, без прямых импортов
 */

type EventCallback = (data?: unknown) => void;
type EventMap = Map<string, Set<EventCallback>>;

class EventBus {
    private events: EventMap = new Map();

    /**
     * Подписка на событие
     * @param eventName - имя события
     * @param callback - функция-обработчик
     * @returns функция для отписки
     */
    public on(eventName: string, callback: EventCallback): () => void {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }

        const callbacks = this.events.get(eventName);
        if (callbacks) {
            callbacks.add(callback);
        }

        // Возвращаем функцию для отписки
        return () => {
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.events.delete(eventName);
                }
            }
        };
    }

    /**
     * Однократная подписка на событие
     * @param eventName - имя события
     * @param callback - функция-обработчик
     */
    public once(eventName: string, callback: EventCallback): void {
        const unsubscribe = this.on(eventName, (data) => {
            callback(data);
            unsubscribe();
        });
    }

    /**
     * Отписка от события
     * @param eventName - имя события
     * @param callback - функция-обработчик
     */
    public off(eventName: string, callback: EventCallback): void {
        const callbacks = this.events.get(eventName);
        if (callbacks) {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.events.delete(eventName);
            }
        }
    }

    /**
     * Отправка события
     * @param eventName - имя события
     * @param data - данные события
     */
    public emit<T = unknown>(eventName: string, data?: T): void {
        const callbacks = this.events.get(eventName);
        if (callbacks) {
            callbacks.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                }
            });
        }
    }

    /**
     * Очистка всех подписок
     */
    public clear(): void {
        this.events.clear();
    }

    /**
     * Получить количество подписчиков на событие
     */
    public listenerCount(eventName: string): number {
        return this.events.get(eventName)?.size || 0;
    }
}

// Singleton экземпляр
export const eventBus = new EventBus();

// Экспорт типа для типизации событий
export type EventBusType = typeof eventBus;
