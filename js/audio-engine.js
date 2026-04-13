class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.musicSource = null;
        this.musicGain = null;
        this.audioElement = null;
        this.isInitialized = false;
        this.binauralBeats = null;
    }

    // 初始化 AudioContext
    async init() {
        if (this.isInitialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // 创建音乐 GainNode
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = 0.8;
            this.musicGain.connect(this.audioContext.destination);

            // 创建音频元素用于播放音乐文件
            this.audioElement = new Audio();
            this.audioElement.loop = true;

            this.musicSource = this.audioContext.createMediaElementSource(this.audioElement);
            this.musicSource.connect(this.musicGain);

            this.isInitialized = true;
        } catch (e) {
            console.error('AudioContext init failed:', e);
            throw new Error('您的浏览器不支持 Web Audio API');
        }
    }

    // 加载音乐文件
    loadMusic(file) {
        if (!this.audioElement) throw new Error('AudioEngine 未初始化');
        const url = URL.createObjectURL(file);
        this.audioElement.src = url;
        return url;
    }

    // 从 IndexedDB 加载音乐
    loadMusicFromURL(url) {
        if (!this.audioElement) throw new Error('AudioEngine 未初始化');
        this.audioElement.src = url;
    }

    // 播放
    play() {
        if (this.audioContext?.state === 'suspended') {
            return this.audioContext.resume().then(() => {
                return this.audioElement?.play();
            });
        }
        return this.audioElement?.play();
    }

    // 暂停
    pause() {
        this.audioElement?.pause();
    }

    // 停止
    stop() {
        this.audioElement?.pause();
        this.audioElement.currentTime = 0;
    }

    // 设置音量 (0-1)
    setVolume(value) {
        if (this.musicGain) {
            this.musicGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }

    // 平滑渐变音量
    fadeVolume(targetValue, durationSeconds) {
        if (!this.musicGain || !this.audioContext) return;
        const now = this.audioContext.currentTime;
        this.musicGain.gain.linearRampToValueAtTime(targetValue, now + durationSeconds);
    }

    // 获取当前音量
    getVolume() {
        return this.musicGain?.gain.value || 0;
    }

    // 获取音频上下文时间
    getCurrentTime() {
        return this.audioContext?.currentTime || 0;
    }

    // 获取音频时长
    getDuration() {
        return this.audioElement?.duration || 0;
    }

    // 初始化双耳节拍
    initBinauralBeats() {
        if (!this.audioContext) throw new Error('AudioEngine 未初始化');
        this.binauralBeats = new BinauralBeats(this.audioContext, this.audioContext.destination);
    }

    // 开始双耳节拍
    async startBinauralBeats(baseFreq = 200, beatFreq = 4) {
        if (!this.binauralBeats) this.initBinauralBeats();

        // 确保 AudioContext 处于运行状态（iOS Safari 需要）
        if (this.audioContext?.state === 'suspended') {
            await this.audioContext.resume();
        }

        this.binauralBeats.setFrequency(baseFreq, beatFreq);
        this.binauralBeats.setVolume(0.5);
        this.binauralBeats.start();
    }

    // 渐变双耳节拍频率
    fadeBinauralBeats(targetBaseFreq, targetBeatFreq, durationSeconds) {
        if (this.binauralBeats) {
            this.binauralBeats.fadeBeatFrequency(targetBaseFreq, targetBeatFreq, durationSeconds);
        }
    }

    // 渐变双耳节拍音量
    fadeBinauralVolume(targetValue, durationSeconds) {
        if (this.binauralBeats) {
            this.binauralBeats.fadeVolume(targetValue, durationSeconds);
        }
    }

    // 销毁
    destroy() {
        this.audioElement?.pause();
        this.audioElement = null;
        if (this.binauralBeats) {
            this.binauralBeats.destroy();
            this.binauralBeats = null;
        }
        this.audioContext?.close();
        this.audioContext = null;
        this.isInitialized = false;
    }
}

window.audioEngine = new AudioEngine();
