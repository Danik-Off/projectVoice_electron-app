import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface VoiceBoostSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const VoiceBoostSlider: React.FC<VoiceBoostSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <span>Усиление голоса</span>
            </label>
            <div className="voice-controls__audio-control">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={store.voiceBoost * 100}
                    onChange={(e) => store.setVoiceBoost(Number(e.target.value) / 100)}
                    className="voice-controls__audio-slider"
                />
                <span className="voice-controls__audio-value">{Math.round(store.voiceBoost * 100)}%</span>
            </div>
        </div>
    );
});
