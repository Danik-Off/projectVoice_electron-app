import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface SampleRateSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const SampleRateSlider: React.FC<SampleRateSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <span>Частота дискретизации</span>
            </label>
            <div className="voice-controls__audio-control">
                <input
                    type="range"
                    min="8000"
                    max="48000"
                    step="8000"
                    value={store.sampleRate}
                    onChange={(e) => store.setSampleRate(Number(e.target.value))}
                    className="voice-controls__audio-slider"
                />
                <span className="voice-controls__audio-value">{store.sampleRate} Гц</span>
            </div>
        </div>
    );
});
