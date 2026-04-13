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
                if (!db.objectStoreNames.contains('videoFiles')) {
                    db.createObjectStore('videoFiles', { keyPath: 'name' });
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

    // IndexedDB 操作：保存视频文件
    async saveVideoFile(name, blob) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['videoFiles'], 'readwrite');
            const store = transaction.objectStore('videoFiles');
            const request = store.put({ name, blob, timestamp: Date.now() });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getVideoFile(name) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['videoFiles'], 'readonly');
            const store = transaction.objectStore('videoFiles');
            const request = store.get(name);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteVideoFile(name) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['videoFiles'], 'readwrite');
            const store = transaction.objectStore('videoFiles');
            const request = store.delete(name);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 移除设置
    removeSetting(key) {
        localStorage.removeItem(`sleepaid_${key}`);
    }
}

// 导出单例
window.storage = new Storage();
