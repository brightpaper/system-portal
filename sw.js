/* Bright Paper Portal — service worker                        22Sep-01
   Teen kaam:
     1. App band ho tab bhi notification — Firebase ka message aate hi
        yahi use dikhata hai (onBackgroundMessage).
     2. Notification dabane par app kholna / aage laana, sahi page par.
     3. Phone par notification dikhane ki ijazat (Android me iske bina
        notification banti hi nahi).
   Koi caching nahi — portal hamesha taaza. */

var FB = {
  apiKey: 'AIzaSyBl--envqRSsVmG86HhpGoByoK7Gf3XM5o',
  authDomain: 'system-portal-c6b67.firebaseapp.com',
  projectId: 'system-portal-c6b67',
  storageBucket: 'system-portal-c6b67.firebasestorage.app',
  messagingSenderId: '349426254052',
  appId: '1:349426254052:web:ee2487e822d5984434acf1'
};

/* Firebase na mile (net band, CDN ruka) to bhi service worker chalta
   rahe — warna app ki baaki notification bhi band ho jati. */
try {
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
  firebase.initializeApp(FB);
  firebase.messaging().onBackgroundMessage(function (p) {
    var d = (p && p.data) || {};
    return self.registration.showNotification(d.title || 'Bright Paper', {
      body: d.body || '',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: d.tag || undefined,
      renotify: !!d.tag,
      data: { nav: d.nav || '' }
    });
  });
} catch (e) { /* push nahi, baaki sab chalta rahe */ }

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
