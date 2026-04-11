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

// 星空夜景场景
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

// 海滩海浪场景
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

// 森林自然场景
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

// 花田草地场景
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

window.BaseScene = BaseScene;
window.SceneManager = SceneManager;
