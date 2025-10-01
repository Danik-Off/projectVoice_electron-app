/**
 * Рекомендации и советы по улучшению качества голосовой связи
 */

export interface AudioOptimizationTip {
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    technical: boolean;
}

export const audioOptimizationTips: AudioOptimizationTip[] = [
    // Настройки оборудования
    {
        category: 'Оборудование',
        title: 'Используйте качественный микрофон',
        description: 'USB-микрофоны или профессиональные микрофоны обеспечивают значительно лучшее качество звука по сравнению со встроенными микрофонами ноутбуков.',
        priority: 'high',
        technical: false
    },
    {
        category: 'Оборудование',
        title: 'Проверьте настройки микрофона',
        description: 'Убедитесь, что микрофон не загрязнен и находится на оптимальном расстоянии (15-20 см от рта).',
        priority: 'high',
        technical: false
    },
    {
        category: 'Оборудование',
        title: 'Используйте наушники',
        description: 'Наушники предотвращают эхо и обратную связь, значительно улучшая качество голосовой связи.',
        priority: 'high',
        technical: false
    },

    // Настройки окружения
    {
        category: 'Окружение',
        title: 'Выберите тихое место',
        description: 'Избегайте помещений с эхом, фоновыми шумами и сквозняками. Мягкая мебель и ковры помогают поглощать звук.',
        priority: 'high',
        technical: false
    },
    {
        category: 'Окружение',
        title: 'Контролируйте освещение',
        description: 'Хорошее освещение помогает другим участникам лучше видеть вас, что косвенно влияет на восприятие качества связи.',
        priority: 'medium',
        technical: false
    },

    // Технические настройки
    {
        category: 'Технические настройки',
        title: 'Используйте режим "Ультра"',
        description: 'Включите режим "Ультра" в настройках качества звука для максимального битрейта (512 kbps) и минимальной задержки (25 мс).',
        priority: 'high',
        technical: true
    },
    {
        category: 'Технические настройки',
        title: 'Оптимизируйте интернет-соединение',
        description: 'Используйте проводное подключение к интернету вместо Wi-Fi для стабильности. Минимальная скорость: 1 Мбит/с для голосовой связи.',
        priority: 'high',
        technical: true
    },
    {
        category: 'Технические настройки',
        title: 'Закройте ненужные приложения',
        description: 'Закройте приложения, потребляющие интернет-трафик (стримы, загрузки), чтобы освободить полосу пропускания.',
        priority: 'medium',
        technical: false
    },

    // Настройки браузера
    {
        category: 'Браузер',
        title: 'Обновите браузер',
        description: 'Используйте последнюю версию Chrome, Firefox или Edge для лучшей поддержки WebRTC и аудио кодеков.',
        priority: 'medium',
        technical: false
    },
    {
        category: 'Браузер',
        title: 'Отключите расширения',
        description: 'Временно отключите расширения браузера, которые могут влиять на аудио (блокировщики рекламы, VPN).',
        priority: 'low',
        technical: false
    },

    // Настройки системы
    {
        category: 'Система',
        title: 'Обновите аудиодрайверы',
        description: 'Убедитесь, что у вас установлены последние драйверы для звуковой карты и микрофона.',
        priority: 'medium',
        technical: true
    },
    {
        category: 'Система',
        title: 'Отключите другие аудиоприложения',
        description: 'Закройте другие приложения, использующие микрофон (Skype, Discord, игры), чтобы избежать конфликтов.',
        priority: 'medium',
        technical: false
    },

    // Продвинутые настройки
    {
        category: 'Продвинутые настройки',
        title: 'Настройте эквалайзер',
        description: 'В детальном режиме настроек используйте эквалайзер для усиления голосовых частот (1-3 кГц) и подавления низкочастотных шумов.',
        priority: 'low',
        technical: true
    },
    {
        category: 'Продвинутые настройки',
        title: 'Используйте пространственный звук',
        description: 'Включите пространственный звук в детальных настройках для более естественного восприятия голосов участников.',
        priority: 'low',
        technical: true
    },
    {
        category: 'Продвинутые настройки',
        title: 'Оптимизируйте размер буфера',
        description: 'Уменьшите размер буфера до 1024-2048 сэмплов для минимальной задержки, но следите за стабильностью.',
        priority: 'low',
        technical: true
    }
];

/**
 * Получить рекомендации по категории
 */
export function getTipsByCategory(category: string): AudioOptimizationTip[] {
    return audioOptimizationTips.filter(tip => tip.category === category);
}

/**
 * Получить рекомендации по приоритету
 */
export function getTipsByPriority(priority: 'high' | 'medium' | 'low'): AudioOptimizationTip[] {
    return audioOptimizationTips.filter(tip => tip.priority === priority);
}

/**
 * Получить технические рекомендации
 */
export function getTechnicalTips(): AudioOptimizationTip[] {
    return audioOptimizationTips.filter(tip => tip.technical);
}

/**
 * Получить простые рекомендации
 */
export function getSimpleTips(): AudioOptimizationTip[] {
    return audioOptimizationTips.filter(tip => !tip.technical);
}

/**
 * Получить топ-5 рекомендаций
 */
export function getTopTips(): AudioOptimizationTip[] {
    return audioOptimizationTips
        .filter(tip => tip.priority === 'high')
        .slice(0, 5);
}

/**
 * Проверка качества интернет-соединения
 */
export async function checkConnectionQuality(): Promise<{
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
}> {
    const recommendations: string[] = [];
    
    try {
        // Простая проверка задержки
        const startTime = performance.now();
        await fetch('/api/ping', { method: 'HEAD' });
        const latency = performance.now() - startTime;
        
        let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
        
        if (latency > 200) {
            quality = 'poor';
            recommendations.push('Высокая задержка сети. Проверьте интернет-соединение.');
        } else if (latency > 100) {
            quality = 'fair';
            recommendations.push('Умеренная задержка сети. Рассмотрите использование проводного подключения.');
        } else if (latency > 50) {
            quality = 'good';
        }
        
        return {
            downloadSpeed: 0, // Требует специального API
            uploadSpeed: 0,   // Требует специального API
            latency,
            quality,
            recommendations
        };
    } catch (error) {
        return {
            downloadSpeed: 0,
            uploadSpeed: 0,
            latency: 999,
            quality: 'poor',
            recommendations: ['Не удалось проверить качество соединения. Проверьте подключение к интернету.']
        };
    }
}

/**
 * Диагностика аудио проблем
 */
export function diagnoseAudioIssues(metrics: {
    latency: number;
    bitrate: number;
    signalToNoiseRatio: number;
    distortionLevel: number;
}): string[] {
    const issues: string[] = [];
    
    if (metrics.latency > 200) {
        issues.push('Высокая задержка аудио. Попробуйте уменьшить размер буфера.');
    }
    
    if (metrics.bitrate < 128) {
        issues.push('Низкий битрейт. Увеличьте качество аудио в настройках.');
    }
    
    if (metrics.signalToNoiseRatio < 15) {
        issues.push('Низкое отношение сигнал/шум. Проверьте микрофон и окружение.');
    }
    
    if (metrics.distortionLevel > 10) {
        issues.push('Высокий уровень искажений. Проверьте настройки аудио и микрофон.');
    }
    
    return issues;
}
