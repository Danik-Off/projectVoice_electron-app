import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface AutoGainControlCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const AutoGainControlCheckbox: React.FC<AutoGainControlCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <input
                    type="checkbox"
                    checked={store.autoGainControl}
                    onChange={(e) => store.setAutoGainControl(e.target.checked)}
                />
                <span>Автоконтроль громкости</span>
            </label>
            <div className="voice-controls__audio-description">Автоматически регулирует уровень звука</div>
        </div>
    );
});
