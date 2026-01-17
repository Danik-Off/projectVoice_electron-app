import React from 'react';
import { observer } from 'mobx-react-lite';
import { BassBoostSlider } from './components/BassBoostSlider';
import { TrebleBoostSlider } from './components/TrebleBoostSlider';

interface EqualizerSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const EqualizerSettings: React.FC<EqualizerSettingsProps> = observer(({ onError }) => (
    <div className="voice-controls__audio-section">
        <h4>🎛️ Эквалайзер</h4>
        <BassBoostSlider onError={onError} />
        <TrebleBoostSlider onError={onError} />
    </div>
));
