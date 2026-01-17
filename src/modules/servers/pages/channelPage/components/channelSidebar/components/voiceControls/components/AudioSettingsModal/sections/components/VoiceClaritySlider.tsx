import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface VoiceClaritySliderProps {
    onError: (error: unknown, context: string) => void;
}

export const VoiceClaritySlider: React.FC<VoiceClaritySliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <span>Четкость голоса</span>
            </label>
            <div className="voice-controls__audio-control">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={store.voiceClarity * 100}
                    onChange={(e) => store.setVoiceClarity(Number(e.target.value) / 100)}
                    className="voice-controls__audio-slider"
                />
                <span className="voice-controls__audio-value">{Math.round(store.voiceClarity * 100)}%</span>
            </div>
        </div>
    );
});
