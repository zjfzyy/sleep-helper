# 助眠苹果手机版 — 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans 来逐步实施此计划。

**目标**：构建一个 PWA 助眠应用，实现三阶段音频会话 + 双耳节拍 + 四个场景动画

**架构**：纯前端 PWA，Web Audio API 处理音频，Canvas/CSS 处理动画，无后端依赖

**技术栈**：HTML5 + CSS3 + 原生 JavaScript + Web Audio API + Canvas 2D

---

## 实施顺序

| 阶段 | 任务数 | 说明 |
|------|--------|------|
| 阶段一：基础设施 | 5 个 | 项目脚手架、PWA 配置、Service Worker |
| 阶段二：存储层 | 2 个 | localStorage + IndexedDB 封装 |
| 阶段三：音频核心 | 4 个 | 音频引擎 + 双耳节拍生成器 |
| 阶段四：会话引擎 | 2 个 | 三阶段睡眠会话控制器 |
| 阶段五：场景动画 | 5 个 | 四个场景 + 场景管理器 |
| 阶段六：UI 界面 | 3 个 | 主界面 + 运行界面 + PWA 安装 |
| 阶段七：整合测试 | 2 个 | 手动功能测试 + 跨浏览器兼容性 |

---

## 阶段一：基础设施

### Task 1: 创建项目目录结构

**Files:**
- 创建: `E:/助眠苹果手机版/index.html`
- 创建: `E:/助眠苹果手机版/css/styles.css`
- 创建: `E:/助眠苹果手机版/js/app.js`
- 创建: `E:/助眠苹果手机版/js/storage.js`
- 创建: `E:/助眠苹果手机版/js/audio-engine.js`
- 创建: `E:/助眠苹果手机版/js/binaural-beats.js`
- 创建: `E:/助眠苹果手机版/js/scene-manager.js`
- 创建: `E:/助眠苹果手机版/manifest.json`
- 创建: `E:/助眠苹果手机版/sw.js`
- 创建: `E:/助眠苹果手机版/assets/icons/icon-192.png`
- 创建: `E:/助眠苹果手机版/assets/icons/icon-512.png`

**Step 1: 创建目录结构**

```bash
mkdir -p "E:/助眠苹果手机版/css"
mkdir -p "E:/助眠苹果手机版/js"
mkdir -p "E:/助眠苹果手机版/assets/icons"
```

**Step 2: 创建 index.html 基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#0a0a1a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>助眠</title>
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div id="app"></div>
    <script src="js/storage.js"></script>
    <script src="js/audio-engine.js"></script>
    <script src="js/binaural-beats.js"></script>
    <script src="js/scene-manager.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

**Step 3: 创建 manifest.json**

```json
{
  "name": "助眠",
  "short_name": "助眠",
  "description": "三阶段助眠应用，伴你入睡与唤醒",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a1a",
  "theme_color": "#0a0a1a",
  "orientation": "portrait",
  "icons": [
    {
      "src": "assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Step 4: 提交**

```bash
git add index.html manifest.json css/ js/ assets/
git commit -m "feat: 创建项目基础结构"
```

---

### Task 2: 创建基础 CSS 样式

**Files:**
- 修改: `E:/助眠苹果手机版/css/styles.css`

**Step 1: 创建基础样式**

```css
/* 基础重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #0a0a1a;
    color: #fff;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
}

/* 全屏场景容器 */
#scene-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

#scene-canvas {
    width: 100%;
    height: 100%;
}

/* 内容层 */
#content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
}

/* 隐藏状态 */
.hidden {
    display: none !important;
}

/* 滑块样式 */
input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.2);
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 按钮样式 */
.btn {
    padding: 16px 32px;
    border: none;
    border-radius: 30px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: rgba(255, 255, 255, 0.9);
    color: #0a0a1a;
}

.btn-primary:active {
    transform: scale(0.95);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
}

/* 面板样式 */
.panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 16px;
}

/* 标题样式 */
.panel-title {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
}
```

**Step 2: 提交**

```bash
git add css/styles.css
git commit -m "feat: 添加基础 CSS 样式"
```

---

### Task 3: 创建 Service Worker

**Files:**
- 修改: `E:/助眠苹果手机版/sw.js`

**Step 1: 创建 Service Worker**

```javascript
const CACHE_NAME = 'sleep-aid-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/storage.js',
    '/js/audio-engine.js',
    '/js/binaural-beats.js',
    '/js/scene-manager.js',
    '/js/app.js',
    '/manifest.json'
];

