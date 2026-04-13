class VideoBackgroundManager {
    constructor() {
        this.video = document.getElementById('bg-video');
        this.videoContainer = document.getElementById('video-container');
        this.sceneContainer = document.getElementById('scene-container');
        this.isPlaying = false;
        this.currentURL = null;
        this.isLoaded = false;
    }

    // 加载视频文件
    loadVideo(file) {
        if (!file) return;

        // 如果已有视频URL，释放旧对象
        if (this.currentURL) {
            URL.revokeObjectURL(this.currentURL);
        }

        this.currentURL = URL.createObjectURL(file);
        this.video.src = this.currentURL;
        this.isLoaded = false;

        // 隐藏 Canvas 场景
        this.sceneContainer.style.opacity = '0';

        // 视频加载完成后自动播放
        this.video.oncanplay = () => {
            this.isLoaded = true;
            this.videoContainer.style.opacity = '1';
            this.play();
        };

        this.video.load();
        this.isPlaying = true;
    }

    // 从URL加载视频
    loadVideoFromURL(url) {
        this.currentURL = url;
        this.video.src = url;
        this.isLoaded = false;

        // 隐藏 Canvas 场景
        this.sceneContainer.style.opacity = '0';

        this.video.oncanplay = () => {
            this.isLoaded = true;
            this.videoContainer.style.opacity = '1';
            this.play();
        };

        this.video.load();
        this.isPlaying = true;
    }

    // 播放
    play() {
        if (this.video.src) {
            this.video.play().catch(e => console.warn('Video play failed:', e));
            this.isPlaying = true;
        }
    }

    // 暂停
    pause() {
        if (this.isPlaying) {
            this.video.pause();
            this.isPlaying = false;
        }
    }

    // 切换播放/暂停
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
        return this.isPlaying;
    }

    // 移除视频
    remove() {
        this.video.pause();
        this.video.src = '';
        this.videoContainer.style.opacity = '0';
        // 恢复 Canvas 场景显示
        this.sceneContainer.style.opacity = '1';
        if (this.currentURL) {
            URL.revokeObjectURL(this.currentURL);
            this.currentURL = null;
        }
        this.isPlaying = false;
        this.isLoaded = false;
    }

    // 是否有视频
    hasVideo() {
        return !!this.video.src && this.isLoaded;
    }

    // 获取播放状态
    getIsPlaying() {
        return this.isPlaying;
    }
}

