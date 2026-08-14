import { makeAutoObservable } from 'mobx';
import { BASE_URL } from '../config';

class ConnectionStore {
    private static STORAGE_KEY = 'projectvoice_server_url';

    public serverUrl: string = (() => {
        const saved = localStorage.getItem(ConnectionStore.STORAGE_KEY);
        if (saved !== null && saved !== '') {
            return saved;
        }
        return BASE_URL;
    })();

    public isConnected = true;
    public lastError: string | null = null;
    public isAttemptingToConnect = false;
    public isSettingsModalOpen = false;

    constructor() {
        makeAutoObservable(this);
    }

    public setSettingsModalOpen(isOpen: boolean) {
        this.isSettingsModalOpen = isOpen;
    }

    public setServerUrl(url: string) {
        // Убеждаемся, что URL имеет протокол
        let formattedUrl = url.trim();
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = `http://${formattedUrl}`;
        }

        // Убираем слеш в конце, если он есть
        if (formattedUrl.endsWith('/')) {
            formattedUrl = formattedUrl.slice(0, -1);
        }

        this.serverUrl = formattedUrl;
        localStorage.setItem(ConnectionStore.STORAGE_KEY, formattedUrl);

        // Перезагружаем страницу для применения новых настроек
        window.location.reload();
    }

    public setConnected(connected: boolean) {
        this.isConnected = connected;
        if (connected) {
            this.lastError = null;
        }
    }

    public setError(error: string | null) {
        this.lastError = error;
        if (error !== null && error !== '') {
            this.isConnected = false;
        }
    }

    public setAttempting(attempting: boolean) {
        this.isAttemptingToConnect = attempting;
    }
}

export const connectionStore = new ConnectionStore();
