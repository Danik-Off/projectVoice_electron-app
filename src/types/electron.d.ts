// Типы для Electron API
export interface ElectronAPI {
    // Информация о платформе и версиях
    platform: string;
    versions: {
        chrome: string;
        node: string;
        electron: string;
    };
}

// Расширение глобального объекта Window
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export {};
