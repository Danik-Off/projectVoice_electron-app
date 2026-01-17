import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface NoiseSuppressionCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const NoiseSuppressionCheckbox: React.FC<NoiseSuppressionCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <input
                    type="checkbox"
                    checked={store.noiseSuppression}
                    onChange={(e) => store.setNoiseSuppression(e.target.checked)}
                />
                <span>Шумоподавление</span>
            </label>
            <div className="voice-controls__audio-description">Убирает фоновые шумы</div>
        </div>
    );
});
