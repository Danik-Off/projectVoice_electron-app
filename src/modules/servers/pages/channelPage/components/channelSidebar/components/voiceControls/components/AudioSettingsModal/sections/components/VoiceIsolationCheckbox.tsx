import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface VoiceIsolationCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const VoiceIsolationCheckbox: React.FC<VoiceIsolationCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <input
                    type="checkbox"
                    checked={store.voiceIsolation}
                    onChange={(e) => store.setVoiceIsolation(e.target.checked)}
                />
                <span>Изоляция голоса</span>
            </label>
            <div className="voice-controls__audio-description">Выделяет только голосовые частоты</div>
        </div>
    );
});
