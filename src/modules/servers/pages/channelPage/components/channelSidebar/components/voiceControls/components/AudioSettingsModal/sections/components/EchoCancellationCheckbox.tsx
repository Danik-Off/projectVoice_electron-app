import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface EchoCancellationCheckboxProps {
    onError: (error: unknown, context: string) => void;
}

export const EchoCancellationCheckbox: React.FC<EchoCancellationCheckboxProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <input
                    type="checkbox"
                    checked={store.echoCancellation}
                    onChange={(e) => store.setEchoCancellation(e.target.checked)}
                />
                <span>Подавление эха</span>
            </label>
            <div className="voice-controls__audio-description">Убирает эхо и обратную связь</div>
        </div>
    );
});
