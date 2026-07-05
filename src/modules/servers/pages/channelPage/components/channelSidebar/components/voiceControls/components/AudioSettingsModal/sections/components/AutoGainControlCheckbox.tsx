import React from 'react';
import { observer } from 'mobx-react-lite';
import { Toggle } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface AutoGainControlCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const AutoGainControlCheckbox: React.FC<AutoGainControlCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Toggle
            label="Автоконтроль громкости"
            helperText="Автоматически регулирует уровень звука"
            checked={store.autoGainControl}
            onChange={(e) => store.setAutoGainControl(e.target.checked)}
        />
    );
});
