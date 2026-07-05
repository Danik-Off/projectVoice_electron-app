import React from 'react';
import { observer } from 'mobx-react-lite';
import { DynamicRangeCompressionSlider } from './components/DynamicRangeCompressionSlider';

interface EffectsSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const EffectsSettings: React.FC<EffectsSettingsProps> = observer(({ onError }) => (
    <div className="audio-settings-section">
        <h4 className="audio-settings-section__title">✨ Дополнительные эффекты</h4>
        <DynamicRangeCompressionSlider onError={onError} />
    </div>
));
