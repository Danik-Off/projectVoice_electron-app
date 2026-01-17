import React from 'react';
import { BasicSettings } from './sections/BasicSettings';
import { VoiceEnhancementSettings } from './sections/VoiceEnhancementSettings';
import { EqualizerSettings } from './sections/EqualizerSettings';
import { EffectsSettings } from './sections/EffectsSettings';
import { TechnicalSettings } from './sections/TechnicalSettings';

interface DetailedModeSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const DetailedModeSettings: React.FC<DetailedModeSettingsProps> = ({ onError }) => (
    <>
        <BasicSettings onError={onError} />
        <VoiceEnhancementSettings onError={onError} />
        <EqualizerSettings onError={onError} />
        <EffectsSettings onError={onError} />
        <TechnicalSettings onError={onError} />
    </>
);
