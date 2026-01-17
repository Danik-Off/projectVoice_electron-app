import React from 'react';
import { observer } from 'mobx-react-lite';
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
        <div className="voice-controls__audio-section">
            <h4>🧪 Тестирование</h4>
            <div className="voice-controls__audio-test-buttons">
                <button className="voice-controls__audio-test-btn" onClick={store.testMicrophone}>
                    🎤 Тест микрофона
                </button>
                <button className="voice-controls__audio-test-btn" onClick={store.testSpeakers}>
                    🔊 Тест динамиков
                </button>
                <button
                    className="voice-controls__audio-test-btn voice-controls__audio-test-btn--advanced"
                    onClick={handleAdvancedTest}
                >
                    🔬 Полный тест
                </button>
            </div>
        </div>
    );
});
