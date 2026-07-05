/* eslint-disable max-lines -- Complex audio settings component */
/* eslint-disable max-lines-per-function -- Complex audio settings logic */
import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { audioSettingsStore } from '../../../../../core';
import roomStore from '../../../../../modules/voice/store/roomStore';
import './audioSettings.scss';

const AudioSettings: React.FC = observer(() => {
    const [isMicActive, setIsMicActive] = useState(false);
    const [isSpeakerActive, setIsSpeakerActive] = useState(false);
    const isReconnectingRef = useRef(false);

    // Вспомогательные функции для безопасного вызова методов настроек
    const handleVoiceBoostChange = React.useCallback((value: number) => {
        try {
            const result = audioSettingsStore.setVoiceBoost(value);
            // Обрабатываем Promise, если метод его возвращает
            if (result instanceof Promise) {
                result.catch((error: unknown) => {
                    console.error('Error setting voice boost:', error);
                });
            }
        } catch (error: unknown) {
            console.error('Error setting voice boost:', error);
        }
    }, []);

    const handleTrebleBoostChange = React.useCallback((value: number) => {
        try {
            const result = audioSettingsStore.setTrebleBoost(value);
            // Обрабатываем Promise, если метод его возвращает
            if (result instanceof Promise) {
                result.catch((error: unknown) => {
                    console.error('Error setting treble boost:', error);
                });
            }
        } catch (error: unknown) {
            console.error('Error setting treble boost:', error);
        }
    }, []);

    const handleApplyAllSettings = React.useCallback(() => {
        try {
            const result = audioSettingsStore.applyAllSettings();
            // Обрабатываем Promise, если метод его возвращает
            if (result instanceof Promise) {
                result.catch((error: unknown) => {
                    console.error('Error applying settings:', error);
                });
            }
        } catch (error: unknown) {
            console.error('Error applying settings:', error);
        }
    }, []);

    const handleResetToDefaults = React.useCallback(() => {
        try {
            const result = audioSettingsStore.resetToDefaults();
            // Обрабатываем Promise, если метод его возвращает
            if (result instanceof Promise) {
                result.catch((error: unknown) => {
                    console.error('Error resetting to defaults:', error);
                });
            }
        } catch (error: unknown) {
            console.error('Error resetting to defaults:', error);
        }
    }, []);

    const handleAutoReconnect = React.useCallback(() => {
        if (roomStore.currentVoiceChannel != null && !isReconnectingRef.current) {
            isReconnectingRef.current = true;
            const currentChannel = roomStore.currentVoiceChannel;

            try {
                // Отключаемся от текущего канала
                roomStore.disconnectToRoom();

                // Функция для сброса флага переподключения
                const resetReconnectingFlag = () => {
                    isReconnectingRef.current = false;
                };

                // Небольшая задержка для корректного отключения
                setTimeout(() => {
                    // Переподключаемся с новыми настройками
                    roomStore.connectToRoom(currentChannel.id, currentChannel.name);

                    // Сбрасываем флаг переподключения через 3 секунды
                    setTimeout(resetReconnectingFlag, 3000);
                }, 1000);
            } catch (reconnectError: unknown) {
                console.error('AudioSettings: Error during auto-reconnect:', reconnectError);
                isReconnectingRef.current = false;
            }
        }
    }, []);

    // Инициализируем микрофон при открытии настроек аудио
    useEffect(() => {
        // Проверяем, нужен ли микрофон и не инициализирован ли он уже
        if (!audioSettingsStore.isMicrophoneNeeded()) {
            audioSettingsStore.initMedia();
        }

        // Очищаем микрофон при закрытии настроек аудио
        return () => {
            // Не очищаем микрофон, если пользователь находится в голосовом канале
            if (!roomStore.currentVoiceChannel) {
                audioSettingsStore.cleanup();
            }
        };
    }, []);

    // Автоматическое переподключение при изменении настроек
    useEffect(() => {
        let lastSettings = '';
        let isInitialized = false;

        const checkForChanges = () => {
            // Пропускаем проверку, если уже идет переподключение
            if (isReconnectingRef.current) {
                return;
            }

            const currentSettings = {
                microphone: audioSettingsStore.selectedMicrophone?.deviceId,
                speaker: audioSettingsStore.selectedSpeaker?.deviceId,
                volume: audioSettingsStore.volume,
                echoCancellation: audioSettingsStore.echoCancellation,
                noiseSuppression: audioSettingsStore.noiseSuppression,
                autoGainControl: audioSettingsStore.autoGainControl,
                voiceEnhancement: audioSettingsStore.voiceEnhancement,
                voiceClarity: audioSettingsStore.voiceClarity,
                backgroundNoiseReduction: audioSettingsStore.backgroundNoiseReduction,
                voiceBoost: audioSettingsStore.voiceBoost,
                bassBoost: audioSettingsStore.bassBoost,
                trebleBoost: audioSettingsStore.trebleBoost,
                sampleRate: audioSettingsStore.sampleRate,
                bitrate: audioSettingsStore.bitrate,
                latency: audioSettingsStore.latency,
                channelCount: audioSettingsStore.channelCount
            };

            const currentSettingsString = JSON.stringify(currentSettings);

            // Инициализируем базовые настройки при первом запуске
            if (!isInitialized) {
                lastSettings = currentSettingsString;
                isInitialized = true;

                return;
            }

            // Проверяем, действительно ли настройки изменились
            if (currentSettingsString !== lastSettings && roomStore.currentVoiceChannel) {
                lastSettings = currentSettingsString;

                handleAutoReconnect();
            }
        };

        // Проверяем изменения каждые 1000мс (увеличили интервал)
        const interval = setInterval(checkForChanges, 1000);

        return () => clearInterval(interval);
    }, [handleAutoReconnect]);

    return (
        <div className="settings-section">
            <div className="section-header">
                <h2>Настройки аудио</h2>
                <p>Настройка микрофона, динамиков и параметров звука</p>
            </div>

            <div className="section-content">
                {/* Input Device Settings */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🎤</div>
                            <div className="header-text">
                                <h3>Устройства ввода</h3>
                                <p>Настройка микрофона и параметров записи</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        {/* Microphone Selection */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Микрофон</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <select
                                    className="settings-select"
                                    value={audioSettingsStore.selectedMicrophone?.deviceId ?? ''}
                                    onChange={(e) => {
                                        const deviceId = e.target.value;
                                        if (deviceId.length > 0) {
                                            audioSettingsStore
                                                .setMicrophone(deviceId)
                                                .catch((microphoneError: unknown) => {
                                                    console.error('Error setting microphone:', microphoneError);
                                                });
                                        }
                                    }}
                                >
                                    <option value="">Выберите микрофон</option>
                                    {audioSettingsStore.microphoneDevices.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || 'Неизвестное устройство'}
                                        </option>
                                    ))}
                                </select>
                                <div className="setting-description">Выберите устройство для записи голоса</div>
                            </div>
                        </div>

                        {/* Input Volume */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Громкость ввода</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="volume-control">
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={audioSettingsStore.volume}
                                        onChange={(e) => audioSettingsStore.setVolume(Number(e.target.value))}
                                        className="settings-slider"
                                    />
                                    <span className="volume-value">{audioSettingsStore.volume}%</span>
                                </div>
                                <div className="volume-visualizer">
                                    <div className="volume-bar">
                                        <div
                                            className="volume-fill"
                                            style={{ width: `${Math.min(audioSettingsStore.volume, 100)}%` }}
                                        />
                                        {audioSettingsStore.volume > 100 && (
                                            <div
                                                className="volume-fill-over"
                                                style={{ width: `${Math.min(audioSettingsStore.volume - 100, 100)}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="setting-description">Уровень записи микрофона (0-200%)</div>
                            </div>
                        </div>

                        {/* Channel Selection */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Каналы записи</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="radio-group">
                                    <label className="radio-item">
                                        <input
                                            type="radio"
                                            name="channel"
                                            value="mono"
                                            checked={audioSettingsStore.channelCount === 1}
                                            onChange={() => {
                                                audioSettingsStore.setChannelCount('mono');
                                            }}
                                        />
                                        <span className="radio-label">Моно (1 канал)</span>
                                    </label>
                                    <label className="radio-item">
                                        <input
                                            type="radio"
                                            name="channel"
                                            value="stereo"
                                            checked={audioSettingsStore.channelCount === 2}
                                            onChange={() => {
                                                audioSettingsStore.setChannelCount('stereo');
                                            }}
                                        />
                                        <span className="radio-label">Стерео (2 канала)</span>
                                    </label>
                                </div>
                                <div className="setting-description">Количество аудио каналов для записи</div>
                            </div>
                        </div>

                        {/* Test Microphone */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Тестирование микрофона</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <button
                                    className="settings-button settings-button--test"
                                    onClick={() => {
                                        setIsMicActive(true);
                                        audioSettingsStore.testMicrophone();
                                        setTimeout(() => setIsMicActive(false), 3000);
                                    }}
                                >
                                    {isMicActive === true ? 'Тестирование...' : 'Начать тест'}
                                </button>
                                <div className="setting-description">Проверьте работу микрофона</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Output Device Settings */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🔊</div>
                            <div className="header-text">
                                <h3>Устройства вывода</h3>
                                <p>Настройка динамиков и параметров воспроизведения</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        {/* Speaker Selection */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Динамики</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <select
                                    className="settings-select"
                                    value={audioSettingsStore.selectedSpeaker?.deviceId ?? ''}
                                    onChange={(e) => {
                                        const deviceId = e.target.value;
                                        if (deviceId.length > 0) {
                                            audioSettingsStore.setSpeaker(deviceId).catch((speakerError: unknown) => {
                                                console.error('Error setting speaker:', speakerError);
                                            });
                                        }
                                    }}
                                >
                                    <option value="">Выберите устройство</option>
                                    {audioSettingsStore.speakerDevices.map((device) => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || 'Неизвестное устройство'}
                                        </option>
                                    ))}
                                </select>
                                <div className="setting-description">Выберите устройство для воспроизведения</div>
                            </div>
                        </div>

                        {/* Output Volume */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Громкость вывода</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="volume-control">
                                    <input type="range" min="0" max="200" value={50} className="settings-slider" />
                                    <span className="volume-value">50%</span>
                                </div>
                                <div className="volume-visualizer">
                                    <div className="volume-bar">
                                        <div className="volume-fill" style={{ width: '50%' }} />
                                    </div>
                                </div>
                                <div className="setting-description">Уровень воспроизведения (0-200%)</div>
                            </div>
                        </div>

                        {/* Speaker Mute */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Управление звуком</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="settings-toggle">
                                    <input
                                        type="checkbox"
                                        checked={!audioSettingsStore.isSpeakerMuted}
                                        onChange={() => {
                                            audioSettingsStore.toggleSpeakerMute().catch((toggleError: unknown) => {
                                                console.error('Error toggling speaker mute:', toggleError);
                                            });
                                        }}
                                    />
                                    <span className="toggle-switch" />
                                    <span className="toggle-label">Включить звук</span>
                                </div>
                                <div className="setting-description">Включение/отключение звука</div>
                            </div>
                        </div>

                        {/* Test Speaker */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Тестирование динамиков</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <button
                                    className="settings-button settings-button--test"
                                    onClick={() => {
                                        setIsSpeakerActive(true);
                                        audioSettingsStore.testSpeakers();
                                        setTimeout(() => setIsSpeakerActive(false), 3000);
                                    }}
                                >
                                    {isSpeakerActive === true ? 'Тестирование...' : 'Начать тест'}
                                </button>
                                <div className="setting-description">Проверьте работу динамиков</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audio Processing Settings */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">🎛️</div>
                            <div className="header-text">
                                <h3>Обработка звука</h3>
                                <p>Основные алгоритмы обработки аудио</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        {/* Basic Processing */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Базовая обработка</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="checkbox-group">
                                    <label className="settings-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={audioSettingsStore.echoCancellation}
                                            onChange={(e) => {
                                                audioSettingsStore
                                                    .setEchoCancellation(e.target.checked)
                                                    .catch((echoError: unknown) => {
                                                        console.error('Error setting echo cancellation:', echoError);
                                                    });
                                            }}
                                        />
                                        <span className="checkmark" />
                                        <span className="checkbox-label">Подавление эха</span>
                                    </label>
                                    <label className="settings-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={audioSettingsStore.noiseSuppression}
                                            onChange={(e) => {
                                                audioSettingsStore
                                                    .setNoiseSuppression(e.target.checked)
                                                    .catch((noiseError: unknown) => {
                                                        console.error('Error setting noise suppression:', noiseError);
                                                    });
                                            }}
                                        />
                                        <span className="checkmark" />
                                        <span className="checkbox-label">Шумоподавление</span>
                                    </label>
                                    <label className="settings-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={audioSettingsStore.autoGainControl}
                                            onChange={(e) => {
                                                audioSettingsStore
                                                    .setAutoGainControl(e.target.checked)
                                                    .catch((agcError: unknown) => {
                                                        console.error('Error setting auto gain control:', agcError);
                                                    });
                                            }}
                                        />
                                        <span className="checkmark" />
                                        <span className="checkbox-label">Автоконтроль громкости</span>
                                    </label>
                                </div>
                                <div className="setting-description">Основные алгоритмы улучшения звука</div>
                            </div>
                        </div>

                        {/* Advanced Processing */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Расширенная обработка</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="checkbox-group">
                                    <label className="settings-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={audioSettingsStore.voiceEnhancement}
                                            onChange={(e) => {
                                                audioSettingsStore
                                                    .setVoiceEnhancement(e.target.checked)
                                                    .catch((enhancementError: unknown) => {
                                                        console.error(
                                                            'Error setting voice enhancement:',
                                                            enhancementError
                                                        );
                                                    });
                                            }}
                                        />
                                        <span className="checkmark" />
                                        <span className="checkbox-label">Улучшение голоса</span>
                                    </label>
                                </div>
                                <div className="setting-description">Дополнительные алгоритмы улучшения</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audio Effects Settings */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">✨</div>
                            <div className="header-text">
                                <h3>Аудио эффекты</h3>
                                <p>Дополнительные эффекты для улучшения звучания</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        {/* Voice Clarity */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Четкость голоса</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="slider-control">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={audioSettingsStore.voiceClarity * 100}
                                        onChange={(e) => {
                                            audioSettingsStore
                                                .setVoiceClarity(Number(e.target.value) / 100)
                                                .catch((clarityError: unknown) => {
                                                    console.error('Error setting voice clarity:', clarityError);
                                                });
                                        }}
                                        className="settings-slider"
                                    />
                                    <span className="slider-value">
                                        {Math.round(audioSettingsStore.voiceClarity * 100)}%
                                    </span>
                                </div>
                                <div className="setting-description">Улучшает разборчивость речи</div>
                            </div>
                        </div>

                        {/* Noise Reduction */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Снижение шума</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="slider-control">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={audioSettingsStore.backgroundNoiseReduction * 100}
                                        onChange={(e) => {
                                            audioSettingsStore
                                                .setBackgroundNoiseReduction(Number(e.target.value) / 100)
                                                .catch((reductionError: unknown) => {
                                                    console.error(
                                                        'Error setting background noise reduction:',
                                                        reductionError
                                                    );
                                                });
                                        }}
                                        className="settings-slider"
                                    />
                                    <span className="slider-value">
                                        {Math.round(audioSettingsStore.backgroundNoiseReduction * 100)}%
                                    </span>
                                </div>
                                <div className="setting-description">Убирает фоновые звуки</div>
                            </div>
                        </div>

                        {/* Voice Boost */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Усиление голоса</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="slider-control">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={audioSettingsStore.voiceBoost * 100}
                                        onChange={(e) => {
                                            handleVoiceBoostChange(Number(e.target.value) / 100);
                                        }}
                                        className="settings-slider"
                                    />
                                    <span className="slider-value">
                                        {Math.round(audioSettingsStore.voiceBoost * 100)}%
                                    </span>
                                </div>
                                <div className="setting-description">Усиливает голосовые частоты</div>
                            </div>
                        </div>

                        {/* Bass Boost */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Усиление басов</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="slider-control">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={audioSettingsStore.bassBoost * 100}
                                        onChange={(e) => {
                                            audioSettingsStore
                                                .setBassBoost(Number(e.target.value) / 100)
                                                .catch((bassError: unknown) => {
                                                    console.error('Error setting bass boost:', bassError);
                                                });
                                        }}
                                        className="settings-slider"
                                    />
                                    <span className="slider-value">
                                        {Math.round(audioSettingsStore.bassBoost * 100)}%
                                    </span>
                                </div>
                                <div className="setting-description">Усиливает низкие частоты</div>
                            </div>
                        </div>

                        {/* Treble Boost */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Усиление высоких частот</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="slider-control">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={audioSettingsStore.trebleBoost * 100}
                                        onChange={(e) => {
                                            handleTrebleBoostChange(Number(e.target.value) / 100);
                                        }}
                                        className="settings-slider"
                                    />
                                    <span className="slider-value">
                                        {Math.round(audioSettingsStore.trebleBoost * 100)}%
                                    </span>
                                </div>
                                <div className="setting-description">Усиливает высокие частоты</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quality Settings */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="header-content">
                            <div className="icon-container">⚙️</div>
                            <div className="header-text">
                                <h3>Качество звука</h3>
                                <p>Технические параметры и качество звука</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        {/* Quality Presets */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Качество звука</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="quality-presets">
                                    <button
                                        className={`preset-button ${audioSettingsStore.audioQuality === 'low' ? 'active' : ''}`}
                                        onClick={() => audioSettingsStore.setAudioQuality('low')}
                                    >
                                        <div className="preset-title">Низкое</div>
                                        <div className="preset-desc">Экономия трафика</div>
                                        <div className="preset-specs">16 кГц, 64 kbps</div>
                                    </button>
                                    <button
                                        className={`preset-button ${audioSettingsStore.audioQuality === 'medium' ? 'active' : ''}`}
                                        onClick={() => audioSettingsStore.setAudioQuality('medium')}
                                    >
                                        <div className="preset-title">Среднее</div>
                                        <div className="preset-desc">Оптимальный баланс</div>
                                        <div className="preset-specs">24 кГц, 128 kbps</div>
                                    </button>
                                    <button
                                        className={`preset-button ${audioSettingsStore.audioQuality === 'high' ? 'active' : ''}`}
                                        onClick={() => audioSettingsStore.setAudioQuality('high')}
                                    >
                                        <div className="preset-title">Высокое</div>
                                        <div className="preset-desc">Максимальное качество</div>
                                        <div className="preset-specs">48 кГц, 256 kbps</div>
                                    </button>
                                </div>
                                <div className="setting-description">Выберите подходящий уровень качества</div>
                            </div>
                        </div>

                        {/* Technical Parameters */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Технические параметры</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="advanced-controls">
                                    <div className="control-group">
                                        <label>Частота дискретизации</label>
                                        <select
                                            className="settings-select"
                                            value={audioSettingsStore.sampleRate}
                                            onChange={(e) => {
                                                audioSettingsStore
                                                    .setSampleRate(Number(e.target.value))
                                                    .catch((sampleRateError: unknown) => {
                                                        console.error('Error setting sample rate:', sampleRateError);
                                                    });
                                            }}
                                        >
                                            <option value={8000}>8 кГц</option>
                                            <option value={16000}>16 кГц</option>
                                            <option value={24000}>24 кГц</option>
                                            <option value={48000}>48 кГц</option>
                                        </select>
                                    </div>
                                    <div className="control-group">
                                        <label>Битрейт</label>
                                        <select
                                            className="settings-select"
                                            value={audioSettingsStore.bitrate}
                                            onChange={(e) => {
                                                audioSettingsStore
                                                    .setBitrate(Number(e.target.value))
                                                    .catch((bitrateError: unknown) => {
                                                        console.error('Error setting bitrate:', bitrateError);
                                                    });
                                            }}
                                        >
                                            <option value={64}>64 kbps</option>
                                            <option value={128}>128 kbps</option>
                                            <option value={256}>256 kbps</option>
                                            <option value={320}>320 kbps</option>
                                        </select>
                                    </div>
                                    <div className="control-group">
                                        <label>Задержка</label>
                                        <select
                                            className="settings-select"
                                            value={audioSettingsStore.latency}
                                            onChange={(e) => {
                                                audioSettingsStore.setLatency(Number(e.target.value));
                                            }}
                                        >
                                            <option value={50}>50 мс</option>
                                            <option value={100}>100 мс</option>
                                            <option value={200}>200 мс</option>
                                            <option value={500}>500 мс</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="setting-description">Детальные настройки качества</div>
                            </div>
                        </div>

                        {/* Reset Settings */}
                        <div className="setting-group">
                            <div className="setting-header">
                                <label className="setting-label">
                                    <span>Управление настройками</span>
                                </label>
                            </div>
                            <div className="setting-control">
                                <div className="button-group">
                                    <button
                                        className="settings-button settings-button--test"
                                        onClick={handleApplyAllSettings}
                                    >
                                        Применить настройки
                                    </button>
                                    <button
                                        className="settings-button settings-button--danger"
                                        onClick={handleResetToDefaults}
                                    >
                                        Сбросить настройки
                                    </button>
                                </div>
                                <div className="setting-description">
                                    Применить текущие настройки или вернуть к значениям по умолчанию
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AudioSettings;
