// playlist-manager.js
class PlaylistManager {
    constructor() {
        this.dbName = 'DJPlayerDB';
        this.version = 1;
        this.db = null;
    }

    // Инициализация базы данных
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Создаем хранилище для треков
                if (!db.objectStoreNames.contains('tracks')) {
                    const store = db.createObjectStore('tracks', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Индексы для быстрого поиска
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // Сохранение трека
    async saveTrack(file) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tracks'], 'readwrite');
            const store = transaction.objectStore('tracks');

            const track = {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                file: file
            };

            const request = store.add(track);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Получение всех треков
    async getAllTracks() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tracks'], 'readonly');
            const store = transaction.objectStore('tracks');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Удаление трека
    async deleteTrack(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tracks'], 'readwrite');
            const store = transaction.objectStore('tracks');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Очистка всего плейлиста
    async clearPlaylist() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['tracks'], 'readwrite');
            const store = transaction.objectStore('tracks');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Создаем глобальный экземпляр
window.playlistManager = new PlaylistManager();
