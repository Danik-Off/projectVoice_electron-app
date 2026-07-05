import React from 'react';
import { observer } from 'mobx-react-lite';
import { BassBoostSlider } from './components/BassBoostSlider';
import { TrebleBoostSlider } from './components/TrebleBoostSlider';

interface EqualizerSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const EqualizerSettings: React.FC<EqualizerSettingsProps> = observer(({ onError }) => (
    <div className="audio-settings-section">
        <h4 className="audio-settings-section__title">🎛️ Эквалайзер</h4>
        <BassBoostSlider onError={onError} />
        <TrebleBoostSlider onError={onError} />
    </div>
));
