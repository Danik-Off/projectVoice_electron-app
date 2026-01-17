import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface SpatialAudioCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const SpatialAudioCheckbox: React.FC<SpatialAudioCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <input
                    type="checkbox"
                    checked={store.spatialAudio}
                    onChange={(e) => store.setSpatialAudio(e.target.checked)}
                />
                <span>Пространственный звук</span>
            </label>
            <div className="voice-controls__audio-description">Создает эффект объемного звучания</div>
        </div>
    );
});
