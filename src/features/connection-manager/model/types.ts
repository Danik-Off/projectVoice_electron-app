/**
 * Типы для feature connection-manager.
 */

import type { ConnectionStatus, RetryInfo } from '../../../entities/connection';

/** Состояние хука useConnectionManager */
export interface ConnectionState {
    /** Текущий статус подключения */
    status: ConnectionStatus;

    /** URL сервера */
    serverUrl: string;

    /** Информация о попытках переподключения */
    retryInfo: RetryInfo | null;

    /** Открыта ли модалка */
    isModalOpen: boolean;

    /** Открыта ли модалка вручную (через настройки) */
    isManualSettings: boolean;

    /** Режим редактирования URL */
    isEditing: boolean;

    /** Поле ввода нового URL */
    newUrl: string;

    /** Ошибка валидации URL */
    urlError: string | null;

    /** Сохраняется ли URL */
    isSaving: boolean;
}

/** Действия, доступные из UI */
export interface ConnectionActions {
    /** Открыть настройки сервера вручную */
    openSettings: () => void;

    /** Закрыть модалку */
    closeModal: () => void;

    /// Войти в режим редактирования URL
    startEditing: () => void;

    /// Сохранить новый URL
    saveUrl: () => void;

    /// Отменить редактирование
    cancelEditing: () => void;

    /// Обновить поле ввода URL
    setNewUrl: (url: string) => void;

    /// Повторить подключение вручную
    retryNow: () => void;
}

/** Полный return-тип хука */
export type UseConnectionManagerReturn = ConnectionState & ConnectionActions;
