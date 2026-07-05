import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface VoiceClaritySliderProps {
    onError: (error: unknown, context: string) => void;
}

export const VoiceClaritySlider: React.FC<VoiceClaritySliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Четкость голоса"
            min={0}
            max={100}
            value={store.voiceClarity * 100}
            onChange={(e) => store.setVoiceClarity(Number(e.target.value) / 100)}
        />
    );
});