window.VideoBackgroundManager = VideoBackgroundManager;

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
        this.sleepMode = 'night'; // 'night' 或 'nap'

        // 晚间模式配置（四阶段）
        // Alpha波(8-12Hz)引导放松，Theta波(4-8Hz)浅睡，Delta波(0.5-4Hz)深睡，Beta波(15-30Hz)唤醒
        this.nightPhases = [
            { name: '引导阶段 α波', startRatio: 0, endRatio: 0.1, volumeStart: 0.8, volumeEnd: 0.6, beatFreqStart: 10, beatFreqEnd: 10, binauralVolumeStart: 0.15, binauralVolumeEnd: 0.12 },
            { name: '浅睡阶段 θ波', startRatio: 0.1, endRatio: 0.4, volumeStart: 0.6, volumeEnd: 0.4, beatFreqStart: 6, beatFreqEnd: 6, binauralVolumeStart: 0.12, binauralVolumeEnd: 0.1 },
            { name: '深睡阶段 δ波', startRatio: 0.4, endRatio: 0.85, volumeStart: 0.4, volumeEnd: 0.2, beatFreqStart: 2, beatFreqEnd: 2, binauralVolumeStart: 0.1, binauralVolumeEnd: 0.08 },
            { name: '唤醒阶段 β波', startRatio: 0.85, endRatio: 1.0, volumeStart: 0.2, volumeEnd: 0.8, beatFreqStart: 15, beatFreqEnd: 15, binauralVolumeStart: 0.08, binauralVolumeEnd: 0.15 }
        ];

        // 午休模式配置（三阶段，无唤醒，结束时直接停止）
        this.napPhases = [
            { name: '引导阶段 α波', startRatio: 0, endRatio: 0.15, volumeStart: 0.8, volumeEnd: 0.6, beatFreqStart: 10, beatFreqEnd: 10, binauralVolumeStart: 0.15, binauralVolumeEnd: 0.12 },
            { name: '浅睡阶段 θ波', startRatio: 0.15, endRatio: 0.6, volumeStart: 0.6, volumeEnd: 0.4, beatFreqStart: 6, beatFreqEnd: 6, binauralVolumeStart: 0.12, binauralVolumeEnd: 0.1 },
            { name: '深睡阶段 δ波', startRatio: 0.6, endRatio: 1.0, volumeStart: 0.4, volumeEnd: 0.2, beatFreqStart: 2, beatFreqEnd: 2, binauralVolumeStart: 0.1, binauralVolumeEnd: 0.08 }
        ];

        this.currentPhaseIndex = -1;
        this.phases = this.getPhases();
    }

    // 设置总时长（秒）
    setDuration(minutes) {
        this.totalDuration = minutes * 60;
    }

    // 根据模式获取对应的阶段配置
    getPhases() {
        return this.sleepMode === 'nap' ? this.napPhases : this.nightPhases;
    }

    // 设置睡眠模式
    setMode(mode) {
        this.sleepMode = mode;
        this.phases = this.getPhases();
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

        const baseFreq = parseInt(document.getElementById('base-freq').value);
        const beatFreq = parseFloat(document.getElementById('beat-freq').value);
        this.baseFreq = baseFreq;
        this.audioEngine.startBinauralBeats(baseFreq, beatFreq);
        if (this.audioEngine.audioElement?.src) {
            this.audioEngine.audioElement.play();
        }

        // 同步视频播放
        if (window.videoManager?.hasVideo()) {
            window.videoManager.play();
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
        // 暂停视频
        if (window.videoManager?.hasVideo()) {
            window.videoManager.pause();
        }
    }

    // 恢复
    resume() {
        if (!this.isRunning || !this.isPaused) return;
        this.isPaused = false;
        const pauseDuration = Date.now() - this.pausedTime;
        this.startTime += pauseDuration;
        this.audioEngine.play();
        // 恢复视频播放
        if (window.videoManager?.hasVideo()) {
            window.videoManager.play();
        }
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
        // 停止视频
        if (window.videoManager?.hasVideo()) {
            window.videoManager.pause();
        }
    }

    // 获取当前进度
    getProgress() {
        if (!this.isRunning) return { ratio: 0, remaining: this.totalDuration, phase: null, currentBeatFreq: 0 };
        const elapsed = (Date.now() - this.startTime) / 1000;
        const ratio = Math.min(1, elapsed / this.totalDuration);
        const remaining = Math.max(0, this.totalDuration - elapsed);
        const phase = this.getCurrentPhase(ratio);

        // 计算当前节拍频率
        const phaseConfig = phase.config;
        const phaseDuration = phaseConfig.endRatio - phaseConfig.startRatio;
        const phaseProgress = (ratio - phaseConfig.startRatio) / phaseDuration;
        const currentBeatFreq = phaseConfig.beatFreqStart + (phaseConfig.beatFreqEnd - phaseConfig.beatFreqStart) * phaseProgress;

        return { ratio, remaining, phase, currentBeatFreq };
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

        const { ratio, remaining, phase, currentBeatFreq } = this.getProgress();

        // 检查阶段变化
        if (phase.index !== this.currentPhaseIndex) {
            this.currentPhaseIndex = phase.index;
            this.onPhaseChange?.(phase);
        }

        // 更新音频参数
        this.updateAudioForRatio(ratio);

        // 通知 UI 更新
        this.onProgressUpdate?.({ ratio, remaining, phase, currentBeatFreq });

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

        // 计算当前阶段的背景音乐音量
        const volume = phaseConfig.volumeStart + (phaseConfig.volumeEnd - phaseConfig.volumeStart) * phaseProgress;

        // 计算当前阶段的节拍频率
        const beatFreq = phaseConfig.beatFreqStart + (phaseConfig.beatFreqEnd - phaseConfig.beatFreqStart) * phaseProgress;

        // 计算当前阶段的双幻节拍音量
        const binauralVolume = phaseConfig.binauralVolumeStart + (phaseConfig.binauralVolumeEnd - phaseConfig.binauralVolumeStart) * phaseProgress;

        // 应用到音频引擎
        this.audioEngine.setVolume(volume);
        this.audioEngine.fadeBinauralBeats(this.baseFreq, beatFreq, 1);
        this.audioEngine.fadeBinauralVolume(binauralVolume, 1);
    }

    // 播放阶段切换提示音
    playPhaseTransitionSound() {
        if (!this.audioEngine?.audioContext) return;

        const ctx = this.audioEngine.audioContext;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.frequency.value = 528; // 舒曼共振频率
        oscillator.type = 'sine';
        gain.gain.value = 0;

        const now = ctx.currentTime;
        gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);

        oscillator.start(now);
        oscillator.stop(now + 0.5);
    }
}

