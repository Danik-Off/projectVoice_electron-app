import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface StereoEnhancementCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const StereoEnhancementCheckbox: React.FC<StereoEnhancementCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <input
                    type="checkbox"
                    checked={store.stereoEnhancement}
                    onChange={(e) => store.setStereoEnhancement(e.target.checked)}
                />
                <span>Стерео улучшение</span>
            </label>
            <div className="voice-controls__audio-description">Улучшает стерео эффект</div>
        </div>
    );
});
