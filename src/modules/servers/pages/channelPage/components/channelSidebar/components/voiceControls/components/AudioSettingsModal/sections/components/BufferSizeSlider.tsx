import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface BufferSizeSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const BufferSizeSlider: React.FC<BufferSizeSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Размер буфера"
            min={1024}
            max={8192}
            step={512}
            value={store.bufferSize}
            valueLabel={`${store.bufferSize} сэмплов`}
            onChange={(e) => store.setBufferSize(Number(e.target.value))}
        />
    );
});
