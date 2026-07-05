import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface TrebleBoostSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const TrebleBoostSlider: React.FC<TrebleBoostSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Усиление высоких частот"
            min={0}
            max={100}
            value={store.trebleBoost * 100}
            onChange={(e) => store.setTrebleBoost(Number(e.target.value) / 100)}
        />
    );
});
