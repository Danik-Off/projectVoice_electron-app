/**
 * Example Plugin - пример плагина
 */
import type { IPlugin } from '../../core';

export const examplePlugin: IPlugin = {
    id: 'example-plugin',
    name: 'Example Plugin',
    version: '1.0.0',
    dependencies: [],
    async initialize() {
        console.log('Example plugin initialized');
        // Здесь можно добавить логику инициализации
        // Например, подписка на события, регистрация обработчиков и т.д.
    },
    async destroy() {
        console.log('Example plugin destroyed');
        // Очистка ресурсов при удалении плагина
    }
};
