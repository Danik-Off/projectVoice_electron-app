/**
 * Инициализация приложения
 * Регистрация всех модулей и плагинов
 */
import { moduleManager, pluginManager, enableMobX } from '../core';
import { infoService } from '../services/infoService';

// Modules
import { authModule } from '../modules/auth';
import { voiceModule } from '../modules/voice';
import { messagingModule } from '../modules/messaging';
import { serversModule } from '../modules/servers';
import { channelsModule } from '../modules/channels';
import { inviteModule } from '../modules/invite';
import { settingsModule } from '../modules/settings';
import { adminModule } from '../modules/admin';
import { friendsModule } from '../modules/friends';

// Plugins
import '../plugins/example-plugin';

/**
 * Инициализация приложения
 */
export async function initializeApp() {
    console.warn('🚀 Starting application initialization...');

    try {
        // Включаем MobX
        console.warn('📦 Enabling MobX...');
        enableMobX();
        console.warn('✅ MobX enabled');

        // Регистрируем модули (порядок важен из-за зависимостей)
        console.warn('📋 Registering modules...');
        const modules = [
            { name: 'auth', module: authModule },
            { name: 'servers', module: serversModule },
            { name: 'channels', module: channelsModule },
            { name: 'voice', module: voiceModule },
            { name: 'admin', module: adminModule },
            { name: 'invite', module: inviteModule },
            { name: 'settings', module: settingsModule },
            { name: 'messaging', module: messagingModule },
            { name: 'friends', module: friendsModule }
        ];

        modules.forEach(({ name: moduleName, module: moduleInstance }) => {
            console.warn(`  📝 Registering ${moduleName} module (v${moduleInstance.version})...`);
            moduleManager.register(moduleInstance);
            console.warn(`  ✅ ${moduleName} module registered`);
        });

        console.warn(`✅ All ${modules.length} modules registered`);

        // Инициализируем модули (автоматически учитываются зависимости)
        console.warn('🔄 Initializing modules (with dependency resolution)...');
        const startTime = Date.now();
        await moduleManager.initializeAll();
        const initTime = Date.now() - startTime;
        console.warn(`✅ All modules initialized in ${initTime}ms`);

        // Инициализируем плагины
        console.warn('🔌 Initializing plugins...');
        const pluginStartTime = Date.now();
        await pluginManager.initializeAll();
        const pluginInitTime = Date.now() - pluginStartTime;
        console.warn(`✅ All plugins initialized in ${pluginInitTime}ms`);

        // Загружаем информацию о приложении (стили Discord и т.д.)
        console.warn('📡 Loading app info...');
        try {
            const appInfo = await infoService.getInfo();
            if (appInfo.styles) {
                // Применяем стили Discord как CSS-переменные
                const root = document.documentElement;
                Object.entries(appInfo.styles).forEach(([key, value]) => {
                    if (value !== null && value !== '') {
                        root.style.setProperty(`--discord-${key.toLowerCase()}`, value);
                    }
                });
                console.warn('✅ App info loaded and styles applied');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load app info:', error);
            // Не критично, продолжаем работу
        }

        const totalTime = Date.now() - startTime;
        console.warn(`🎉 Application initialized successfully in ${totalTime}ms`);
        console.warn(`   - Modules: ${modules.length}`);
        console.warn(`   - Plugins: ${pluginManager.getAllPlugins().length}`);
    } catch (error) {
        console.error('❌ Error during application initialization:', error);
        throw error;
    }
}

/**
 * Уничтожение приложения (для cleanup)
 */
export async function destroyApp() {
    console.warn('🛑 Starting application destruction...');

    try {
        const startTime = Date.now();

        // Уничтожаем плагины
        console.warn('🔌 Destroying plugins...');
        await pluginManager.destroyAll();
        console.warn('✅ All plugins destroyed');

        // Уничтожаем модули
        console.warn('📦 Destroying modules...');
        await moduleManager.destroyAll();
        console.warn('✅ All modules destroyed');

        const destroyTime = Date.now() - startTime;
        console.warn(`✅ Application destroyed successfully in ${destroyTime}ms`);
    } catch (error) {
        console.error('❌ Error during application destruction:', error);
        throw error;
    }
}
