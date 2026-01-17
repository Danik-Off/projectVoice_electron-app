import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAudioSettingsHandler } from '../../../../hooks/useAudioSettingsHandler';

interface BufferSizeSliderProps {
    onError: (error: unknown, context: string) => void;
}

export const BufferSizeSlider: React.FC<BufferSizeSliderProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    return (
        <div className="voice-controls__audio-setting">
            <label className="voice-controls__audio-label">
                <span>Размер буфера</span>
            </label>
            <div className="voice-controls__audio-control">
                <input
                    type="range"
                    min="1024"
                    max="8192"
                    step="512"
                    value={store.bufferSize}
                    onChange={(e) => store.setBufferSize(Number(e.target.value))}
                    className="voice-controls__audio-slider"
                />
                <span className="voice-controls__audio-value">{store.bufferSize} сэмплов</span>
            </div>
        </div>
    );
});