// 安装阶段：缓存资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// 请求拦截：优先缓存，失败则网络
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseClone));
                        return response;
                    });
            })
    );
});
```

**Step 2: 提交**

```bash
git add sw.js
git commit -m "feat: 添加 Service Worker 实现离线缓存"
```

---

### Task 4: 在 index.html 中注册 Service Worker

**Files:**
- 修改: `E:/助眠苹果手机版/index.html`

**Step 1: 添加 Service Worker 注册代码**

在 `</body>` 前添加：

```html
<script>
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((reg) => console.log('SW registered:', reg.scope))
                .catch((err) => console.error('SW registration failed:', err));
        });
    }
</script>
```

**Step 2: 提交**

```bash
git add index.html
git commit -m "feat: 注册 Service Worker"
```

---

### Task 5: 创建 PWA 安装提示

**Files:**
- 修改: `E:/助眠苹果手机版/js/app.js`
- 修改: `E:/助眠苹果手机版/css/styles.css`

**Step 1: 添加安装提示 UI**

在 `app.js` 中添加：

```javascript
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
```

**Step 2: 提交**

```bash
git add js/app.js css/styles.css
git commit -m "feat: 添加 PWA 安装提示功能"
```

---

## 阶段二：存储层

### Task 6: 创建 localStorage + IndexedDB 封装

**Files:**
- 修改: `E:/助眠苹果手机版/js/storage.js`

**Step 1: 实现存储模块**

```javascript
class Storage {
    constructor() {
        this.dbName = 'SleepAidDB';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    // 初始化 IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('musicFiles')) {
                    db.createObjectStore('musicFiles', { keyPath: 'name' });
                }
            };
        });
    }

    // localStorage 操作
    setSetting(key, value) {
        localStorage.setItem(`sleepaid_${key}`, JSON.stringify(value));
    }

    getSetting(key, defaultValue = null) {
        const item = localStorage.getItem(`sleepaid_${key}`);
        return item ? JSON.parse(item) : defaultValue;
    }

    // IndexedDB 操作：保存音乐文件
    async saveMusicFile(name, blob) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['musicFiles'], 'readwrite');
            const store = transaction.objectStore('musicFiles');
            const request = store.put({ name, blob, timestamp: Date.now() });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getMusicFile(name) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['musicFiles'], 'readonly');
            const store = transaction.objectStore('musicFiles');
            const request = store.get(name);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async listMusicFiles() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['musicFiles'], 'readonly');
            const store = transaction.objectStore('musicFiles');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteMusicFile(name) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['musicFiles'], 'readwrite');
            const store = transaction.objectStore('musicFiles');
            const request = store.delete(name);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// 导出单例
window.storage = new Storage();
```

**Step 2: 提交**

```bash
git add js/storage.js
git commit -m "feat: 实现存储模块 (localStorage + IndexedDB)"
```

---

### Task 7: 测试存储模块

**Step 1: 在浏览器控制台测试**

打开 `index.html`，按 F12 打开控制台，输入：

```javascript
// 测试 localStorage
storage.setSetting('test', 'hello');
console.log(storage.getSetting('test')); // 应输出 "hello"

// 测试 IndexedDB（需等待 init 完成）
setTimeout(async () => {
    await storage.saveMusicFile('test.mp3', new Blob(['test'], {type: 'audio/mp3'}));
    const file = await storage.getMusicFile('test.mp3');
    console.log('File saved:', file);
}, 100);
```

**Step 2: 提交**

```bash
git add js/storage.js
git commit -m "test: 存储模块手动测试"
```

---

## 阶段三：音频核心

### Task 8: 创建音频引擎基础

**Files:**
- 修改: `E:/助眠苹果手机版/js/audio-engine.js`

**Step 1: 实现基础音频引擎**

```javascript
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.musicSource = null;
        this.musicGain = null;
        this.audioElement = null;
        this.isInitialized = false;
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
            this.audioContext.resume();
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

    // 销毁
    destroy() {
        this.audioElement?.pause();
        this.audioElement = null;
        this.audioContext?.close();
        this.audioContext = null;
        this.isInitialized = false;
    }
}

