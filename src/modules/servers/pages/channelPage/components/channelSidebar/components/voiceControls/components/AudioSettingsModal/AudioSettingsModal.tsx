import React from 'react';
import { observer } from 'mobx-react-lite';
import { audioSettingsStore } from '../../../../../../../../../../core';
import CloseIcon from '../../../../../../../../../../icons/CloseIcon';
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
    <div className="audio-settings-modal-overlay" onClick={onClose}>
        <div className="audio-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="audio-settings-modal__header">
                <h3>Настройки звука</h3>
                <button type="button" className="audio-settings-modal__close" onClick={onClose} aria-label="Закрыть">
                    <CloseIcon />
                </button>
            </div>

            <div className="audio-settings-modal__content">
                <div className="audio-settings-modal__mode-switcher">
                    <button
                        type="button"
                        className={`audio-settings-modal__mode-tab ${audioSettingsStore.settingsMode === 'simple' ? 'audio-settings-modal__mode-tab--active' : ''}`}
                        onClick={() => audioSettingsStore.setSettingsMode('simple')}
                    >
                        Простой
                    </button>
                    <button
                        type="button"
                        className={`audio-settings-modal__mode-tab ${audioSettingsStore.settingsMode === 'detailed' ? 'audio-settings-modal__mode-tab--active' : ''}`}
                        onClick={() => audioSettingsStore.setSettingsMode('detailed')}
                    >
                        Детальный
                    </button>
                </div>

                {audioSettingsStore.settingsMode === 'simple' && <SimpleModeSettings />}
                {audioSettingsStore.settingsMode === 'detailed' && <DetailedModeSettings onError={onError} />}

                <VolumeSettings onError={onError} />
                <TestSettings onError={onError} />
            </div>
        </div>
    </div>
));

export default AudioSettingsModal;