window.SessionController = SessionController;

class SleepAidApp {
    constructor() {
        this.sceneManager = null;
        this.sessionController = null;
        this.videoManager = null;
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

        // 初始化视频背景管理器
        this.videoManager = new VideoBackgroundManager();

        // 初始化会话控制器
        this.sessionController = new SessionController(audioEngine);

        // iOS Safari 要求首次用户交互后才能创建 AudioContext
        // 在用户首次点击/触摸时预初始化 AudioContext
        const initAudioOnInteraction = () => {
            audioEngine.init().catch(console.warn);
            document.removeEventListener('touchstart', initAudioOnInteraction);
            document.removeEventListener('click', initAudioOnInteraction);
        };
        document.addEventListener('touchstart', initAudioOnInteraction, { once: true, passive: true });
        document.addEventListener('click', initAudioOnInteraction, { once: true, passive: true });

        // 绑定事件
        this.bindEvents();

        // 加载保存的设置
        this.loadSettings();

        // 初始化 PWA
        window.pwaInstaller = new PWAInstaller();

        // 初始化高级面板滑动
        this.initAdvancedPanel();

        // 将视频管理器暴露到 window 上以便 SessionController 访问
        window.videoManager = this.videoManager;
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

        // 睡眠模式选择
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setMode(btn.dataset.mode);
                storage.setSetting('sleepMode', btn.dataset.mode);
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

        // 视频文件选择
        const videoInput = document.getElementById('video-input');
        const videoName = document.getElementById('video-name');
        const videoControls = document.getElementById('video-controls');
        const videoToggleBtn = document.getElementById('video-toggle-btn');
        const videoRemoveBtn = document.getElementById('video-remove-btn');

        videoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                videoName.textContent = file.name;
                this.videoManager.loadVideo(file);
                videoControls.classList.remove('hidden');
                // 保存到 IndexedDB
                await storage.saveVideoFile(file.name, file);
                storage.setSetting('videoFile', { name: file.name });
            }
        });

        // 视频播放/暂停
        videoToggleBtn.addEventListener('click', () => {
            const isPlaying = this.videoManager.toggle();
            videoToggleBtn.textContent = isPlaying ? '暂停视频' : '播放视频';
        });

        // 移除视频
        videoRemoveBtn.addEventListener('click', () => {
            this.videoManager.remove();
            videoName.textContent = '点击选择视频文件（可选）';
            videoControls.classList.add('hidden');
            videoInput.value = '';
            storage.removeSetting('videoFile');
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
        const sleepMode = storage.getSetting('sleepMode', 'night');

        // 恢复场景
        this.currentScene = scene;
        document.querySelectorAll('.scene-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scene === scene);
        });
        this.sceneManager.switch(scene);

        // 恢复睡眠模式
        this.sessionController.setMode(sleepMode);
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === sleepMode);
        });

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

        // 恢复视频文件
        this.loadSavedVideo();
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

    async loadSavedVideo() {
        const saved = storage.getSetting('videoFile');
        if (saved?.name) {
            try {
                const videoData = await storage.getVideoFile(saved.name);
                if (videoData?.blob) {
                    this.videoManager.loadVideo(videoData.blob);
                    document.getElementById('video-name').textContent = saved.name;
                    document.getElementById('video-controls').classList.remove('hidden');
                }
            } catch (e) {
                console.error('Failed to load saved video:', e);
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
            (data.currentBeatFreq ?? 4).toFixed(1);
    }

    onPhaseChange(data) {
        document.getElementById('phase-name').textContent = data.config?.name || '';
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
