import React from 'react';
import { observer } from 'mobx-react-lite';
import { Toggle } from '../../../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface VoiceEnhancementCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const VoiceEnhancementCheckbox: React.FC<VoiceEnhancementCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <Toggle
            label="Улучшение голоса"
            helperText="Общее улучшение качества голоса"
            checked={store.voiceEnhancement}
            onChange={(e) => store.setVoiceEnhancement(e.target.checked)}
        />
    );
});
