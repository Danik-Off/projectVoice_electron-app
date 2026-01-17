import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface VoiceEnhancementCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const VoiceEnhancementCheckbox: React.FC<VoiceEnhancementCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <input
                    type="checkbox"
                    checked={store.voiceEnhancement}
                    onChange={(e) => store.setVoiceEnhancement(e.target.checked)}
                />
                <span>Улучшение голоса</span>
            </label>
            <div className="voice-controls__audio-description">Общее улучшение качества голоса</div>
        </div>
    );
});
