import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface CompressionLevelSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const CompressionLevelSlider: React.FC<CompressionLevelSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <span>Уровень сжатия</span>
            </label>
            <div className="voice-controls__audio-control">
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={store.compressionLevel * 100}
                    onChange={(e) => store.setCompressionLevel(Number(e.target.value) / 100)}
                    className="voice-controls__audio-slider"
                />
                <span className="voice-controls__audio-value">{Math.round(store.compressionLevel * 100)}%</span>
            </div>
        </div>
    );
});
