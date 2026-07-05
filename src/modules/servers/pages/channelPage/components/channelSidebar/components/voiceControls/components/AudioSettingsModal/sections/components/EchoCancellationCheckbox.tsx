import React from 'react';
import { observer } from 'mobx-react-lite';
import { Toggle } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface EchoCancellationCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const EchoCancellationCheckbox: React.FC<EchoCancellationCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Toggle
            label="Подавление эха"
            helperText="Убирает эхо и обратную связь"
            checked={store.echoCancellation}
            onChange={(e) => store.setEchoCancellation(e.target.checked)}
        />
    );
});
