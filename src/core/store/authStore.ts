import { makeAutoObservable, configure } from 'mobx';
import { authService } from '../../modules/auth/services/authService';
import { userService } from '../../modules/auth/services/userService';
import { saveToken, getToken, removeToken, saveUser, getUser, removeUser } from '../../shared/utils/storage';
import { notificationStore } from './NotificationStore';

class AuthStore {
    public loading = false;

    public isAuthenticated = false;
    public user: {
        id: number;
        username: string;
        email: string;
        role: string;
        isActive: boolean;
        profilePicture?: string;
        status?: string;
        tag?: string;
        createdAt: string;
        blockedAt?: string;
        blockedBy?: string;
        blockReason?: string;
    } | null = null;

    private token: string | null = null;

    public constructor() {
        makeAutoObservable(this);
        // Восстанавливаем токен из cookies при инициализации
        this.restoreAuthFromCookie();
    }

    /**
     * Восстанавливает авторизацию из localStorage
     * Вызывается при инициализации и может быть вызвана вручную
     */
    private restoreAuthFromCookie(): void {
        const savedToken = getToken();
        const savedUser = getUser();

        console.warn('🔐 Restoring auth from localStorage...');
        console.warn('📦 Token exists:', !!savedToken);
        console.warn('📦 User data exists:', !!savedUser);

        if (savedToken) {
            // Восстанавливаем токен и устанавливаем авторизацию СИНХРОННО
            this.token = savedToken;
            this.isAuthenticated = true;

            // Восстанавливаем данные пользователя из localStorage, если они есть
            if (savedUser) {
                this.user = savedUser;
                console.warn('✅ User data restored from localStorage:', savedUser.username, 'role:', savedUser.role);
            }

            console.warn('✅ Auth restored from localStorage - token present, isAuthenticated:', this.isAuthenticated);
            console.warn('✅ Token restored:', `${this.token.substring(0, 20)  }...`);

            // Загружаем актуальные данные пользователя асинхронно
            // НЕ вызываем logout при ошибке - пользователь должен выйти вручную
            this.loadUserData().catch((error) => {
                // Ошибка уже обработана в loadUserData
                // Авторизация сохраняется даже при ошибке загрузки данных
                console.error('❌ Error loading user data on init:', error);
                console.warn('⚠️ But keeping isAuthenticated = true and using cached user data');
            });
        } else {
            // Нет токена в localStorage - пользователь не авторизован
            this.token = null;
            this.user = null;
            this.isAuthenticated = false;
            removeUser(); // Очищаем данные пользователя
            console.warn('❌ No token in localStorage - user not authenticated');
        }

        console.warn(
            '🔐 Auth restoration complete. isAuthenticated:',
            this.isAuthenticated,
            'user:',
            this.user?.username
        );
    }

    public async login(email: string, password: string, redirect?: string | null): Promise<string> {
        try {
            this.loading = true;
            const data = await authService.login(email, password);

            if (!data || !data.token) {
                throw new Error('Invalid response from server');
            }

            this.user = data.user;
            this.token = data.token;

            // Сохранение токена и данных пользователя в localStorage
            saveToken(data.token);
            saveUser(data.user);

            console.warn('Login successful - token and user data saved to localStorage, isAuthenticated:', true);

            this.isAuthenticated = true;
            this.loading = false;

            // Возвращаем путь для редиректа (компонент сам выполнит навигацию)
            return redirect || '/';
        } catch (error) {
            this.loading = false;
            console.error('Login failed', error);
            throw error; // Пробрасываем ошибку для обработки в компоненте
        }
    }

    public async loadUserData(): Promise<void> {
        try {
            if (!this.token) {
                console.warn('No token available for loadUserData');
                return;
            }

            console.warn('Loading user data with token:', this.token);
            const userData = await authService.getMe();
            console.warn('User data loaded:', userData);
            this.user = userData;
            this.isAuthenticated = true;

            // Сохраняем данные пользователя в localStorage
            saveUser(userData);
        } catch (error) {
            console.error('Failed to load user data:', error);

            // Проверяем, является ли это ошибкой недействительного токена
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isTokenError =
                errorMessage.includes('Недействительный токен') ||
                errorMessage.includes('invalid token') ||
                errorMessage.includes('token expired') ||
                errorMessage.includes('unauthorized');

            // Если токен недействителен и был удален из localStorage, выполняем logout
            if (isTokenError && !getToken()) {
                console.warn('Token was cleared due to invalid token error, logging out...');
                this.logout();
                return;
            }

            // Для других ошибок показываем уведомление, но не разлогиниваем
            notificationStore.addNotification('notifications.serverDataLoadError', 'error');

            // Сохраняем isAuthenticated = true только если токен еще есть
            // Если токена нет, значит он был очищен apiClient и нужно выйти
            if (getToken()) {
                this.isAuthenticated = true;
            } else {
                console.warn('Token was removed, logging out...');
                this.logout();
            }
        }
    }

