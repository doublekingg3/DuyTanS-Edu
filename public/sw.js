// Service Worker cho PWA Shortcut Trường Phổ Thông Duy Tân
const CACHE_NAME = 'duytan-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Mặc định cho phép mạng xử lý bình thường
});
