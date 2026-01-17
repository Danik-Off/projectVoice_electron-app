import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface BassBoostSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const BassBoostSlider: React.FC<BassBoostSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <span>Усиление басов</span>
            </label>
            <div className="voice-controls__audio-control">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={store.bassBoost * 100}
                    onChange={(e) => store.setBassBoost(Number(e.target.value) / 100)}
                    className="voice-controls__audio-slider"
                />
                <span className="voice-controls__audio-value">{Math.round(store.bassBoost * 100)}%</span>
            </div>
        </div>
    );
});
