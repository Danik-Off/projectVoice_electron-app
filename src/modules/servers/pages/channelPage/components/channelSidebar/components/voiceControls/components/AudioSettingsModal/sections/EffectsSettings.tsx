import React from 'react';
import { observer } from 'mobx-react-lite';
import { StereoEnhancementCheckbox } from './components/StereoEnhancementCheckbox';
import { SpatialAudioCheckbox } from './components/SpatialAudioCheckbox';
import { DynamicRangeCompressionSlider } from './components/DynamicRangeCompressionSlider';

interface EffectsSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const EffectsSettings: React.FC<EffectsSettingsProps> = observer(({ onError }) => (
    <div className="voice-controls__audio-section">
        <h4>✨ Дополнительные эффекты</h4>
        <StereoEnhancementCheckbox onError={onError} />
        <SpatialAudioCheckbox onError={onError} />
        <DynamicRangeCompressionSlider onError={onError} />
    </div>
));
