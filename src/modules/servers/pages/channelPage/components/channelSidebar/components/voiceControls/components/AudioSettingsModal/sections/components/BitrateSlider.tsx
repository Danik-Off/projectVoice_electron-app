import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface BitrateSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const BitrateSlider: React.FC<BitrateSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <span>Битрейт</span>
            </label>
            <div className="voice-controls__audio-control">
                <input
                    type="range"
                    min="64"
                    max="320"
                    step="32"
                    value={store.bitrate}
                    onChange={(e) => store.setBitrate(Number(e.target.value))}
                    className="voice-controls__audio-slider"
                />
                <span className="voice-controls__audio-value">{store.bitrate} kbps</span>
            </div>
        </div>
    );
});
