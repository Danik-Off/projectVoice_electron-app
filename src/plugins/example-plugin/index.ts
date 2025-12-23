/**
 * Example Plugin - точка входа
 */
import { pluginManager } from '../../core';
import { examplePlugin } from './plugin';

// Регистрация плагина
pluginManager.register(examplePlugin);

export { examplePlugin };

