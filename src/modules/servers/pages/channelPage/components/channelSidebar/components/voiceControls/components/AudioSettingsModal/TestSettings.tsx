import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '../../../../../../../../../../core';
import { useAudioSettingsHandler } from '../../hooks/useAudioSettingsHandler';

interface TestSettingsProps {
    onError: (error: unknown, context: string) => void;
}

export const TestSettings: React.FC<TestSettingsProps> = observer(({ onError }) => {
    const store = useAudioSettingsHandler(onError);

    const handleAdvancedTest = () => {
        import('../../../../../../../../../../utils/audioTest')
            .then(({ audioTest }) => Promise.all([audioTest.testDefaultSettings(), audioTest.testAudioQuality()]))
            .catch((error: unknown) => {
                onError(error, 'Error loading or running audioTest');
            });
    };

    return (
        <div className="audio-settings-section">
            <h4 className="audio-settings-section__title">🧪 Тестирование</h4>
            <div className="audio-test-buttons">
                <Button variant="secondary" size="small" onClick={store.testMicrophone}>
                    🎤 Тест микрофона
                </Button>
                <Button variant="secondary" size="small" onClick={store.testSpeakers}>
                    🔊 Тест динамиков
                </Button>
                <Button variant="test" size="small" onClick={handleAdvancedTest}>
                    🔬 Полный тест
                </Button>
            </div>
        </div>
    );
});