    public async register(
        username: string,
        email: string,
        password: string,
        redirect?: string | null
    ): Promise<string> {
        try {
            this.loading = true;
            // ВНИМАНИЕ: authService.register принимает (email, username, password)
            const data = await authService.register(email, username, password);

            if (!data || !data.token) {
                console.error('Registration response missing token:', data);
                throw new Error('Invalid response from server: token missing');
            }

            // Сначала сохраняем токен, чтобы последующие запросы (getMe) могли его использовать
            this.token = data.token;
            saveToken(data.token);

            // Если в ответе регистрации нет данных пользователя, получаем их через getMe
            // Если они есть (data.user), используем их
            let userData = data.user;

            if (!userData) {
                console.warn('User data missing in register response, fetching via getMe...');
                userData = await authService.getMe();
            }

            this.user = userData;
            this.isAuthenticated = true;

            // Сохранение данных пользователя в localStorage
            saveUser(userData);

            console.warn('Registration successful - token and user data saved to localStorage, isAuthenticated:', true);

            this.loading = false;

            // Возвращаем путь для редиректа (компонент сам выполнит навигацию)
            return redirect || '/';
        } catch (error) {
            this.loading = false;
            console.error('Registration failed', error);
            throw error; // Пробрасываем ошибку для обработки в компоненте
        }
    }

    public getToken(): string | null {
        // Всегда синхронизируем токен с localStorage перед возвратом
        // Это гарантирует, что если токен был удален из localStorage вручную, мы это заметим
        const storedToken = getToken();
        if (storedToken !== this.token) {
            console.warn('Token mismatch between store and localStorage, syncing...');
            if (storedToken) {
                this.token = storedToken;
                // Если токен восстановлен из localStorage, обновляем авторизацию
                this.isAuthenticated = true;
            } else {
                // Токен удален из localStorage - это может быть из-за ошибки "Недействительный токен"
                // Выполняем logout, чтобы очистить состояние
                console.warn('Token removed from localStorage, likely due to invalid token error. Logging out...');
                // Не вызываем logout здесь напрямую, чтобы избежать рекурсии
                // Вместо этого просто очищаем состояние
                this.token = null;
                this.isAuthenticated = false;
                this.user = null;
            }
        }
        return this.token;
    }

    public logout(): void {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;

        // Удаление токена и данных пользователя из localStorage
        removeToken();
        removeUser();

        // Перенаправление после выхода
        window.location.href = '/auth';
    }

    /**
     * Обновление профиля пользователя
     */
    public async updateProfile(profileData: { username: string; email: string }): Promise<boolean> {
        try {
            if (!this.user || !this.isAuthenticated) {
                throw new Error('User not authenticated');
            }

            const updatedUser = await userService.updateProfile(this.user.id, profileData);

            if (updatedUser) {
                // Обновляем данные пользователя в store
                this.user = { ...this.user, ...updatedUser };
                // Сохраняем обновленные данные в localStorage
                saveUser(this.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to update profile', error);
            throw error;
        }
    }

    /**
     * Изменение пароля пользователя
     */
    public async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        try {
            if (!this.user || !this.isAuthenticated) {
                throw new Error('User not authenticated');
            }

            const success = await userService.changePassword(this.user.id, oldPassword, newPassword);
            return success;
        } catch (error) {
            console.error('Failed to change password', error);
            throw error;
        }
    }
}

export const authStore = new AuthStore();

// Настройка MobX
export function enableMobX() {
    configure({
        enforceActions: 'never',
        computedRequiresReaction: false,
        reactionRequiresObservable: false,
        observableRequiresReaction: false,
        disableErrorBoundaries: true
    });
}
