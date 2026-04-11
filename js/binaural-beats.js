class BinauralBeats {
    constructor(audioContext, destination) {
        this.audioContext = audioContext;
        this.destination = destination;

        // 左耳振荡器
        this.leftOscillator = null;
        this.leftGain = null;
        this.leftPanner = null;

        // 右耳振荡器
        this.rightOscillator = null;
        this.rightGain = null;
        this.rightPanner = null;

        // 混音器
        this.merger = null;

        this.isPlaying = false;
    }

    // 初始化音频节点
    init() {
        // 左声道
        this.leftOscillator = this.audioContext.createOscillator();
        this.leftGain = this.audioContext.createGain();
        this.leftPanner = this.audioContext.createStereoPanner();

        this.leftOscillator.type = 'sine';
        this.leftGain.gain.value = 0;
        this.leftPanner.pan.value = -1; // 左耳

        this.leftOscillator.connect(this.leftGain);
        this.leftGain.connect(this.leftPanner);
        this.leftPanner.connect(this.destination);

        // 右声道
        this.rightOscillator = this.audioContext.createOscillator();
        this.rightGain = this.audioContext.createGain();
        this.rightPanner = this.audioContext.createStereoPanner();

        this.rightOscillator.type = 'sine';
        this.rightGain.gain.value = 0;
        this.rightPanner.pan.value = 1; // 右耳

        this.rightOscillator.connect(this.rightGain);
        this.rightGain.connect(this.rightPanner);
        this.rightPanner.connect(this.destination);
    }

    // 设置基础频率和节拍频率
    setFrequency(baseFreq, beatFreq) {
        if (!this.leftOscillator || !this.rightOscillator) return;

        const leftFreq = baseFreq;
        const rightFreq = baseFreq + beatFreq;

        this.leftOscillator.frequency.setValueAtTime(leftFreq, this.audioContext.currentTime);
        this.rightOscillator.frequency.setValueAtTime(rightFreq, this.audioContext.currentTime);
    }

    // 平滑渐变到目标节拍频率
    fadeBeatFrequency(targetBaseFreq, targetBeatFreq, durationSeconds) {
        if (!this.leftOscillator || !this.rightOscillator) return;

        const now = this.audioContext.currentTime;
        const leftTarget = targetBaseFreq;
        const rightTarget = targetBaseFreq + targetBeatFreq;

        this.leftOscillator.frequency.linearRampToValueAtTime(leftTarget, now + durationSeconds);
        this.rightOscillator.frequency.linearRampToValueAtTime(rightTarget, now + durationSeconds);
    }

    // 设置音量
    setVolume(value) {
        if (this.leftGain && this.rightGain) {
            this.leftGain.gain.setValueAtTime(value, this.audioContext.currentTime);
            this.rightGain.gain.setValueAtTime(value, this.audioContext.currentTime);
        }
    }

    // 平滑渐变音量
    fadeVolume(targetValue, durationSeconds) {
        if (!this.leftGain || !this.rightGain) return;
        const now = this.audioContext.currentTime;
        this.leftGain.gain.linearRampToValueAtTime(targetValue, now + durationSeconds);
        this.rightGain.gain.linearRampToValueAtTime(targetValue, now + durationSeconds);
    }

    // 开始播放
    start() {
        if (this.isPlaying) return;
        if (!this.leftOscillator) this.init();

        this.leftOscillator.start();
        this.rightOscillator.start();
        this.isPlaying = true;
    }

    // 停止播放
    stop() {
        if (!this.isPlaying) return;
        this.leftOscillator?.stop();
        this.rightOscillator?.stop();
        this.isPlaying = false;
    }

    // 销毁
    destroy() {
        this.stop();
        this.leftOscillator = null;
        this.rightOscillator = null;
        this.leftGain = null;
        this.rightGain = null;
        this.leftPanner = null;
        this.rightPanner = null;
    }
}

window.BinauralBeats = BinauralBeats;
