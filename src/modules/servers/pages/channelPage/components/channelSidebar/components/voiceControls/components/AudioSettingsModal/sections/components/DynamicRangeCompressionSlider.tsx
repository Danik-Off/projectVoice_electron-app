import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface DynamicRangeCompressionSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const DynamicRangeCompressionSlider: React.FC<DynamicRangeCompressionSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Динамическое сжатие"
            min={0}
            max={100}
            value={store.dynamicRangeCompression * 100}
            onChange={(e) => store.setDynamicRangeCompression(Number(e.target.value) / 100)}
        />
    );
});
