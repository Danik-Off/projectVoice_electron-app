import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface LatencySliderProps {
    onError: (error: unknown, context: string) => void;
}

export const LatencySlider: React.FC<LatencySliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <span>Задержка</span>
            </label>
            <div className="voice-controls__audio-control">
                <input
                    type="range"
                    min="25"
                    max="500"
                    step="25"
                    value={store.latency}
                    onChange={(e) => store.setLatency(Number(e.target.value))}
                    className="voice-controls__audio-slider"
                />
                <span className="voice-controls__audio-value">{store.latency} мс</span>
            </div>
        </div>
    );
});
