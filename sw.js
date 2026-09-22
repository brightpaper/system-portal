/* Bright Paper Portal — service worker                        22Sep-02
   Push aate hi notification YAHI dikhata hai — app khuli ho ya band.

   Pehle ye Firebase ki library se hota tha. Library khud tay karti thi
   ki kab dikhana hai, aur band app par message pahunch kar bhi
   notification nahi banti thi. Ab koi library nahi: browser ka apna
   "push" event, jo Firebase ka message seedha padh leta hai. Token ab
   bhi app ke page me Firebase se hi banta hai — uske liye yahan library
   ki zaroorat nahi.

   Firebase ka message aisa aata hai:
     { "data": { "title", "body", "nav", "tag" }, "from": "...", ... } */

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var p = {};
  try { p = e.data ? e.data.json() : {}; } catch (x) {
    try { p = { data: { body: e.data.text() } }; } catch (y) {}
  }
  var d = p.data || p.notification || {};
  /* Chrome ka niyam: har push par ek notification dikhani hi hai, warna
     wo apni taraf se "site updated in background" dikha deta hai. */
  e.waitUntil(self.registration.showNotification(d.title || 'Bright Paper', {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    data: { nav: d.nav || '' }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var nav = (e.notification.data || {}).nav || '';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if ('focus' in list[i]) {
          list[i].postMessage({ bp: 'open', nav: nav });
          return list[i].focus();
        }
      }
      return self.clients.openWindow('./' + (nav ? '#' + nav : ''));
    }));
});
