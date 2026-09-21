/* Bright Paper Portal — service worker
   Do kaam: phone par notification dikhane ki ijazat (Android me iske
   bina notification banti hi nahi), aur notification dabane par app
   kholna / aage laana. Koi caching nahi \u2014 portal hamesha taaza. */

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

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
