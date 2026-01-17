/**
 * Example Plugin - пример плагина
 */
import type { IPlugin } from '../../core';

export const examplePlugin: IPlugin = {
    id: 'example-plugin',
    name: 'Example Plugin',
    version: '1.0.0',
    dependencies: [],
    // eslint-disable-next-line require-await -- No await needed
    async initialize() {
        console.warn('Example plugin initialized');
        // Здесь можно добавить логику инициализации
        // Например, подписка на события, регистрация обработчиков и т.д.
    },
    // eslint-disable-next-line require-await -- No await needed
    async destroy() {
        console.warn('Example plugin destroyed');
        // Очистка ресурсов при удалении плагина
    }
};
