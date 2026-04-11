class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
            this.deferredPrompt = null;
        });
    }

    showInstallButton() {
        // 创建安装按钮 DOM
        const btn = document.createElement('button');
        btn.id = 'install-btn';
        btn.className = 'btn btn-primary';
        btn.textContent = '安装应用';
        btn.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);z-index:1000;';
        btn.onclick = () => this.install();
        document.body.appendChild(btn);
    }

    hideInstallButton() {
        const btn = document.getElementById('install-btn');
        if (btn) btn.remove();
    }

    async install() {
        if (!this.deferredPrompt) return;
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            this.hideInstallButton();
        }
        this.deferredPrompt = null;
    }
}

class SessionController {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.totalDuration = 30 * 60; // 默认 30 分钟
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pausedTime = 0;
        this.remainingTime = 0;
        this.animationFrameId = null;
        this.onProgressUpdate = null;
        this.onPhaseChange = null;

        // 三阶段配置
        this.phases = [
            { name: '引导阶段', startRatio: 0, endRatio: 0.15, volumeStart: 0.8, volumeEnd: 0.5, beatFreqStart: 6, beatFreqEnd: 2 },
            { name: '深睡阶段', startRatio: 0.15, endRatio: 0.85, volumeStart: 0.5, volumeEnd: 0.2, beatFreqStart: 2, beatFreqEnd: 1 },
            { name: '唤醒阶段', startRatio: 0.85, endRatio: 1.0, volumeStart: 0.2, volumeEnd: 0.8, beatFreqStart: 1, beatFreqEnd: 10 }
        ];

        this.currentPhaseIndex = -1;
    }

    // 设置总时长（秒）
    setDuration(minutes) {
        this.totalDuration = minutes * 60;
    }

    // 开始会话
    async start() {
        if (this.isRunning) return;

        await this.audioEngine.init();
        if (this.audioEngine.binauralBeats) {
            this.audioEngine.binauralBeats.destroy();
        }

        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.currentPhaseIndex = -1;

        this.audioEngine.startBinauralBeats(200, 6);
        if (this.audioEngine.audioElement?.src) {
            this.audioEngine.audioElement.play();
        }

        this.tick();
    }

    // 暂停
    pause() {
        if (!this.isRunning || this.isPaused) return;
        this.isPaused = true;
        this.pausedTime = Date.now();
        this.audioEngine.pause();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    // 恢复
    resume() {
        if (!this.isRunning || !this.isPaused) return;
        this.isPaused = false;
        const pauseDuration = Date.now() - this.pausedTime;
        this.startTime += pauseDuration;
        this.audioEngine.play();
        this.tick();
    }

    // 停止
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentPhaseIndex = -1;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.audioEngine.stop();
        this.audioEngine.fadeBinauralVolume(0, 1);
    }

    // 获取当前进度
    getProgress() {
        if (!this.isRunning) return { ratio: 0, remaining: this.totalDuration, phase: null };
        const elapsed = (Date.now() - this.startTime) / 1000;
        const ratio = Math.min(1, elapsed / this.totalDuration);
        const remaining = Math.max(0, this.totalDuration - elapsed);
        const phase = this.getCurrentPhase(ratio);
        return { ratio, remaining, phase };
    }

    // 获取当前阶段
    getCurrentPhase(ratio) {
        for (let i = 0; i < this.phases.length; i++) {
            const phase = this.phases[i];
            if (ratio >= phase.startRatio && ratio < phase.endRatio) {
                return { index: i, config: phase };
            }
        }
        return { index: this.phases.length - 1, config: this.phases[this.phases.length - 1] };
    }

    // 动画循环
    tick() {
        if (!this.isRunning || this.isPaused) return;

        const { ratio, remaining, phase } = this.getProgress();

        // 检查阶段变化
        if (phase.index !== this.currentPhaseIndex) {
            this.currentPhaseIndex = phase.index;
            this.onPhaseChange?.(phase);
        }

        // 更新音频参数
        this.updateAudioForRatio(ratio);

        // 通知 UI 更新
        this.onProgressUpdate?.({ ratio, remaining, phase });

        // 检查是否结束
        if (ratio >= 1) {
            this.stop();
            return;
        }

        this.animationFrameId = requestAnimationFrame(() => this.tick());
    }

    // 根据进度更新音频
    updateAudioForRatio(ratio) {
        const phase = this.getCurrentPhase(ratio);
        const phaseConfig = phase.config;

        // 计算在当前阶段内的进度
        const phaseDuration = phaseConfig.endRatio - phaseConfig.startRatio;
        const phaseProgress = (ratio - phaseConfig.startRatio) / phaseDuration;

        // 计算当前阶段的音量
        const volume = phaseConfig.volumeStart + (phaseConfig.volumeEnd - phaseConfig.volumeStart) * phaseProgress;

        // 计算当前阶段的节拍频率
        const beatFreq = phaseConfig.beatFreqStart + (phaseConfig.beatFreqEnd - phaseConfig.beatFreqStart) * phaseProgress;

        // 应用到音频引擎
        this.audioEngine.setVolume(volume);
        this.audioEngine.fadeBinauralBeats(200, beatFreq, 1);
    }
}

