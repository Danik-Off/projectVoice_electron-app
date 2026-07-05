import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface VoiceBoostSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const VoiceBoostSlider: React.FC<VoiceBoostSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Усиление голоса"
            min={0}
            max={100}
            value={store.voiceBoost * 100}
            onChange={(e) => store.setVoiceBoost(Number(e.target.value) / 100)}
        />
    );
});
