import { makeAutoObservable, configure } from 'mobx';
import { authService } from '../../modules/auth/services/authService';
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
        
        console.log('🔐 Restoring auth from localStorage...');
        console.log('📦 Token exists:', !!savedToken);
        console.log('📦 User data exists:', !!savedUser);
        
        if (savedToken) {
            // Восстанавливаем токен и устанавливаем авторизацию СИНХРОННО
            this.token = savedToken;
            this.isAuthenticated = true;
            
            // Восстанавливаем данные пользователя из localStorage, если они есть
            if (savedUser) {
                this.user = savedUser;
                console.log('✅ User data restored from localStorage:', savedUser.username, 'role:', savedUser.role);
            }
            
            console.log('✅ Auth restored from localStorage - token present, isAuthenticated:', this.isAuthenticated);
            console.log('✅ Token restored:', this.token.substring(0, 20) + '...');
            
            // Загружаем актуальные данные пользователя асинхронно
            // НЕ вызываем logout при ошибке - пользователь должен выйти вручную
            this.loadUserData().catch(error => {
                // Ошибка уже обработана в loadUserData
                // Авторизация сохраняется даже при ошибке загрузки данных
                console.error('❌ Error loading user data on init:', error);
                console.log('⚠️ But keeping isAuthenticated = true and using cached user data');
            });
        } else {
            // Нет токена в localStorage - пользователь не авторизован
            this.token = null;
            this.user = null;
            this.isAuthenticated = false;
            removeUser(); // Очищаем данные пользователя
            console.log('❌ No token in localStorage - user not authenticated');
        }
        
        console.log('🔐 Auth restoration complete. isAuthenticated:', this.isAuthenticated, 'user:', this.user?.username);
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
            
            console.log('Login successful - token and user data saved to localStorage, isAuthenticated:', true);

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
                console.log('No token available for loadUserData');
                return;
            }
            
            console.log('Loading user data with token:', this.token);
            const userData = await authService.getMe();
            console.log('User data loaded:', userData);
            this.user = userData;
            this.isAuthenticated = true;
            
            // Сохраняем данные пользователя в localStorage
            saveUser(userData);
        } catch (error) {
            console.error('Failed to load user data:', error);
            
            // НЕ вызываем logout автоматически - пользователь должен выйти вручную через кнопку
            // Сохраняем авторизацию даже при ошибке загрузки данных
            // Пользователь останется авторизованным до ручного выхода
            notificationStore.addNotification('notifications.serverDataLoadError', 'error');
            
            // Сохраняем isAuthenticated = true, даже если не удалось загрузить данные
            // Это позволяет пользователю оставаться авторизованным после перезагрузки
            this.isAuthenticated = true;
        }
    }

    public async register(username: string, email: string, password: string, redirect?: string | null): Promise<string> {
        try {
            this.loading = true;
            const data = await authService.register(email, username, password);
            
            if (!data || !data.token) {
                throw new Error('Invalid response from server');
            }
            
            // После успешной регистрации получаем информацию о пользователе
            const userData = await authService.getMe();
            this.user = userData;
            this.token = data.token;

            // Сохранение токена и данных пользователя в localStorage
            saveToken(data.token);
            saveUser(userData);
            
            console.log('Registration successful - token and user data saved to localStorage, isAuthenticated:', true);

            this.isAuthenticated = true;
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
                // Токен удален из localStorage - НЕ выходим автоматически
                // Пользователь должен выйти вручную через кнопку
                console.warn('Token removed from localStorage, but keeping authentication until manual logout');
                // Оставляем isAuthenticated = true, чтобы пользователь не был разлогинен
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

