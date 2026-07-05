import React from 'react';
import { observer } from 'mobx-react-lite';
import { Toggle } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface NoiseSuppressionCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const NoiseSuppressionCheckbox: React.FC<NoiseSuppressionCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Toggle
            label="Шумоподавление"
            helperText="Убирает фоновые шумы"
            checked={store.noiseSuppression}
            onChange={(e) => store.setNoiseSuppression(e.target.checked)}
        />
    );
});
