// service-worker.js
const CACHE_NAME = 'dj-player-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Установка - жестко кэшируем все необходимое
self.addEventListener('install', event => {
  console.log('🚀 Установка сервис-воркера');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Кэширую файлы для оффлайна:', URLS_TO_CACHE);
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
  // Пропускаем не-GET запросы и chrome-extension
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если есть в кэше - возвращаем
        if (response) {
          return response;
        }

        // Если нет в кэше - сеть + кэшируем для будущего
        return fetch(event.request)
          .then(response => {
            // Проверяем валидный ответ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ для кэширования
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('❌ Fetch failed:', error);
            // Для главной страницы - всегда возвращаем закэшированную версию
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});
