import React from 'react';
import { observer } from 'mobx-react-lite';
import { VoiceEnhancementCheckbox } from './components/VoiceEnhancementCheckbox';
import { VoiceClaritySlider } from './components/VoiceClaritySlider';
import { BackgroundNoiseReductionSlider } from './components/BackgroundNoiseReductionSlider';
import { VoiceBoostSlider } from './components/VoiceBoostSlider';
import { VoiceIsolationCheckbox } from './components/VoiceIsolationCheckbox';

interface VoiceEnhancementSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const VoiceEnhancementSettings: React.FC<VoiceEnhancementSettingsProps> = observer(({ onError }) => (
    <div className="voice-controls__audio-section">
        <h4>🎤 Улучшение голоса</h4>
        <VoiceEnhancementCheckbox onError={onError} />
        <VoiceClaritySlider onError={onError} />
        <BackgroundNoiseReductionSlider onError={onError} />
        <VoiceBoostSlider onError={onError} />
        <VoiceIsolationCheckbox onError={onError} />
    </div>
));
