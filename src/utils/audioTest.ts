/**
 * Утилиты для тестирования качества звука и аудио настроек
 */

export interface AudioQualityMetrics {
    latency: number;
    bitrate: number;
    sampleRate: number;
    signalToNoiseRatio: number;
    frequencyResponse: number[];
    distortionLevel: number;
    jitter: number;
}

export interface AudioTestResult {
    overallScore: number;
    metrics: AudioQualityMetrics;
    recommendations: string[];
    passed: boolean;
}

class AudioQualityTester {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStream | null = null;
    private testResults: AudioTestResult[] = [];

    /**
     * Инициализация тестера аудио качества
     */
    public async initialize(): Promise<void> {
        try {
            this.audioContext = new AudioContext({
                sampleRate: 48000,
                latencyHint: 'interactive'
            });
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            
            console.log('AudioQualityTester: Инициализирован');
        } catch (error) {
            console.error('AudioQualityTester: Ошибка инициализации:', error);
            throw error;
        }
    }

    /**
     * Тест базовых настроек по умолчанию
     */
    public async testDefaultSettings(): Promise<AudioTestResult> {
        console.log('AudioQualityTester: Тестирование базовых настроек...');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    sampleSize: 24,
                    channelCount: 2
                }
            });

            const metrics = await this.analyzeAudioStream(stream);
            const result = this.evaluateQuality(metrics, 'default');
            
            stream.getTracks().forEach(track => track.stop());
            return result;
        } catch (error) {
            console.error('AudioQualityTester: Ошибка тестирования базовых настроек:', error);
            throw error;
        }
    }

    /**
     * Тест высокого качества звука
     */
    public async testAudioQuality(): Promise<AudioTestResult> {
        console.log('AudioQualityTester: Тестирование высокого качества...');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    sampleSize: 32,
                    channelCount: 2,
                    latency: 0.01 // Минимальная задержка
                }
            });

            const metrics = await this.analyzeAudioStream(stream);
            const result = this.evaluateQuality(metrics, 'high');
            
            stream.getTracks().forEach(track => track.stop());
            return result;
        } catch (error) {
            console.error('AudioQualityTester: Ошибка тестирования высокого качества:', error);
            throw error;
        }
    }

    /**
     * Тест профессионального качества
     */
    public async testProfessionalQuality(): Promise<AudioTestResult> {
        console.log('AudioQualityTester: Тестирование профессионального качества...');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000,
                    sampleSize: 32,
                    channelCount: 2,
                    latency: 0.005, // Профессиональная задержка
                    volume: 1.0,
                    deviceId: { ideal: 'default' }
                }
            });

            const metrics = await this.analyzeAudioStream(stream);
            const result = this.evaluateQuality(metrics, 'professional');
            
            stream.getTracks().forEach(track => track.stop());
            return result;
        } catch (error) {
            console.error('AudioQualityTester: Ошибка тестирования профессионального качества:', error);
            throw error;
        }
    }

    /**
     * Анализ аудио потока и получение метрик качества
     */
    private async analyzeAudioStream(stream: MediaStream): Promise<AudioQualityMetrics> {
        if (!this.audioContext || !this.analyser) {
            throw new Error('AudioQualityTester не инициализирован');
        }

        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);

        // Получаем метрики качества
        const metrics: AudioQualityMetrics = {
            latency: await this.measureLatency(),
            bitrate: this.calculateBitrate(),
            sampleRate: this.audioContext.sampleRate,
            signalToNoiseRatio: await this.measureSNR(),
            frequencyResponse: await this.measureFrequencyResponse(),
            distortionLevel: await this.measureDistortion(),
            jitter: await this.measureJitter()
        };

        source.disconnect();
        return metrics;
    }

    /**
     * Измерение задержки аудио
     */
    private async measureLatency(): Promise<number> {
        if (!this.audioContext) return 0;
        
        const startTime = performance.now();
        const oscillator = this.audioContext.createOscillator();
        const analyser = this.audioContext.createAnalyser();
        
        oscillator.connect(analyser);
        analyser.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
        
        const endTime = performance.now();
        return endTime - startTime;
    }

    /**
     * Расчет битрейта
     */
    private calculateBitrate(): number {
        if (!this.audioContext) return 0;
        
        // Примерный расчет битрейта на основе настроек
        const sampleRate = this.audioContext.sampleRate;
        const bitDepth = 24; // Предполагаемая разрядность
        const channels = 2; // Стерео
        
        return (sampleRate * bitDepth * channels) / 1000; // kbps
    }

    /**
     * Измерение отношения сигнал/шум
     */
    private async measureSNR(): Promise<number> {
        if (!this.analyser) return 0;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        this.analyser.getByteFrequencyData(dataArray);
        
        // Простой расчет SNR
        let signalSum = 0;
        let noiseSum = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            if (i < bufferLength * 0.1) { // Низкие частоты - шум
                noiseSum += dataArray[i];
            } else { // Высокие частоты - сигнал
                signalSum += dataArray[i];
            }
        }
        
        return signalSum > 0 ? 20 * Math.log10(signalSum / noiseSum) : 0;
    }

    /**
     * Измерение частотной характеристики
     */
    private async measureFrequencyResponse(): Promise<number[]> {
        if (!this.analyser) return [];
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        this.analyser.getByteFrequencyData(dataArray);
        
        // Конвертируем в массив чисел
        return Array.from(dataArray);
    }

    /**
     * Измерение уровня искажений
     */
    private async measureDistortion(): Promise<number> {
        if (!this.analyser) return 0;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        this.analyser.getByteFrequencyData(dataArray);
        
        // Простой расчет искажений на основе гармоник
        let totalPower = 0;
        let harmonicPower = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            totalPower += dataArray[i];
            if (i % 2 === 0) { // Четные гармоники
                harmonicPower += dataArray[i];
            }
        }
        
        return totalPower > 0 ? (harmonicPower / totalPower) * 100 : 0;
    }

    /**
     * Измерение джиттера
     */
    private async measureJitter(): Promise<number> {
        if (!this.audioContext) return 0;
        
        const measurements: number[] = [];
        const numMeasurements = 10;
        
        for (let i = 0; i < numMeasurements; i++) {
            const startTime = performance.now();
            await new Promise(resolve => setTimeout(resolve, 1));
            const endTime = performance.now();
            measurements.push(endTime - startTime);
        }
        
        // Расчет стандартного отклонения как меры джиттера
        const mean = measurements.reduce((a, b) => a + b) / measurements.length;
        const variance = measurements.reduce((a, b) => a + Math.pow(b - mean, 2)) / measurements.length;
        
        return Math.sqrt(variance);
    }

    /**
     * Оценка качества на основе метрик
     */
    private evaluateQuality(metrics: AudioQualityMetrics, testType: string): AudioTestResult {
        let score = 0;
        const recommendations: string[] = [];
        
        // Оценка задержки (0-25 баллов)
        if (metrics.latency < 50) {
            score += 25;
        } else if (metrics.latency < 100) {
            score += 20;
        } else if (metrics.latency < 200) {
            score += 15;
        } else {
            score += 5;
            recommendations.push('Высокая задержка аудио. Рекомендуется уменьшить размер буфера.');
        }
        
        // Оценка битрейта (0-25 баллов)
        if (metrics.bitrate >= 256) {
            score += 25;
        } else if (metrics.bitrate >= 128) {
            score += 20;
        } else if (metrics.bitrate >= 64) {
            score += 15;
        } else {
            score += 5;
            recommendations.push('Низкий битрейт. Рекомендуется увеличить качество аудио.');
        }
        
        // Оценка SNR (0-25 баллов)
        if (metrics.signalToNoiseRatio > 20) {
            score += 25;
        } else if (metrics.signalToNoiseRatio > 15) {
            score += 20;
        } else if (metrics.signalToNoiseRatio > 10) {
            score += 15;
        } else {
            score += 5;
            recommendations.push('Низкое отношение сигнал/шум. Проверьте микрофон и окружение.');
        }
        
        // Оценка искажений (0-25 баллов)
        if (metrics.distortionLevel < 5) {
            score += 25;
        } else if (metrics.distortionLevel < 10) {
            score += 20;
        } else if (metrics.distortionLevel < 20) {
            score += 15;
        } else {
            score += 5;
            recommendations.push('Высокий уровень искажений. Проверьте настройки аудио.');
        }
        
        const result: AudioTestResult = {
            overallScore: score,
            metrics,
            recommendations,
            passed: score >= 80
        };
        
        console.log(`AudioQualityTester: Тест ${testType} завершен. Оценка: ${score}/100`);
        
        return result;
    }

    /**
     * Получение всех результатов тестов
     */
    public getTestResults(): AudioTestResult[] {
        return this.testResults;
    }

    /**
     * Очистка ресурсов
     */
    public cleanup(): void {
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.testResults = [];
    }
}

// Экспорт экземпляра для использования
export const audioTest = new AudioQualityTester();

// Экспорт функций для удобства использования
export const testDefaultSettings = () => audioTest.testDefaultSettings();
export const testAudioQuality = () => audioTest.testAudioQuality();
export const testProfessionalQuality = () => audioTest.testProfessionalQuality();
export const initializeAudioTest = () => audioTest.initialize();
export const cleanupAudioTest = () => audioTest.cleanup();