window.SessionController = SessionController;

class SleepAidApp {
    constructor() {
        this.sceneManager = null;
        this.sessionController = null;
        this.currentScene = 'starryNight';
        this.init();
    }

    async init() {
        // 初始化存储
        await storage.init();

        // 初始化场景管理器
        const canvas = document.getElementById('scene-canvas');
        this.sceneManager = new SceneManager(canvas);

        // 注册场景
        this.sceneManager.register('starryNight', StarryNightScene);
        this.sceneManager.register('beach', BeachScene);
        this.sceneManager.register('forest', ForestScene);
        this.sceneManager.register('flowerField', FlowerFieldScene);

        // 切换到默认场景
        this.sceneManager.switch(this.currentScene);

        // 初始化会话控制器
        this.sessionController = new SessionController(audioEngine);

        // 绑定事件
        this.bindEvents();

        // 加载保存的设置
        this.loadSettings();

        // 初始化 PWA
        window.pwaInstaller = new PWAInstaller();

        // 初始化高级面板滑动
        this.initAdvancedPanel();
    }

    bindEvents() {
        // 场景选择
        document.querySelectorAll('.scene-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentScene = btn.dataset.scene;
                this.sceneManager.switch(this.currentScene);
                storage.setSetting('scene', this.currentScene);
            });
        });

        // 时长滑块
        const durationSlider = document.getElementById('duration-slider');
        const durationValue = document.getElementById('duration-value');
        durationSlider.addEventListener('input', () => {
            durationValue.textContent = durationSlider.value;
            this.sessionController.setDuration(parseInt(durationSlider.value));
        });

        // 音乐文件选择
        const musicInput = document.getElementById('music-input');
        const musicName = document.getElementById('music-name');
        musicInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                musicName.textContent = file.name;
                await audioEngine.init();
                const url = audioEngine.loadMusic(file);
                // 保存到 IndexedDB
                await storage.saveMusicFile(file.name, file);
                storage.setSetting('musicFile', { name: file.name, url });
            }
        });

        // 双耳节拍设置
        const baseFreqSlider = document.getElementById('base-freq');
        const baseFreqValue = document.getElementById('base-freq-value');
        baseFreqSlider.addEventListener('input', () => {
            baseFreqValue.textContent = `${baseFreqSlider.value} Hz`;
            storage.setSetting('baseFreq', parseInt(baseFreqSlider.value));
        });

        const beatFreqSlider = document.getElementById('beat-freq');
        const beatFreqValue = document.getElementById('beat-freq-value');
        beatFreqSlider.addEventListener('input', () => {
            beatFreqValue.textContent = `${beatFreqSlider.value} Hz`;
            storage.setSetting('beatFreq', parseFloat(beatFreqSlider.value));
        });

        // 可折叠面板切换
        const binauralPanel = document.getElementById('binaural-panel');
        binauralPanel.querySelector('.panel-header').addEventListener('click', () => {
            binauralPanel.classList.toggle('open');
        });

        // 开始按钮
        document.getElementById('start-btn').addEventListener('click', () => this.startSession());

        // 暂停/停止按钮
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopSession());

        // 会话进度更新
        this.sessionController.onProgressUpdate = (data) => this.updateSessionUI(data);
        this.sessionController.onPhaseChange = (data) => this.onPhaseChange(data);
    }

    initAdvancedPanel() {
        const panel = document.getElementById('advanced-panel');
        let startY = 0;

        panel.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        panel.addEventListener('touchmove', (e) => {
            const deltaY = startY - e.touches[0].clientY;
            if (deltaY > 50) {
                panel.classList.add('open');
            } else if (deltaY < -50) {
                panel.classList.remove('open');
            }
        });
    }

    loadSettings() {
        const scene = storage.getSetting('scene', 'starryNight');
        const duration = storage.getSetting('duration', 30);
        const baseFreq = storage.getSetting('baseFreq', 200);
        const beatFreq = storage.getSetting('beatFreq', 4);

        // 恢复场景
        this.currentScene = scene;
        document.querySelectorAll('.scene-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scene === scene);
        });
        this.sceneManager.switch(scene);

        // 恢复时长
        document.getElementById('duration-slider').value = duration;
        document.getElementById('duration-value').textContent = duration;
        this.sessionController.setDuration(duration);

        // 恢复双耳节拍设置
        document.getElementById('base-freq').value = baseFreq;
        document.getElementById('base-freq-value').textContent = `${baseFreq} Hz`;
        document.getElementById('beat-freq').value = beatFreq;
        document.getElementById('beat-freq-value').textContent = `${beatFreq} Hz`;

        // 恢复音乐文件
        this.loadSavedMusic();
    }

    async loadSavedMusic() {
        const saved = storage.getSetting('musicFile');
        if (saved?.url) {
            try {
                await audioEngine.init();
                audioEngine.loadMusicFromURL(saved.url);
                document.getElementById('music-name').textContent = saved.name;
            } catch (e) {
                console.error('Failed to load saved music:', e);
            }
        }
    }

    startSession() {
        document.getElementById('setup-view').classList.add('hidden');
        document.getElementById('session-view').classList.remove('hidden');
        this.sessionController.start();
    }

    togglePause() {
        if (this.sessionController.isPaused) {
            this.sessionController.resume();
            document.getElementById('pause-btn').textContent = '暂停';
        } else {
            this.sessionController.pause();
            document.getElementById('pause-btn').textContent = '继续';
        }
    }

    stopSession() {
        this.sessionController.stop();
        document.getElementById('session-view').classList.add('hidden');
        document.getElementById('setup-view').classList.remove('hidden');
        document.getElementById('pause-btn').textContent = '暂停';
    }

    updateSessionUI(data) {
        const minutes = Math.floor(data.remaining / 60);
        const seconds = Math.floor(data.remaining % 60);
        document.getElementById('time-remaining').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('progress-fill').style.width = `${data.ratio * 100}%`;
        document.getElementById('current-beat').textContent =
            data.phase?.config?.beatFreqStart?.toFixed(1) || '4';
    }

    onPhaseChange(data) {
        const phaseNames = ['引导阶段', '深睡阶段', '唤醒阶段'];
        document.getElementById('phase-name').textContent = phaseNames[data.index] || '';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SleepAidApp();
});

// 页面可见性监听
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.sessionController?.isRunning) {
        // 页面隐藏时暂停
        window.sessionController.pause();
    }
});
