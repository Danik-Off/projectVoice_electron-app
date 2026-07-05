/**
 * ProfileSettingsContext — DI-контекст для feature profile-settings.
 *
 * Composition root (app/providers/ServiceProvider) создаёт реальные
 * реализации сервисов и помещает их в контекст.
 * Хук useProfileSettingsDeps достаёт их отсюда.
 */

import { createContext, useContext } from 'react';
import type { ProfileSettingsDeps } from '../model/ports';

/**
 * Контекст с зависимостями.
 * null означает, что провайдер ещё не смонтирован.
 */
export const ProfileSettingsContext = createContext<ProfileSettingsDeps | null>(null);

/**
 * Хук для получения зависимостей из контекста.
 * Бросает ошибку, если использован вне провайдера.
 */
export const useProfileSettingsDeps = (): ProfileSettingsDeps => {
    const deps = useContext(ProfileSettingsContext);
    if (deps === null) {
        throw new Error(
            'useProfileSettingsDeps must be used within <ProfileSettingsContext.Provider>. ' +
            'Оберните дерево в ServiceProvider из app/providers.'
        );
    }
    return deps;
};
