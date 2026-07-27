self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: 'SmartPharmacy',
      body: event.data ? event.data.text() : 'Tienes una nueva notificación.',
    };
  }

  const title = payload.title || 'SmartPharmacy';
  const data = payload.data || {};

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || 'Tienes una nueva notificación.',
      icon: payload.icon || '/assets/icons/smartpharmacy-192.png',
      badge: payload.badge || '/assets/icons/smartpharmacy-192.png',
      actions: payload.actions || [],
      data: {
        url: data.url || '/',
        type: data.type || 'general',
      },
      tag: data.type || 'smartpharmacy-notification',
      renotify: true,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || '/',
    self.location.origin,
  ).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existingClient = windowClients.find((client) => client.url.startsWith(self.location.origin));

      if (existingClient) {
        existingClient.navigate(targetUrl);
        return existingClient.focus();
      }

      return clients.openWindow(targetUrl);
    }),
  );
});
