import React from 'react';
import { observer } from 'mobx-react-lite';
import { audioSettingsStore } from '../../../../../../../../../../core';
import { SimpleModeSettings } from './SimpleModeSettings';
import { DetailedModeSettings } from './DetailedModeSettings';
import { VolumeSettings } from './VolumeSettings';
import { TestSettings } from './TestSettings';
import './AudioSettingsModal.scss';

interface AudioSettingsModalProps {
    onClose: () => void;
    onError: (error: unknown, context: string) => void;
}

const AudioSettingsModal: React.FC<AudioSettingsModalProps> = observer(({ onClose, onError }) => (
    <div className="voice-controls__audio-modal-overlay" onClick={onClose}>
        <div className="voice-controls__audio-modal" onClick={(e) => e.stopPropagation()}>
            <div className="voice-controls__audio-modal-header">
                <h3>Настройки звука</h3>
                <button className="voice-controls__audio-modal-close" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="voice-controls__audio-modal-content">
                {/* Переключатель режимов */}
                <div className="voice-controls__audio-section">
                    <h4>⚙️ Режим настроек</h4>
                    <div className="voice-controls__mode-switcher">
                        <button
                            className={`voice-controls__mode-btn ${audioSettingsStore.settingsMode === 'simple' ? 'active' : ''}`}
                            onClick={() => audioSettingsStore.setSettingsMode('simple')}
                        >
                            Простой
                        </button>
                        <button
                            className={`voice-controls__mode-btn ${audioSettingsStore.settingsMode === 'detailed' ? 'active' : ''}`}
                            onClick={() => audioSettingsStore.setSettingsMode('detailed')}
                        >
                            Детальный
                        </button>
                    </div>
                </div>

                {/* Простой режим */}
                {audioSettingsStore.settingsMode === 'simple' && <SimpleModeSettings />}

                {/* Детальный режим */}
                {audioSettingsStore.settingsMode === 'detailed' && <DetailedModeSettings onError={onError} />}

                {/* Настройки громкости */}
                <VolumeSettings onError={onError} />

                {/* Тестирование */}
                <TestSettings onError={onError} />
            </div>
        </div>
    </div>
));

export default AudioSettingsModal;
