import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface BackgroundNoiseReductionSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const BackgroundNoiseReductionSlider: React.FC<BackgroundNoiseReductionSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Снижение фонового шума"
            min={0}
            max={100}
            value={store.backgroundNoiseReduction * 100}
            onChange={(e) => store.setBackgroundNoiseReduction(Number(e.target.value) / 100)}
        />
    );
});
