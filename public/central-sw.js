const CENTRAL_URL = "/central/checkouts";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/*
 * Receberá Web Push na próxima etapa.
 */
self.addEventListener("push", (event) => {
  let data = {
    title: "Nova atividade",
    body: "Há uma nova atividade de checkout.",
    url: CENTRAL_URL,
    tag: "checkout-activity",
  };

  if (event.data) {
    try {
      data = {
        ...data,
        ...event.data.json(),
      };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag,
      renotify: true,
      data: {
        url: data.url || CENTRAL_URL,
      },
    }),
  );
});

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const targetUrl =
      event.notification.data?.url ||
      CENTRAL_URL;

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clients) => {
          for (const client of clients) {
            if ("focus" in client) {
              client.navigate(targetUrl);
              return client.focus();
            }
          }

          return self.clients.openWindow(
            targetUrl,
          );
        }),
    );
  },
);