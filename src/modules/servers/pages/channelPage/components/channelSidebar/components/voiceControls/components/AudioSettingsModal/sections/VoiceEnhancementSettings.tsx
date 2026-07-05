import React from 'react';
import { observer } from 'mobx-react-lite';
import { VoiceEnhancementCheckbox } from './components/VoiceEnhancementCheckbox';
import { VoiceClaritySlider } from './components/VoiceClaritySlider';
import { BackgroundNoiseReductionSlider } from './components/BackgroundNoiseReductionSlider';
import { VoiceBoostSlider } from './components/VoiceBoostSlider';

interface VoiceEnhancementSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const VoiceEnhancementSettings: React.FC<VoiceEnhancementSettingsProps> = observer(({ onError }) => (
    <div className="audio-settings-section">
        <h4 className="audio-settings-section__title">🎤 Улучшение голоса</h4>
        <VoiceEnhancementCheckbox onError={onError} />
        <VoiceClaritySlider onError={onError} />
        <BackgroundNoiseReductionSlider onError={onError} />
        <VoiceBoostSlider onError={onError} />
    </div>
));