window.audioEngine = new AudioEngine();
```

**Step 2: 提交**

```bash
git add js/audio-engine.js
git commit -m "feat: 实现基础音频引擎"
```

---

### Task 9: 创建双耳节拍生成器

**Files:**
- 修改: `E:/助眠苹果手机版/js/binaural-beats.js`

**Step 1: 实现双耳节拍生成器**

```javascript
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
```

**Step 2: 提交**

```bash
git add js/binaural-beats.js
git commit -m "feat: 实现双耳节拍生成器"
```

---

### Task 10: 测试音频引擎和双耳节拍

**Step 1: 在浏览器控制台测试**

```javascript
// 测试音频引擎初始化
await audioEngine.init();
console.log('AudioEngine initialized:', audioEngine.isInitialized);

// 测试双耳节拍
const binaural = new BinauralBeats(audioEngine.audioContext, audioEngine.audioContext.destination);
binaural.setFrequency(200, 4); // 基础频率 200Hz，节拍 4Hz
binaural.setVolume(0.3);
binaural.start();

// 几秒后渐变频率
setTimeout(() => {
    binaural.fadeBeatFrequency(200, 2, 5); // 渐变到 2Hz
}, 3000);

// 几秒后停止
setTimeout(() => {
    binaural.fadeVolume(0, 2); // 2秒内渐隐
}, 8000);
```

**Step 2: 提交**

```bash
git add js/binaural-beats.js
git commit -m "test: 音频引擎和双耳节拍手动测试"
```

---

### Task 11: 集成双耳节拍到音频引擎

**Files:**
- 修改: `E:/助眠苹果手机版/js/audio-engine.js`

**Step 1: 在 AudioEngine 中集成 BinauralBeats**

添加以下属性和方法到 `AudioEngine` 类：

```javascript
// 在 constructor 中添加
this.binauralBeats = null;

// 添加 initBinauralBeats 方法
initBinauralBeats() {
    if (!this.audioContext) throw new Error('AudioEngine 未初始化');
    this.binauralBeats = new BinauralBeats(this.audioContext, this.audioContext.destination);
}

// 添加 startBinauralBeats 方法
startBinauralBeats(baseFreq = 200, beatFreq = 4) {
    if (!this.binauralBeats) this.initBinauralBeats();
    this.binauralBeats.setFrequency(baseFreq, beatFreq);
    this.binauralBeats.setVolume(0.3);
    this.binauralBeats.start();
}

// 添加 fadeBinauralBeats 方法
fadeBinauralBeats(targetBaseFreq, targetBeatFreq, durationSeconds) {
    if (this.binauralBeats) {
        this.binauralBeats.fadeBeatFrequency(targetBaseFreq, targetBeatFreq, durationSeconds);
    }
}

// 添加 fadeBinauralVolume 方法
fadeBinauralVolume(targetValue, durationSeconds) {
    if (this.binauralBeats) {
        this.binauralBeats.fadeVolume(targetValue, durationSeconds);
    }
}

// 更新 destroy 方法
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
```

**Step 2: 提交**

```bash
git add js/audio-engine.js
git commit -m "feat: 集成双耳节拍到音频引擎"
```

---

## 阶段四：会话引擎

### Task 12: 创建三阶段睡眠会话控制器

**Files:**
- 修改: `E:/助眠苹果手机版/js/app.js`

**Step 1: 添加 SessionController 类**

```javascript
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
```

**Step 2: 提交**

```bash
git add js/app.js
git commit -m "feat: 实现三阶段睡眠会话控制器"
```

---

### Task 13: 添加页面可见性处理（边界处理）

**Files:**
- 修改: `E:/助眠苹果手机版/js/app.js`

**Step 1: 添加页面可见性监听**

```javascript
// 在 app.js 中添加
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.sessionController?.isRunning) {
        // 页面隐藏时暂停
        window.sessionController.pause();
    }
});

// 页面恢复时提示恢复
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.sessionController?.isRunning && window.sessionController?.isPaused) {
        // 可以选择自动恢复或显示恢复按钮
        // 这里选择显示恢复提示
    }
});
```

**Step 2: 提交**

```bash
git add js/app.js
git commit -m "feat: 添加页面可见性处理"
```

---

## 阶段五：场景动画

### Task 14: 创建场景管理器

**Files:**
- 修改: `E:/助眠苹果手机版/js/scene-manager.js`

**Step 1: 实现场景管理器基类**

```javascript
class BaseScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.animationFrameId = null;
        this.resize();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.tick();
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    tick() {
        if (!this.isRunning) return;
        this.update();
        this.render();
        this.animationFrameId = requestAnimationFrame(() => this.tick());
    }

    update() {
        // 子类实现
    }

    render() {
        // 子类实现
    }
}

