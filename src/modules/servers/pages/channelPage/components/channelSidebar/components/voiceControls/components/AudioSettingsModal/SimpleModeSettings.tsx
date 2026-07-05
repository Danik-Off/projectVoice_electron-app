import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, audioSettingsStore } from '../../../../../../../../../../core';

type Quality = 'low' | 'medium' | 'high' | 'ultra';

const QUALITY_PRESETS: Array<{ value: Quality; title: string; description: string }> = [
    { value: 'low', title: 'Низкое', description: 'Экономия трафика, базовая обработка' },
    { value: 'medium', title: 'Среднее', description: 'Оптимальный баланс качества и производительности' },
    { value: 'high', title: 'Максимальное', description: '48кГц/24бит, 320kbps, минимальная задержка' },
    { value: 'ultra', title: 'Ультра', description: '48кГц/32бит, 512kbps, профессиональное качество' }
];

export const SimpleModeSettings: React.FC = observer(() => (
    <div className="audio-settings-section">
        <h4 className="audio-settings-section__title">🎵 Качество звука</h4>
        <div className="audio-quality-grid">
            {QUALITY_PRESETS.map((preset) => (
                <Card
                    key={preset.value}
                    className={`audio-quality-card ${audioSettingsStore.audioQuality === preset.value ? 'audio-quality-card--active' : ''}`}
                    onClick={() => audioSettingsStore.setAudioQuality(preset.value)}
                >
                    <p className="audio-quality-card__title">{preset.title}</p>
                    <p className="audio-quality-card__desc">{preset.description}</p>
                </Card>
            ))}
        </div>
    </div>
));
