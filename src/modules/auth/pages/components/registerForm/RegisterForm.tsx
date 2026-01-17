// RegisterForm.tsx
/* eslint-disable max-lines-per-function, complexity */
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authStore, notificationStore } from '../../../../../core';
import { useTranslation } from 'react-i18next';
import './RegisterForm.scss';

const RegisterForm: React.FC = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const redirect = searchParams.get('redirect');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Валидация формы
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Валидация имени пользователя
        if (!formData.username.trim()) {
            newErrors.username = t('authPage.validation.usernameRequired');
        } else if (formData.username.length < 3) {
            newErrors.username = t('authPage.validation.usernameMinLength');
        } else if (formData.username.length > 20) {
            newErrors.username = t('authPage.validation.usernameMaxLength');
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = t('authPage.validation.usernameInvalid');
        }

        // Валидация email
        if (!formData.email.trim()) {
            newErrors.email = t('authPage.validation.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('authPage.validation.emailInvalid');
        }

        // Валидация пароля
        if (!formData.password) {
            newErrors.password = t('authPage.validation.passwordRequired');
        } else if (formData.password.length < 6) {
            newErrors.password = t('authPage.validation.passwordMinLength');
        } else if (formData.password.length > 50) {
            newErrors.password = t('authPage.validation.passwordMaxLength');
        }

        // Валидация подтверждения пароля
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t('authPage.validation.confirmPasswordRequired');
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t('authPage.validation.passwordsDoNotMatch');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Обработка изменения полей
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Очищаем ошибку при вводе
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    // Обработка потери фокуса
    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    // Функции для оценки силы пароля
    const getPasswordStrength = (password: string): string => {
        if (password.length < 6) {
            return 'weak';
        }
        if (password.length < 10) {
            return 'medium';
        }
        if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) {
            return 'strong';
        }
        return 'medium';
    };

    const getPasswordStrengthPercentage = (password: string): number => {
        if (password.length < 6) {
            return 25;
        }
        if (password.length < 10) {
            return 50;
        }
        if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) {
            return 100;
        }
        return 75;
    };

    const getPasswordStrengthText = (password: string): string => {
        const strength = getPasswordStrength(password);
        switch (strength) {
            case 'weak':
                return t('authPage.passwordStrength.weak');
            case 'medium':
                return t('authPage.passwordStrength.medium');
            case 'strong':
                return t('authPage.passwordStrength.strong');
            default:
                return '';
        }
    };

    // Обработка отправки формы
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        } // Защита от повторной отправки

        // Валидация формы
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const redirectPath = await authStore.register(
                formData.username,
                formData.email,
                formData.password,
                redirect
            );
            notificationStore.addNotification(t('authPage.messages.registrationSuccess'), 'success');
            // Редирект через React Router
            const result = navigate(redirectPath, { replace: true });
            if (result instanceof Promise) {
                result.catch((navError: unknown) => {
                    console.error('Navigation error:', navError);
                });
            }
        } catch (error) {
            console.error('Registration failed:', error);
            if (error instanceof Error) {
                try {
                    const errorData = JSON.parse(error.message) as { error?: string };
                    const errorMsg =
                        errorData.error != null && errorData.error !== ''
                            ? errorData.error
                            : t('authPage.messages.registrationError');
                    notificationStore.addNotification(errorMsg, 'error');
                } catch {
                    const errorMsg = error.message !== '' ? error.message : t('authPage.messages.registrationError');
                    notificationStore.addNotification(errorMsg, 'error');
                }
            } else {
                notificationStore.addNotification(t('authPage.messages.registrationError'), 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        handleRegister(e).catch((error: unknown) => {
            console.error('Form submission error:', error);
        });
    };

    return (
        <form onSubmit={onSubmitHandler} className="auth-form">
            <div className="input-group">
                <input
                    type="text"
                    name="username"
                    placeholder={t('authPage.username')}
                    className={`auth-input ${errors.username && touched.username ? 'auth-input--error' : ''}`}
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    onBlur={() => handleBlur('username')}
                    required
                    maxLength={20}
                />
                {errors.username && touched.username ? <div className="auth-error">{errors.username}</div> : null}
            </div>

            <div className="input-group">
                <input
                    type="email"
                    name="email"
                    placeholder={t('authPage.email')}
                    className={`auth-input ${errors.email && touched.email ? 'auth-input--error' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    required
                />
                {errors.email && touched.email ? <div className="auth-error">{errors.email}</div> : null}
            </div>

            <div className="input-group">
                <input
                    type="password"
                    name="password"
                    placeholder={t('authPage.password')}
                    className={`auth-input ${errors.password && touched.password ? 'auth-input--error' : ''}`}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    required
                    maxLength={50}
                />
                {errors.password && touched.password ? <div className="auth-error">{errors.password}</div> : null}
            </div>

            <div className="input-group">
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder={t('authPage.confirmPassword')}
                    className={`auth-input ${errors.confirmPassword && touched.confirmPassword ? 'auth-input--error' : ''}`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    required
                    maxLength={50}
                />
                {errors.confirmPassword && touched.confirmPassword ? (
                    <div className="auth-error">{errors.confirmPassword}</div>
                ) : null}
            </div>

            <button
                type="submit"
                className={`auth-button ${isSubmitting ? 'auth-button--loading' : ''}`}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <span className="spinner" />
                        {t('authPage.registerButton.loading')}
                    </>
                ) : (
                    t('authPage.signUp')
                )}
            </button>

            {/* Индикатор силы пароля */}
            {formData.password ? (
                <div className="password-strength">
                    <div className="strength-bar">
                        <div
                            className={`strength-fill ${getPasswordStrength(formData.password)}`}
                            style={{ width: `${getPasswordStrengthPercentage(formData.password)}%` }}
                        />
                    </div>
                    <span className="strength-text">{getPasswordStrengthText(formData.password)}</span>
                </div>
            ) : null}
        </form>
    );
};

export default RegisterForm;
