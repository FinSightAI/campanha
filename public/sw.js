self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
  if (event.data?.type === 'NOTIFY') {
    const { title, body, url } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: url === '/create' ? 'campanha-avatar' : 'campanha-reminder',
      renotify: true,
      data: { url: url || '/calendar' },
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/calendar';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const c = clients.find((cl) => cl.url.includes(url));
      if (c) c.focus();
      else self.clients.openWindow(url);
    })
  );
});
