// LoginForm.tsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authStore, notificationStore } from '../../../../../core';
import { useTranslation } from 'react-i18next';

const LoginForm: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const redirect = searchParams.get('redirect');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        } // Защита от повторной отправки

        const formData = e.currentTarget.elements as typeof e.currentTarget.elements & {
            email: HTMLInputElement;
            password: HTMLInputElement;
        };

        const email = formData.email.value;
        const password = formData.password.value;

        setIsSubmitting(true);

        try {
            const redirectPath = await authStore.login(email, password, redirect);
            // Редирект через React Router
            const result = navigate(redirectPath, { replace: true });
            if (result instanceof Promise) {
                result.catch((navError: unknown) => {
                    console.error('Navigation error:', navError);
                });
            }
        } catch (error) {
            console.error('Login failed:', error);
            if (error instanceof Error) {
                try {
                    const errorData = JSON.parse(error.message) as { error?: string };
                    const errorMsg =
                        errorData.error != null && errorData.error !== ''
                            ? errorData.error
                            : t('authPage.messages.loginError');
                    notificationStore.addNotification(errorMsg, 'error');
                } catch {
                    const errorMsg = error.message !== '' ? error.message : t('authPage.messages.loginError');
                    notificationStore.addNotification(errorMsg, 'error');
                }
            } else {
                notificationStore.addNotification(t('authPage.messages.loginError'), 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        handleLogin(e).catch((error: unknown) => {
            console.error('Form submission error:', error);
        });
    };

    return (
        <form onSubmit={onSubmitHandler} className="auth-form">
            <div className="input-group">
                <input type="email" name="email" placeholder={t('authPage.email')} className="auth-input" required />
            </div>
            <div className="input-group">
                <input
                    type="password"
                    name="password"
                    placeholder={t('authPage.password')}
                    className="auth-input"
                    required
                />
            </div>
            <button
                type="submit"
                className={`auth-button ${isSubmitting ? 'auth-button--loading' : ''}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <span className="spinner" />
                        {t('authPage.loginButton.loading')}
                    </>
                ) : (
                    t('authPage.btnLogin')
                )}
            </button>
        </form>
    );
};

export default LoginForm;
