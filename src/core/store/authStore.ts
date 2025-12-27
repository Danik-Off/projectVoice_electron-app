import { makeAutoObservable, configure } from 'mobx';
import { authService } from '../../modules/auth/services/authService';
import { getCookie, setCookie } from '../../shared/utils/cookie';
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
        // Проверка наличия токена в cookies при инициализации
        this.token = getCookie('token');
        // Устанавливаем isAuthenticated = true если есть токен
        // Авторизация сохраняется до тех пор, пока сервер не вернет ошибку о протухшем токене
        this.isAuthenticated = this.token !== null;
        
        console.log('AuthStore constructor - token:', this.token, 'isAuthenticated:', this.isAuthenticated);
        
        // Загружаем данные пользователя, если есть токен
        // Если токен протух, loadUserData вызовет logout только при ошибке токена
        if (this.token) {
            // Загружаем асинхронно, не блокируя инициализацию
            this.loadUserData().catch(error => {
                // Ошибка уже обработана в loadUserData
                console.error('Error loading user data on init:', error);
            });
        }
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

            // Сохранение токена в cookie
            setCookie('token', data.token, 7); // Токен будет действителен 7 дней
            
            console.log('Token saved to cookie:', data.token);
            console.log('Cookie after save:', document.cookie);

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
        } catch (error) {
            console.error('Failed to load user data:', error);
            
            // Проверяем, является ли это ошибкой протухшего токена
            const errorMessage = error instanceof Error ? error.message : String(error);
            const isTokenError = errorMessage.includes('401') || 
                                 errorMessage.includes('Недействительный токен') ||
                                 errorMessage.includes('invalid token') ||
                                 errorMessage.includes('token expired') ||
                                 errorMessage.includes('unauthorized');
            
            if (isTokenError) {
                // Токен протух - выходим из системы
                console.warn('Token expired during user data load, logging out...');
                this.logout();
            } else {
                // Другая ошибка - не выходим, просто показываем уведомление
                notificationStore.addNotification('notifications.serverDataLoadError', 'error');
                // Сохраняем авторизацию, но не загружаем данные пользователя
                // Пользователь останется авторизованным до следующего запроса
            }
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

            // Сохранение токена в cookie
            setCookie('token', data.token, 7); // Токен будет действителен 7 дней
            
            console.log('Token saved to cookie:', data.token);
            console.log('Cookie after save:', document.cookie);

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
        return this.token;
    }

    public logout(): void {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;

        // Удаление токена из cookie
        setCookie('token', '', -1); // Устанавливаем срок действия в -1, чтобы удалить cookie

        // Перенаправление после выхода
        window.location.href = '/auth'; // Замените '/login' на нужный URL
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

