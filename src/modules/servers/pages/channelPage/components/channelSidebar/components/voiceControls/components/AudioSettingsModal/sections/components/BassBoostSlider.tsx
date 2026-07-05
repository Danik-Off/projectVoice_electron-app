import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface BassBoostSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const BassBoostSlider: React.FC<BassBoostSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Усиление басов"
            min={0}
            max={100}
            value={store.bassBoost * 100}
            onChange={(e) => store.setBassBoost(Number(e.target.value) / 100)}
        />
    );
});
