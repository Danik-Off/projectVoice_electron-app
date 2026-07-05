import React from 'react';
import { observer } from 'mobx-react-lite';
import { SampleRateSlider } from './components/SampleRateSlider';
import { BitrateSlider } from './components/BitrateSlider';
import { LatencySlider } from './components/LatencySlider';
import { BufferSizeSlider } from './components/BufferSizeSlider';
import { CompressionLevelSlider } from './components/CompressionLevelSlider';

interface TechnicalSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const TechnicalSettings: React.FC<TechnicalSettingsProps> = observer(({ onError }) => (
    <div className="audio-settings-section">
        <h4 className="audio-settings-section__title">⚙️ Технические настройки</h4>
        <SampleRateSlider onError={onError} />
        <BitrateSlider onError={onError} />
        <LatencySlider onError={onError} />
        <BufferSizeSlider onError={onError} />
        <CompressionLevelSlider onError={onError} />
    </div>
));