class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.currentScene = null;
        this.scenes = {};
        this.currentSceneName = null;
    }

    register(name, SceneClass) {
        this.scenes[name] = SceneClass;
    }

    switch(sceneName) {
        if (!this.scenes[sceneName]) return;
        if (this.currentScene) {
            this.currentScene.stop();
        }
        this.currentSceneName = sceneName;
        this.currentScene = new this.scenes[sceneName](this.canvas);
        this.currentScene.start();
    }

    update() {
        if (this.currentScene) {
            this.currentScene.resize();
        }
    }
}

window.BaseScene = BaseScene;
window.SceneManager = SceneManager;
```

**Step 2: 提交**

```bash
git add js/scene-manager.js
git commit -m "feat: 创建场景管理器基类"
```

---

### Task 15: 实现星空夜景场景

**Files:**
- 修改: `E:/助眠苹果手机版/js/scene-manager.js`

**Step 1: 添加星空夜景场景**

```javascript
class StarryNightScene extends BaseScene {
    constructor(canvas) {
        super(canvas);
        this.stars = [];
        this.meteors = [];
        this.initStars(200);
    }

    initStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 2 + 0.5,
                alpha: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinkleDir: 1
            });
        }
    }

    update() {
        // 星星闪烁
        this.stars.forEach(star => {
            star.alpha += star.twinkleSpeed * star.twinkleDir;
            if (star.alpha >= 1 || star.alpha <= 0.3) {
                star.twinkleDir *= -1;
            }
        });

        // 随机生成流星
        if (Math.random() < 0.002) {
            this.meteors.push({
                x: Math.random() * this.width,
                y: 0,
                speed: Math.random() * 10 + 5,
                length: Math.random() * 80 + 40,
                alpha: 1
            });
        }

        // 更新流星
        this.meteors = this.meteors.filter(meteor => {
            meteor.x += meteor.speed * 0.5;
            meteor.y += meteor.speed;
            meteor.alpha -= 0.02;
            return meteor.alpha > 0 && meteor.y < this.height;
        });
    }

    render() {
        // 背景渐变
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(1, '#1a1a3e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 绘制月亮
        this.ctx.beginPath();
        this.ctx.arc(this.width * 0.8, this.height * 0.15, 40, 0, Math.PI * 2);
        const moonGradient = this.ctx.createRadialGradient(
            this.width * 0.8, this.height * 0.15, 0,
            this.width * 0.8, this.height * 0.15, 40
        );
        moonGradient.addColorStop(0, 'rgba(255, 255, 220, 0.9)');
        moonGradient.addColorStop(1, 'rgba(255, 255, 200, 0.3)');
        this.ctx.fillStyle = moonGradient;
        this.ctx.fill();

        // 绘制星星
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            this.ctx.fill();
        });

        // 绘制流星
        this.meteors.forEach(meteor => {
            const gradient = this.ctx.createLinearGradient(
                meteor.x, meteor.y,
                meteor.x - meteor.length, meteor.y - meteor.length
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.alpha})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(meteor.x, meteor.y);
            this.ctx.lineTo(meteor.x - meteor.length, meteor.y - meteor.length);
            this.ctx.stroke();
        });
    }
}
```

**Step 2: 注册到 SceneManager**

在 `SceneManager` 构造函数中添加：

```javascript
this.register('starryNight', StarryNightScene);
```

**Step 3: 提交**

```bash
git add js/scene-manager.js
git commit -m "feat: 实现星空夜景场景"
```

---

### Task 16: 实现海滩海浪场景

**Files:**
- 修改: `E:/助眠苹果手机版/js/scene-manager.js`

**Step 1: 添加海滩海浪场景**

```javascript
class BeachScene extends BaseScene {
    constructor(canvas) {
        super(canvas);
        this.time = 0;
        this.waveOffset = 0;
    }

    update() {
        this.time += 0.016;
        this.waveOffset = Math.sin(this.time * 0.5) * 20;
    }

