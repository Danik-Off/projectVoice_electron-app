/**
 * Менеджер плагинов
 * Управляет жизненным циклом плагинов
 */
import type { IPlugin } from '../types';

export class PluginManager {
    private plugins: Map<string, IPlugin> = new Map();
    private initializedPlugins: Set<string> = new Set();
    private initializationOrder: string[] = [];

    /**
     * Регистрация плагина
     */
    register(plugin: IPlugin): void {
        if (this.plugins.has(plugin.id)) {
            console.warn(`Plugin ${plugin.id} is already registered`);
            return;
        }

        this.plugins.set(plugin.id, plugin);
        console.warn(`Plugin ${plugin.id} registered`);
    }

    /**
     * Удаление плагина
     */
    unregister(pluginId: string): void {
        const plugin = this.plugins.get(pluginId);
        if (plugin) {
            if (this.initializedPlugins.has(pluginId)) {
                this.destroy(pluginId).catch(() => {
                    // Destroy error handled silently
                });
            }
            this.plugins.delete(pluginId);
            console.warn(`Plugin ${pluginId} unregistered`);
        }
    }

    /**
     * Инициализация всех плагинов с учетом зависимостей
     */
    async initializeAll(): Promise<void> {
        const sortedPlugins = this.sortPluginsByDependencies();

        // Последовательная инициализация необходима для соблюдения зависимостей
        /* eslint-disable no-await-in-loop */
        for (const pluginId of sortedPlugins) {
            await this.initialize(pluginId);
        }
        /* eslint-enable no-await-in-loop */
    }

    /**
     * Инициализация конкретного плагина
     */
    async initialize(pluginId: string): Promise<void> {
        if (this.initializedPlugins.has(pluginId)) {
            console.warn(`Plugin ${pluginId} is already initialized`);
            return;
        }

        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            throw new Error(`Plugin ${pluginId} not found`);
        }

        // Проверяем зависимости
        if (plugin.dependencies) {
            // Последовательная инициализация зависимостей необходима
            /* eslint-disable no-await-in-loop */
            for (const depId of plugin.dependencies) {
                if (!this.initializedPlugins.has(depId)) {
                    await this.initialize(depId);
                }
            }
            /* eslint-enable no-await-in-loop */
        }

        try {
            await plugin.initialize();
            this.initializedPlugins.add(pluginId);
            this.initializationOrder.push(pluginId);
            console.warn(`Plugin ${pluginId} initialized`);
        } catch (error) {
            console.error(`Failed to initialize plugin ${pluginId}:`, error);
            throw error;
        }
    }

    /**
     * Уничтожение плагина
     */
    async destroy(pluginId: string): Promise<void> {
        if (!this.initializedPlugins.has(pluginId)) {
            return;
        }

        const plugin = this.plugins.get(pluginId);
        if (plugin?.destroy) {
            try {
                await plugin.destroy();
            } catch (error) {
                console.error(`Error destroying plugin ${pluginId}:`, error);
            }
        }

        this.initializedPlugins.delete(pluginId);
        const index = this.initializationOrder.indexOf(pluginId);
        if (index > -1) {
            this.initializationOrder.splice(index, 1);
        }
    }

    /**
     * Уничтожение всех плагинов в обратном порядке
     */
    async destroyAll(): Promise<void> {
        const reversedOrder = [...this.initializationOrder].reverse();
        // Уничтожаем в обратном порядке
        /* eslint-disable no-await-in-loop */
        for (const pluginId of reversedOrder) {
            await this.destroy(pluginId);
        }
        /* eslint-enable no-await-in-loop */
    }

    /**
     * Получить плагин по ID
     */
    getPlugin(pluginId: string): IPlugin | undefined {
        return this.plugins.get(pluginId);
    }

    /**
     * Проверить, инициализирован ли плагин
     */
    isInitialized(pluginId: string): boolean {
        return this.initializedPlugins.has(pluginId);
    }

    /**
     * Получить список всех плагинов
     */
    getAllPlugins(): IPlugin[] {
        return Array.from(this.plugins.values());
    }

    /**
     * Сортировка плагинов по зависимостям (топологическая сортировка)
     */
    private sortPluginsByDependencies(): string[] {
        const sorted: string[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();

        const visit = (pluginId: string) => {
            if (visiting.has(pluginId)) {
                throw new Error(`Circular dependency detected involving plugin ${pluginId}`);
            }
            if (visited.has(pluginId)) {
                return;
            }

            visiting.add(pluginId);
            const plugin = this.plugins.get(pluginId);
            if (plugin?.dependencies) {
                for (const depId of plugin.dependencies) {
                    if (!this.plugins.has(depId)) {
                        throw new Error(`Plugin ${pluginId} depends on ${depId}, but ${depId} is not registered`);
                    }
                    visit(depId);
                }
            }
            visiting.delete(pluginId);
            visited.add(pluginId);
            sorted.push(pluginId);
        };

        for (const pluginId of this.plugins.keys()) {
            if (!visited.has(pluginId)) {
                visit(pluginId);
            }
        }

        return sorted;
    }
}

// Singleton instance
export const pluginManager = new PluginManager();
