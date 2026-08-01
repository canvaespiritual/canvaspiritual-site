const CENTRAL_URL = "/central/checkouts";

const DEFAULT_ICON =
  "/icons/central-192.png";

const DEFAULT_BADGE =
  "/icons/central-192.png";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      self.clients.claim(),
    );
  },
);

self.addEventListener(
  "push",
  (event) => {
    let data = {
      title: "Nova atividade",
      body:
        "Há uma nova atividade de checkout.",
      url: CENTRAL_URL,
      tag: "checkout-activity",
      icon: DEFAULT_ICON,
      badge: DEFAULT_BADGE,
    };

    if (event.data) {
      try {
        data = {
          ...data,
          ...event.data.json(),
        };
      } catch {
        data.body =
          event.data.text();
      }
    }

    event.waitUntil(
      self.registration.showNotification(
        data.title,
        {
          body: data.body,

          icon:
            data.icon ||
            DEFAULT_ICON,

          badge:
            data.badge ||
            DEFAULT_BADGE,

          tag:
            data.tag ||
            "checkout-activity",

          renotify: true,

          data: {
            url:
              data.url ||
              CENTRAL_URL,
          },
        },
      ),
    );
  },
);

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
              client.navigate(
                targetUrl,
              );

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