    render() {
        // 天空
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.6);
        skyGradient.addColorStop(0, '#0a0a2e');
        skyGradient.addColorStop(1, '#1a2a4a');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.width, this.height * 0.6);

        // 月亮
        this.ctx.beginPath();
        this.ctx.arc(this.width * 0.7, this.height * 0.12, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 220, 0.8)';
        this.ctx.fill();

        // 海面
        const seaGradient = this.ctx.createLinearGradient(0, this.height * 0.5, 0, this.height);
        seaGradient.addColorStop(0, '#1a2a4a');
        seaGradient.addColorStop(1, '#0a1a3a');
        this.ctx.fillStyle = seaGradient;
        this.ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);

        // 多层波浪
        this.drawWaves(0.55, 30, 3, 'rgba(100, 150, 200, 0.3)');
        this.drawWaves(0.60, 25, 4, 'rgba(80, 130, 180, 0.4)');
        this.drawWaves(0.65, 20, 5, 'rgba(60, 110, 160, 0.5)');
    }

    drawWaves(baseY, amplitude, frequency, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);

        for (let x = 0; x <= this.width; x += 5) {
            const y = this.height * baseY +
                      Math.sin((x / this.width) * Math.PI * frequency + this.time * 2) * amplitude +
                      this.waveOffset;
            this.ctx.lineTo(x, y);
        }

        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
}
```

**Step 2: 注册到 SceneManager**

```javascript
this.register('beach', BeachScene);
```

**Step 3: 提交**

```bash
git add js/scene-manager.js
git commit -m "feat: 实现海滩海浪场景"
```

---

### Task 17: 实现森林自然场景

**Files:**
- 修改: `E:/助眠苹果手机版/js/scene-manager.js`

**Step 1: 添加森林自然场景**

```javascript
class ForestScene extends BaseScene {
    constructor(canvas) {
        super(canvas);
        this.fireflies = [];
        this.trees = [];
        this.initFireflies(50);
        this.initTrees(8);
    }

