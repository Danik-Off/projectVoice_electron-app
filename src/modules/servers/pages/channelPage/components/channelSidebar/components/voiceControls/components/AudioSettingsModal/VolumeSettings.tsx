import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../hooks/useAudioSettingsHandler';

interface VolumeSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const VolumeSettings: React.FC<VolumeSettingsProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-section">
            <h4>🔊 Громкость</h4>
            <div className="voice-controls__audio-setting">
                <label className="voice-controls__audio-label">
                    <span>Громкость микрофона</span>
                </label>
                <div className="voice-controls__audio-control">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={store.volume}
                        onChange={(e) => store.setVolume(Number(e.target.value))}
                        className="voice-controls__audio-slider"
                    />
                    <span className="voice-controls__audio-value">{store.volume}%</span>
                </div>
            </div>
        </div>
    );
});
