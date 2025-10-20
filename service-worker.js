// service-// service-worker.js
const CACHE_NAME = 'dj-player-v1';
const URLS_TO_CACHE = [
    '/',
    '/index.html', 
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    'https://unpkg.com/react@17/umd/react.development.js',
    'https://unpkg.com/react-dom@17/umd/react-dom.development.js',
    'https://unpkg.com/@babel/standalone/babel.min.js'
];

// Установка - жестко кэшируем все необходимое
self.addEventListener('install', event => {
  console.log('🚀 Установка сервис-воркера');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Кэширую файлы для оффлайна');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        console.log('✅ Все файлы закэшированы');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Ошибка кэширования:', error);
      })
  );
});

// Активация - чистим старый кэш
self.addEventListener('activate', event => {
  console.log('🔥 Активация сервис-воркера');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Удаляю старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Сервис-воркер активирован');
      return self.clients.claim();
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если есть в кэше - возвращаем
        if (response) {
          return response;
        }

        // Если нет в кэше - идем в сеть
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }

            // Кэшируем для будущего
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('❌ Fetch failed:', error);
            // Для главной страницы возвращаем закэшированную версию
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});.js