    initFireflies(count) {
        this.fireflies = [];
        for (let i = 0; i < count; i++) {
            this.fireflies.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 3 + 1,
                alpha: Math.random(),
                alphaDir: Math.random() > 0.5 ? 1 : -1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.3
            });
        }
    }

    initTrees(count) {
        this.trees = [];
        for (let i = 0; i < count; i++) {
            this.trees.push({
                x: (this.width / count) * i + Math.random() * 50,
                height: Math.random() * 150 + 100,
                width: Math.random() * 40 + 30
            });
        }
    }

    update() {
        this.fireflies.forEach(fly => {
            fly.x += fly.vx;
            fly.y += fly.vy;
            fly.alpha += 0.02 * fly.alphaDir;

            if (fly.alpha >= 1) fly.alphaDir = -1;
            if (fly.alpha <= 0.2) fly.alphaDir = 1;

            // 边界反弹
            if (fly.x < 0 || fly.x > this.width) fly.vx *= -1;
            if (fly.y < 0 || fly.y > this.height) fly.vy *= -1;
        });
    }

    render() {
        // 背景渐变
        const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        bgGradient.addColorStop(0, '#0a1a0a');
        bgGradient.addColorStop(1, '#0a2a1a');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 绘制树木剪影
        this.ctx.fillStyle = '#050f05';
        this.trees.forEach(tree => {
            this.ctx.beginPath();
            // 三角形树冠
            this.ctx.moveTo(tree.x, this.height * 0.4);
            this.ctx.lineTo(tree.x - tree.width, this.height * 0.4 + tree.height * 0.6);
            this.ctx.lineTo(tree.x + tree.width, this.height * 0.4 + tree.height * 0.6);
            this.ctx.closePath();
            this.ctx.fill();

            // 树干
            this.ctx.fillRect(tree.x - 5, this.height * 0.4 + tree.height * 0.6, 10, this.height * 0.6);
        });

        // 绘制萤火虫
        this.fireflies.forEach(fly => {
            const glow = this.ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.radius * 5);
            glow.addColorStop(0, `rgba(150, 255, 100, ${fly.alpha})`);
            glow.addColorStop(1, 'rgba(150, 255, 100, 0)');
            this.ctx.beginPath();
            this.ctx.arc(fly.x, fly.y, fly.radius * 5, 0, Math.PI * 2);
            this.ctx.fillStyle = glow;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(fly.x, fly.y, fly.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(200, 255, 150, ${fly.alpha})`;
            this.ctx.fill();
        });
    }
}
```

**Step 2: 注册到 SceneManager**

```javascript
this.register('forest', ForestScene);
```

**Step 3: 提交**

```bash
git add js/scene-manager.js
git commit -m "feat: 实现森林自然场景"
```

---

### Task 18: 实现花田草地场景

**Files:**
- 修改: `E:/助眠苹果手机版/js/scene-manager.js`

**Step 1: 添加花田草地场景**

```javascript
class FlowerFieldScene extends BaseScene {
    constructor(canvas) {
        super(canvas);
        this.petals = [];
        this.time = 0;
        this.initPetals(40);
    }

    initPetals(count) {
        this.petals = [];
        for (let i = 0; i < count; i++) {
            this.petals.push(this.createPetal());
        }
    }

    createPetal() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height - 100,
            size: Math.random() * 8 + 4,
            speedX: Math.random() * 0.5 + 0.2,
            speedY: Math.random() * 0.3 + 0.1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            swayOffset: Math.random() * Math.PI * 2,
            swayAmount: Math.random() * 30 + 10,
            color: `hsla(${280 + Math.random() * 40}, 70%, ${60 + Math.random() * 20}%, 0.7)`
        };
    }

    update() {
        this.time += 0.016;
        this.petals.forEach(petal => {
            petal.x += petal.speedX + Math.sin(this.time + petal.swayOffset) * 0.5;
            petal.y += petal.speedY;
            petal.rotation += petal.rotationSpeed;

            if (petal.y > this.height + 50) {
                Object.assign(petal, this.createPetal());
                petal.y = -50;
            }
        });
    }

    render() {
        // 天空渐变
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        skyGradient.addColorStop(0, '#1a0a2e');
        skyGradient.addColorStop(0.5, '#2a1a4a');
        skyGradient.addColorStop(1, '#1a2a2a');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 草地
        const grassGradient = this.ctx.createLinearGradient(0, this.height * 0.7, 0, this.height);
        grassGradient.addColorStop(0, '#1a3a2a');
        grassGradient.addColorStop(1, '#0a2a1a');
        this.ctx.fillStyle = grassGradient;

        // 波浪形草地
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);
        for (let x = 0; x <= this.width; x += 10) {
            const y = this.height * 0.75 + Math.sin(x * 0.02 + this.time) * 10;
            this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        this.ctx.fill();

        // 绘制花瓣
        this.petals.forEach(petal => {
            this.ctx.save();
            this.ctx.translate(petal.x, petal.y);
            this.ctx.rotate(petal.rotation);
            this.ctx.fillStyle = petal.color;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
}
```

**Step 2: 注册到 SceneManager**

```javascript
this.register('flowerField', FlowerFieldScene);
```

**Step 3: 提交**

```bash
git add js/scene-manager.js
git commit -m "feat: 实现花田草地场景"
```

---

## 阶段六：UI 界面

### Task 19: 创建主界面 UI

**Files:**
- 修改: `E:/助眠苹果手机版/index.html`
- 修改: `E:/助眠苹果手机版/css/styles.css`
- 修改: `E:/助眠苹果手机版/js/app.js`

**Step 1: 更新 index.html 主界面**

```html
<div id="setup-view" class="view">
    <!-- 场景选择 -->
    <div class="scene-selector">
        <div class="scene-options">
            <button class="scene-btn active" data-scene="starryNight" title="星空">
                <span class="scene-icon">🌙</span>
            </button>
            <button class="scene-btn" data-scene="beach" title="海滩">
                <span class="scene-icon">🌊</span>
            </button>
            <button class="scene-btn" data-scene="forest" title="森林">
                <span class="scene-icon">🌲</span>
            </button>
            <button class="scene-btn" data-scene="flowerField" title="花田">
                <span class="scene-icon">🌸</span>
            </button>
        </div>
    </div>

    <div class="controls">
        <!-- 时长设置 -->
        <div class="panel">
            <div class="panel-title">睡眠时长</div>
            <div class="duration-display">
                <span id="duration-value">30</span> 分钟
            </div>
            <input type="range" id="duration-slider" min="10" max="90" value="30" step="5">
        </div>

        <!-- 音乐选择 -->
        <div class="panel">
            <div class="panel-title">背景音乐</div>
            <label class="file-input-label">
                <input type="file" id="music-input" accept="audio/*" hidden>
                <span id="music-name">点击选择音乐文件</span>
            </label>
        </div>

        <!-- 双耳节拍设置 -->
        <div class="panel collapsible" id="binaural-panel">
            <div class="panel-header">
                <span class="panel-title">双耳节拍</span>
                <span class="toggle-icon">▼</span>
            </div>
            <div class="panel-content">
                <div class="setting-row">
                    <label>基础频率</label>
                    <input type="range" id="base-freq" min="100" max="500" value="200" step="10">
                    <span id="base-freq-value">200 Hz</span>
                </div>
                <div class="setting-row">
                    <label>节拍频率</label>
                    <input type="range" id="beat-freq" min="0.5" max="40" value="4" step="0.5">
                    <span id="beat-freq-value">4 Hz</span>
                </div>
                <div class="setting-row">
                    <label>音量</label>
                    <input type="range" id="binaural-volume" min="0" max="1" value="0.3" step="0.1">
                </div>
            </div>
        </div>

        <!-- 开始按钮 -->
        <button id="start-btn" class="btn btn-primary start-btn">开始睡眠</button>
    </div>
</div>
```

**Step 2: 添加主界面 CSS**

```css
/* 场景选择器 */
.scene-selector {
    padding: 20px 0;
}

.scene-options {
    display: flex;
    justify-content: center;
    gap: 16px;
}

.scene-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.scene-btn.active {
    border-color: #fff;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.scene-icon {
    font-size: 28px;
}

/* 控制面板 */
.controls {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 20px;
}

.duration-display {
    text-align: center;
    font-size: 48px;
    font-weight: 200;
    margin-bottom: 16px;
}

.duration-display span {
    font-weight: 600;
}

/* 文件选择 */
.file-input-label {
    display: block;
    padding: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-align: center;
    cursor: pointer;
    transition: background 0.3s;
}

.file-input-label:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* 可折叠面板 */
.panel.collapsible .panel-content {
    display: none;
}

.panel.collapsible.open .panel-content {
    display: block;
}

.toggle-icon {
    transition: transform 0.3s;
}

.panel.collapsible.open .toggle-icon {
    transform: rotate(180deg);
}

.setting-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 12px;
}

.setting-row label {
    flex: 0 0 80px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
}

.setting-row input[type="range"] {
    flex: 1;
}

.setting-row span {
    flex: 0 0 70px;
    text-align: right;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

/* 开始按钮 */
.start-btn {
    width: 100%;
    margin-top: 16px;
}
```

**Step 3: 提交**

```bash
git add index.html css/styles.css js/app.js
git commit -m "feat: 创建主界面 UI"
```

---

### Task 20: 创建运行中界面 UI

**Files:**
- 修改: `E:/助眠苹果手机版/index.html`
- 修改: `E:/助眠苹果手机版/css/styles.css`
- 修改: `E:/助眠苹果手机版/js/app.js`

**Step 1: 添加运行中界面 HTML**

```html
<div id="session-view" class="view hidden">
    <!-- 倒计时 -->
    <div class="session-info">
        <div class="timer">
            <span id="time-remaining">30:00</span>
        </div>
        <div class="phase-indicator">
            <span id="phase-name">引导阶段</span>
        </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
            <div class="progress-markers">
                <span class="marker" style="left: 15%">引导</span>
                <span class="marker" style="left: 85%">唤醒</span>
            </div>
        </div>
    </div>

    <!-- 当前状态 -->
    <div class="session-status">
        <div id="binaural-status">
            🔇 双耳节拍: <span id="current-beat">4</span> Hz
        </div>
    </div>

    <!-- 控制按钮 -->
    <div class="session-controls">
        <button id="pause-btn" class="btn btn-secondary">暂停</button>
        <button id="stop-btn" class="btn btn-secondary">停止</button>
    </div>

    <!-- 高级设置（可滑动展开）-->
    <div class="advanced-panel" id="advanced-panel">
        <div class="drag-handle"></div>
        <div class="advanced-content">
            <div class="panel-title">高级设置</div>
            <!-- 可添加更多高级控件 -->
        </div>
    </div>
</div>
```

**Step 2: 添加运行界面 CSS**

```css
/* 运行界面 */
#session-view {
    justify-content: center;
    align-items: center;
}

.session-info {
    text-align: center;
    margin-bottom: 40px;
}

.timer {
    font-size: 72px;
    font-weight: 200;
    letter-spacing: 4px;
}

.phase-indicator {
    margin-top: 16px;
    padding: 8px 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    display: inline-block;
}

#phase-name {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.9);
}

/* 进度条 */
.progress-container {
    width: 100%;
    max-width: 400px;
    margin-bottom: 40px;
}

.progress-bar {
    position: relative;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4a90a4, #6bc5d9);
    border-radius: 4px;
    width: 0%;
    transition: width 0.5s linear;
}

.progress-markers {
    position: absolute;
    top: 16px;
    left: 0;
    right: 0;
}

.marker {
    position: absolute;
    transform: translateX(-50%);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
}

/* 状态显示 */
.session-status {
    margin-bottom: 40px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
}

/* 控制按钮 */
.session-controls {
    display: flex;
    gap: 20px;
}

.session-controls .btn {
    min-width: 120px;
}

/* 高级面板 */
.advanced-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(20, 20, 40, 0.95);
    border-radius: 20px 20px 0 0;
    padding: 10px 20px 40px;
    transform: translateY(calc(100% - 40px));
    transition: transform 0.3s ease;
}

.advanced-panel.open {
    transform: translateY(0);
}

.drag-handle {
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    margin: 8px auto 16px;
}
```

**Step 3: 提交**

```bash
git add index.html css/styles.css js/app.js
git commit -m "feat: 创建运行中界面 UI"
```

---

### Task 21: 连接 UI 和控制器

**Files:**
- 修改: `E:/助眠苹果手机版/js/app.js`

**Step 1: 在 app.js 中初始化应用**

```javascript
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
```

**Step 2: 提交**

```bash
git add js/app.js
git commit -m "feat: 连接 UI 和控制器"
```

---

## 阶段七：整合测试

### Task 22: 手动功能测试清单

**测试步骤：**

1. **基础加载测试**
   - 打开 index.html
   - 确认场景动画正常显示
   - 确认场景切换按钮工作

2. **时长设置测试**
   - 拖动时长滑块
   - 确认数值正确更新

3. **音乐选择测试**
   - 选择一个 MP3 文件
   - 确认文件名显示
   - 确认控制台无错误

4. **双耳节拍测试**
   - 调整基础频率和节拍频率滑块
   - 点击开始后确认声音播放

5. **会话流程测试**
   - 开始会话
   - 观察阶段变化（引导→深睡→唤醒）
   - 观察音量渐变
   - 测试暂停/继续
   - 测试停止

6. **场景动画测试**
   - 在四个场景间切换
   - 确认动画流畅

7. **PWA 测试**
   - 确认 manifest.json 正确
   - 确认 Service Worker 注册成功
   - 尝试"添加到主屏幕"

**Step 1: 提交**

```bash
git add docs/plans/2026-04-11-sleep-aid-app-implementation-plan.md
git commit -m "docs: 添加实施计划"
```

---

### Task 23: 跨浏览器兼容性检查

**测试浏览器：**

1. **Safari iOS**（主要目标）
   - Web Audio API 支持
   - IndexedDB 支持
   - PWA 安装

2. **Chrome Android**
   - 音频自动播放策略
   - Service Worker 支持

**Step 1: 创建兼容性说明文档**

```markdown
## 已知兼容性问题

### iOS Safari
- AudioContext 需要用户交互才能初始化（已处理）
- 某些 iOS 版本不支持 StereoPannerNode（降级为单声道）

### 通用
- 确保音频文件格式被支持（MP3/AAC 兼容性最好）
- 部分浏览器需要 HTTPS 才能使用 Service Worker 和麦克风
```

**Step 2: 提交**

```bash
git add README.md
git commit -m "docs: 添加兼容性说明"
```

---

## 总结

共 **23 个任务**，预计实施顺序：

1. Task 1-5: 基础设施（PWA 脚手架）
2. Task 6-7: 存储层
3. Task 8-11: 音频核心
4. Task 12-13: 会话引擎
5. Task 14-18: 场景动画（5 个场景）
6. Task 19-21: UI 界面
7. Task 22-23: 测试

每个任务完成时应提交一次 commit，保持原子性。
