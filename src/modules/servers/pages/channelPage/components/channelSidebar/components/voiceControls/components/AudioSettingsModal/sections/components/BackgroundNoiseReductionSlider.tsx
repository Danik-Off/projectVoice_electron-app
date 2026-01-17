import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface BackgroundNoiseReductionSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const BackgroundNoiseReductionSlider: React.FC<BackgroundNoiseReductionSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <span>Снижение фонового шума</span>
            </label>
            <div className="voice-controls__audio-control">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={store.backgroundNoiseReduction * 100}
                    onChange={(e) => store.setBackgroundNoiseReduction(Number(e.target.value) / 100)}
                    className="voice-controls__audio-slider"
                />
                <span className="voice-controls__audio-value">{Math.round(store.backgroundNoiseReduction * 100)}%</span>
            </div>
        </div>
    );
});
