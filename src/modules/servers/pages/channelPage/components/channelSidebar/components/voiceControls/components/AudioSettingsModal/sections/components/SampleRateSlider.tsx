import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface SampleRateSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const SampleRateSlider: React.FC<SampleRateSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Частота дискретизации"
            min={8000}
            max={48000}
            step={8000}
            value={store.sampleRate}
            valueLabel={`${store.sampleRate} Гц`}
            onChange={(e) => store.setSampleRate(Number(e.target.value))}
        />
    );
});
