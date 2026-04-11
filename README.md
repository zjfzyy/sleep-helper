# 助眠 PWA 应用

三阶段助眠应用，伴你入睡与唤醒。

## 功能特性

- **三阶段音频会话**: 引导阶段 → 深睡阶段 → 唤醒阶段
- **双耳节拍**: 可调节基础频率和节拍频率
- **四个场景动画**: 星空夜景、海滩海浪、森林自然、花田草地
- **PWA 支持**: 可添加到主屏幕，离线使用
- **背景音乐**: 支持本地音乐文件播放
- **数据持久化**: 设置和音乐文件存储在本地

## 技术栈

- HTML5 + CSS3 + 原生 JavaScript
- Web Audio API (音频处理)
- Canvas 2D (场景动画)
- Service Worker (离线缓存)
- IndexedDB (文件存储)
- localStorage (设置存储)

## 已知兼容性问题

### iOS Safari
- AudioContext 需要用户交互才能初始化（已处理）
- 某些 iOS 版本不支持 StereoPannerNode（降级为单声道）

### 通用
- 确保音频文件格式被支持（MP3/AAC 兼容性最好）
- 部分浏览器需要 HTTPS 才能使用 Service Worker

## 开发

```bash
# 本地开发（需要 HTTP 服务器）
# 推荐使用 http-server 或 Live Server

# 构建后部署
# 只需将所有文件部署到静态托管服务
```

## 浏览器支持

- Safari iOS 14+
- Chrome Android 80+
- Chrome Desktop 80+
- Edge 80+
- Firefox 75+
