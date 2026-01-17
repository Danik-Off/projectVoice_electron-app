import React from 'react';
import { observer } from 'mobx-react-lite';
import { EchoCancellationCheckbox } from './components/EchoCancellationCheckbox';
import { NoiseSuppressionCheckbox } from './components/NoiseSuppressionCheckbox';
import { AutoGainControlCheckbox } from './components/AutoGainControlCheckbox';

interface BasicSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const BasicSettings: React.FC<BasicSettingsProps> = observer(({ onError }) => (
    <div className="voice-controls__audio-section">
        <h4>🔧 Основные настройки</h4>
        <EchoCancellationCheckbox onError={onError} />
        <NoiseSuppressionCheckbox onError={onError} />
        <AutoGainControlCheckbox onError={onError} />
    </div>
));
