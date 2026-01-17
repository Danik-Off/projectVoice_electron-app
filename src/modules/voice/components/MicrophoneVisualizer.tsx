import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { audioSettingsStore } from '../../../core';
import './MicrophoneVisualizer.scss';

interface MicrophoneVisualizerProps {
    isActive?: boolean;
}

const MicrophoneVisualizer: React.FC<MicrophoneVisualizerProps> = observer(({ isActive = true }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isMonitoring, setIsMonitoring] = useState(false);

    const startMonitoring = async () => {
        if (!audioSettingsStore.stream || isMonitoring) {
            return;
        }

        try {
            // Проверяем, что поток активен и не заглушен
            const audioTracks = audioSettingsStore.stream.getAudioTracks();
            if (audioTracks.length === 0 || !audioTracks[0].enabled) {
                return;
            }

            const audioContext = new AudioContext({
                sampleRate: audioSettingsStore.sampleRate || 48000
            });

            // Убеждаемся, что контекст активен
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(audioSettingsStore.stream);

            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.8;
            analyser.minDecibels = -90;
            analyser.maxDecibels = -10;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            setIsMonitoring(true);

            visualize();
        } catch (error) {
            console.error('Error starting microphone visualization:', error);
            setIsMonitoring(false);
        }
    };

    const stopMonitoring = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = undefined;
        }
        setIsMonitoring(false);
        analyserRef.current = null;
        setAudioLevel(0);
        // Не закрываем контекст, так как он может использоваться другими компонентами
    };

    const visualize = () => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;

        if (!canvas || !analyser) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const width = canvas.width;
        const height = canvas.height;

        const draw = () => {
            if (!isMonitoring || !analyser) {
                return;
            }

            animationFrameRef.current = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);
            analyser.getByteTimeDomainData(dataArray);

            // Вычисляем средний уровень громкости из временной области
            let sum = 0;
            let max = 0;
            for (let i = 0; i < bufferLength; i++) {
                const value = Math.abs(dataArray[i] - 128) / 128;
                sum += value;
                max = Math.max(max, value);
            }
            // Используем комбинацию среднего и максимума для более точной визуализации
            const average = sum / bufferLength;
            const normalizedLevel = Math.min(average * 0.7 + max * 0.3, 1);
            setAudioLevel(normalizedLevel);

            // Очищаем canvas
            ctx.fillStyle = 'transparent';
            ctx.fillRect(0, 0, width, height);

            // Рисуем waveform
            ctx.lineWidth = 2;
            ctx.strokeStyle = getColorForLevel(normalizedLevel);
            ctx.shadowBlur = 10;
            ctx.shadowColor = getColorForLevel(normalizedLevel);
            ctx.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * height) / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(width, height / 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Рисуем level meter
            drawLevelMeter(ctx, normalizedLevel, width, height);
        };

        draw();
    };

    const getColorForLevel = (level: number): string => {
        if (level > 0.8) {
            return '#ff4444';
        } // Красный - слишком громко
        if (level > 0.6) {
            return '#ffaa00';
        } // Оранжевый - громко
        if (level > 0.3) {
            return '#44ff44';
        } // Зеленый - нормально
        return '#8888ff'; // Синий - тихо
    };

    useEffect(() => {
        const shouldMonitor =
            isActive &&
            audioSettingsStore.stream &&
            !audioSettingsStore.isMicrophoneMuted &&
            audioSettingsStore.stream.getAudioTracks().length > 0 &&
            audioSettingsStore.stream.getAudioTracks()[0].enabled;

        if (!shouldMonitor) {
            stopMonitoring();
            return;
        }

        startMonitoring();

        return () => {
            stopMonitoring();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, audioSettingsStore.stream, audioSettingsStore.isMicrophoneMuted]);

    const drawLevelMeter = (ctx: CanvasRenderingContext2D, level: number, width: number, height: number) => {
        const barWidth = 4;
        const barSpacing = 2;
        const barCount = 20;
        const totalBarWidth = (barWidth + barSpacing) * barCount - barSpacing;
        const startX = (width - totalBarWidth) / 2;
        const maxBarHeight = height * 0.6;

        for (let i = 0; i < barCount; i++) {
            const barIndex = i / barCount;
            const barLevel = Math.max(0, level - barIndex);
            const barHeight = barLevel * maxBarHeight;
            const x = startX + i * (barWidth + barSpacing);
            const y = height / 2 - barHeight / 2;

            // Цвет в зависимости от уровня
            let color = '#4a9eff';
            if (barIndex < 0.3) {
                color = level > 0.3 ? '#44ff44' : '#8888ff';
            } else if (barIndex < 0.6) {
                color = '#ffaa00';
            } else {
                color = '#ff4444';
            }

            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth, barHeight);
        }
    };

    return (
        <div className="microphone-visualizer">
            <div className="visualizer-container">
                <canvas ref={canvasRef} width={400} height={120} className="visualizer-canvas" />
                <div className="visualizer-info">
                    <div className="level-indicator">
                        <span className="level-label">Уровень:</span>
                        <div className="level-bar-container">
                            <div
                                className="level-bar"
                                style={{
                                    width: `${audioLevel * 100}%`,
                                    backgroundColor: getColorForLevel(audioLevel)
                                }}
                            />
                        </div>
                        <span className="level-value">{Math.round(audioLevel * 100)}%</span>
                    </div>
                    {audioLevel > 0.9 && (
                        <div className="warning-message">⚠️ Слишком громко! Уменьшите громкость микрофона</div>
                    )}
                    {audioLevel < 0.1 && audioSettingsStore.stream ? (
                        <div className="info-message">ℹ️ Микрофон не улавливает звук</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
});

export default MicrophoneVisualizer;
