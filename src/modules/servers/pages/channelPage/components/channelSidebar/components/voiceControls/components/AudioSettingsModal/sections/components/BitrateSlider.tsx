import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface BitrateSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const BitrateSlider: React.FC<BitrateSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Битрейт"
            min={64}
            max={320}
            step={32}
            value={store.bitrate}
            valueLabel={`${store.bitrate} kbps`}
            onChange={(e) => store.setBitrate(Number(e.target.value))}
        />
    );
});
