import React from 'react';
import { audioSettingsStore } from '../../../../../../../../../../core';

export const SimpleModeSettings: React.FC = () => (
    <div className="voice-controls__audio-section">
        <h4>🎵 Качество звука</h4>
        <div className="voice-controls__quality-selector">
            <button
                className={`voice-controls__quality-btn ${audioSettingsStore.audioQuality === 'low' ? 'active' : ''}`}
                onClick={() => audioSettingsStore.setAudioQuality('low')}
            >
                <div className="voice-controls__quality-title">Низкое</div>
                <div className="voice-controls__quality-desc">Экономия трафика, базовая обработка</div>
            </button>
            <button
                className={`voice-controls__quality-btn ${audioSettingsStore.audioQuality === 'medium' ? 'active' : ''}`}
                onClick={() => audioSettingsStore.setAudioQuality('medium')}
            >
                <div className="voice-controls__quality-title">Среднее</div>
                <div className="voice-controls__quality-desc">Оптимальный баланс качества и производительности</div>
            </button>
            <button
                className={`voice-controls__quality-btn ${audioSettingsStore.audioQuality === 'high' ? 'active' : ''}`}
                onClick={() => audioSettingsStore.setAudioQuality('high')}
            >
                <div className="voice-controls__quality-title">Максимальное</div>
                <div className="voice-controls__quality-desc">48kHz/24bit, 320kbps, минимальная задержка</div>
            </button>
            <button
                className={`voice-controls__quality-btn ${audioSettingsStore.audioQuality === 'ultra' ? 'active' : ''}`}
                onClick={() => audioSettingsStore.setAudioQuality('ultra')}
            >
                <div className="voice-controls__quality-title">Ультра</div>
                <div className="voice-controls__quality-desc">48kHz/32bit, 512kbps, профессиональное качество</div>
            </button>
        </div>
    </div>
);
