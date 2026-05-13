self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'MindfulMe 🌿', {
      body: data.body ?? "Don't forget to log your habits today!",
      icon: '/favicon.png',
      badge: '/favicon.png',
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
