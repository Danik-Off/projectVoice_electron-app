import React from 'react';
import { observer } from 'mobx-react-lite';
import { Slider } from '../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../hooks/useAudioSettingsHandler';

interface VolumeSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const VolumeSettings: React.FC<VolumeSettingsProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="audio-settings-section">
            <h4 className="audio-settings-section__title">🔊 Громкость</h4>
            <Slider
                label="Громкость микрофона"
                min={0}
                max={100}
                value={store.volume}
                onChange={(e) => store.setVolume(Number(e.target.value))}
            />
        </div>
    );
});
