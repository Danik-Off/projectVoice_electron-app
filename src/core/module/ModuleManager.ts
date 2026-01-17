/**
 * Менеджер модулей
 * Управляет жизненным циклом модулей и их маршрутами
 */
import type React from 'react';
import type { IModule } from '../types';

export class ModuleManager {
    private modules: Map<string, IModule> = new Map();
    private initializedModules: Set<string> = new Set();
    private routes: Array<{
        path: string;
        component: React.ComponentType;
        protected?: boolean;
        admin?: boolean;
        moduleId: string;
    }> = [];

    /**
     * Регистрация модуля
     */
    register(moduleInstance: IModule): void {
        if (this.modules.has(moduleInstance.id)) {
            console.warn(`Module ${moduleInstance.id} is already registered`);
            return;
        }

        this.modules.set(moduleInstance.id, moduleInstance);

        // Регистрируем маршруты модуля
        if (moduleInstance.routes) {
            moduleInstance.routes.forEach((route) => {
                this.routes.push({
                    ...route,
                    moduleId: moduleInstance.id
                });
            });
        }

        console.warn(`Module ${moduleInstance.id} registered`);
    }

    /**
     * Удаление модуля
     */
    unregister(moduleId: string): void {
        const moduleInstance = this.modules.get(moduleId);
        if (moduleInstance !== null) {
            if (this.initializedModules.has(moduleId)) {
                this.destroy(moduleId).catch(() => {
                    // Destroy error handled silently
                });
            }

            // Удаляем маршруты модуля
            this.routes = this.routes.filter((route) => route.moduleId !== moduleId);

            this.modules.delete(moduleId);
            console.warn(`Module ${moduleId} unregistered`);
        }
    }

    /**
     * Инициализация всех модулей
     */
    async initializeAll(): Promise<void> {
        const sortedModules = this.sortModulesByDependencies();

        for (const moduleId of sortedModules) {
            // Последовательная инициализация необходима для соблюдения зависимостей
            await this.initialize(moduleId);
        }
    }

    /**
     * Инициализация конкретного модуля
     */
    async initialize(moduleId: string): Promise<void> {
        if (this.initializedModules.has(moduleId)) {
            console.warn(`Module ${moduleId} is already initialized`);
            return;
        }

        const moduleInstance = this.modules.get(moduleId);
        if (!moduleInstance) {
            throw new Error(`Module ${moduleId} not found`);
        }

        // Проверяем зависимости
        if (moduleInstance.dependencies) {
            // Последовательная инициализация зависимостей необходима

            for (const depId of moduleInstance.dependencies) {
                if (!this.initializedModules.has(depId)) {
                    await this.initialize(depId);
                }
            }
        }

        try {
            await moduleInstance.initialize();
            this.initializedModules.add(moduleId);
            console.warn(`Module ${moduleId} initialized`);
        } catch (error) {
            console.error(`Failed to initialize module ${moduleId}:`, error);
            throw error;
        }
    }

    /**
     * Уничтожение модуля
     */
    async destroy(moduleId: string): Promise<void> {
        if (!this.initializedModules.has(moduleId)) {
            return;
        }

        const moduleInstance = this.modules.get(moduleId);
        if (moduleInstance?.destroy) {
            try {
                await moduleInstance.destroy();
            } catch (error) {
                console.error(`Error destroying module ${moduleId}:`, error);
            }
        }

        this.initializedModules.delete(moduleId);
    }

    /**
     * Уничтожение всех модулей в обратном порядке инициализации
     */
    async destroyAll(): Promise<void> {
        const initializedModules = Array.from(this.initializedModules);
        // Уничтожаем в обратном порядке

        for (let i = initializedModules.length - 1; i >= 0; i--) {
            await this.destroy(initializedModules[i]);
        }
    }

    /**
     * Получить все маршруты
     */
    getRoutes(): Array<{
        path: string;
        component: React.ComponentType;
        protected?: boolean;
        admin?: boolean;
        moduleId: string;
    }> {
        return [...this.routes];
    }

    /**
     * Получить модуль по ID
     */
    getModule(moduleId: string): IModule | undefined {
        return this.modules.get(moduleId);
    }

    /**
     * Проверить, инициализирован ли модуль
     */
    isInitialized(moduleId: string): boolean {
        return this.initializedModules.has(moduleId);
    }

    /**
     * Получить список всех модулей
     */
    getAllModules(): IModule[] {
        return Array.from(this.modules.values());
    }

    /**
     * Сортировка модулей по зависимостям
     */
    private sortModulesByDependencies(): string[] {
        const sorted: string[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();

        const visit = (moduleId: string) => {
            if (visiting.has(moduleId)) {
                throw new Error(`Circular dependency detected involving module ${moduleId}`);
            }
            if (visited.has(moduleId)) {
                return;
            }

            visiting.add(moduleId);
            const moduleInstance = this.modules.get(moduleId);
            if (moduleInstance?.dependencies) {
                for (const depId of moduleInstance.dependencies) {
                    if (!this.modules.has(depId)) {
                        throw new Error(`Module ${moduleId} depends on ${depId}, but ${depId} is not registered`);
                    }
                    visit(depId);
                }
            }
            visiting.delete(moduleId);
            visited.add(moduleId);
            sorted.push(moduleId);
        };

        for (const moduleId of this.modules.keys()) {
            if (!visited.has(moduleId)) {
                visit(moduleId);
            }
        }

        return sorted;
    }
}

// Singleton instance
export const moduleManager = new ModuleManager();
