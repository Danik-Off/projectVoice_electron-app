/**
 * Менеджер модулей
 * Управляет жизненным циклом модулей и их маршрутами
 */
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
  register(module: IModule): void {
    if (this.modules.has(module.id)) {
      console.warn(`Module ${module.id} is already registered`);
      return;
    }

    this.modules.set(module.id, module);
    
    // Регистрируем маршруты модуля
    if (module.routes) {
      module.routes.forEach(route => {
        this.routes.push({
          ...route,
          moduleId: module.id,
        });
      });
    }

    console.log(`Module ${module.id} registered`);
  }

  /**
   * Удаление модуля
   */
  unregister(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (module) {
      if (this.initializedModules.has(moduleId)) {
        this.destroy(moduleId);
      }
      
      // Удаляем маршруты модуля
      this.routes = this.routes.filter(route => route.moduleId !== moduleId);
      
      this.modules.delete(moduleId);
      console.log(`Module ${moduleId} unregistered`);
    }
  }

  /**
   * Инициализация всех модулей
   */
  async initializeAll(): Promise<void> {
    const sortedModules = this.sortModulesByDependencies();
    
    for (const moduleId of sortedModules) {
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

    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Проверяем зависимости
    if (module.dependencies) {
      for (const depId of module.dependencies) {
        if (!this.initializedModules.has(depId)) {
          await this.initialize(depId);
        }
      }
    }

    try {
      await module.initialize();
      this.initializedModules.add(moduleId);
      console.log(`Module ${moduleId} initialized`);
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

    const module = this.modules.get(moduleId);
    if (module?.destroy) {
      try {
        await module.destroy();
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
      const module = this.modules.get(moduleId);
      if (module?.dependencies) {
        for (const depId of module.dependencies) {
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

