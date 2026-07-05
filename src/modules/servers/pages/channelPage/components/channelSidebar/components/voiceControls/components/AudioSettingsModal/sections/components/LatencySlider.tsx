import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface LatencySliderProps {
    onError: (error: unknown, context: string) => void;
}

export const LatencySlider: React.FC<LatencySliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Задержка"
            min={25}
            max={500}
            step={25}
            value={store.latency}
            valueLabel={`${store.latency} мс`}
            onChange={(e) => store.setLatency(Number(e.target.value))}
        />
    );
});
