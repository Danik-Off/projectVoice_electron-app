import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface CompressionLevelSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const CompressionLevelSlider: React.FC<CompressionLevelSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Slider
            label="Уровень сжатия"
            min={0}
            max={100}
            step={5}
            value={store.compressionLevel * 100}
            onChange={(e) => store.setCompressionLevel(Number(e.target.value) / 100)}
        />
    );
});
