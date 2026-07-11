/**
 * Адаптер I18nAdapter - реализация I18nService.
 * Оборачивает react-i18next.
 */

import type { I18nService } from '../model/ports';

/**
 * Создаёт I18nService из функции t.
 * Вызывается в компоненте, где доступен useTranslation().
 */
export const createI18nAdapter = (t: (key: string) => string): I18nService => ({ t });
