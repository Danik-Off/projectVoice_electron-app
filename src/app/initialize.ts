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

// Plugins
import '../plugins/example-plugin';

/**
 * Инициализация приложения
 */
export async function initializeApp() {
    console.log('🚀 Starting application initialization...');
    
    try {
        // Включаем MobX
        console.log('📦 Enabling MobX...');
        enableMobX();
        console.log('✅ MobX enabled');

        // Регистрируем модули (порядок важен из-за зависимостей)
        console.log('📋 Registering modules...');
        const modules = [
            { name: 'auth', module: authModule },
            { name: 'servers', module: serversModule },
            { name: 'channels', module: channelsModule },
            { name: 'voice', module: voiceModule },
            { name: 'admin', module: adminModule },
            { name: 'invite', module: inviteModule },
            { name: 'settings', module: settingsModule },
            { name: 'messaging', module: messagingModule },
        ];

        modules.forEach(({ name, module }) => {
            console.log(`  📝 Registering ${name} module (v${module.version})...`);
            moduleManager.register(module);
            console.log(`  ✅ ${name} module registered`);
        });

        console.log(`✅ All ${modules.length} modules registered`);

        // Инициализируем модули (автоматически учитываются зависимости)
        console.log('🔄 Initializing modules (with dependency resolution)...');
        const startTime = Date.now();
        await moduleManager.initializeAll();
        const initTime = Date.now() - startTime;
        console.log(`✅ All modules initialized in ${initTime}ms`);

        // Инициализируем плагины
        console.log('🔌 Initializing plugins...');
        const pluginStartTime = Date.now();
        await pluginManager.initializeAll();
        const pluginInitTime = Date.now() - pluginStartTime;
        console.log(`✅ All plugins initialized in ${pluginInitTime}ms`);

        // Загружаем информацию о приложении (стили Discord и т.д.)
        console.log('📡 Loading app info...');
        try {
            const appInfo = await infoService.getInfo();
            if (appInfo.styles) {
                // Применяем стили Discord как CSS-переменные
                const root = document.documentElement;
                Object.entries(appInfo.styles).forEach(([key, value]) => {
                    if (value) {
                        root.style.setProperty(`--discord-${key.toLowerCase()}`, value);
                    }
                });
                console.log('✅ App info loaded and styles applied');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load app info:', error);
            // Не критично, продолжаем работу
        }

        const totalTime = Date.now() - startTime;
        console.log(`🎉 Application initialized successfully in ${totalTime}ms`);
        console.log(`   - Modules: ${modules.length}`);
        console.log(`   - Plugins: ${pluginManager.getAllPlugins().length}`);
    } catch (error) {
        console.error('❌ Error during application initialization:', error);
        throw error;
    }
}

/**
 * Уничтожение приложения (для cleanup)
 */
export async function destroyApp() {
    console.log('🛑 Starting application destruction...');
    
    try {
        const startTime = Date.now();
        
        // Уничтожаем плагины
        console.log('🔌 Destroying plugins...');
        await pluginManager.destroyAll();
        console.log('✅ All plugins destroyed');

        // Уничтожаем модули
        console.log('📦 Destroying modules...');
        await moduleManager.destroyAll();
        console.log('✅ All modules destroyed');

        const destroyTime = Date.now() - startTime;
        console.log(`✅ Application destroyed successfully in ${destroyTime}ms`);
    } catch (error) {
        console.error('❌ Error during application destruction:', error);
        throw error;
    }
}

