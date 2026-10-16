/* Bright Paper Portal — service worker                        16Oct-01
   Push aate hi notification YAHI dikhata hai — app khuli ho ya band.

   Pehle ye Firebase ki library se hota tha. Library khud tay karti thi
   ki kab dikhana hai, aur band app par message pahunch kar bhi
   notification nahi banti thi. Ab koi library nahi: browser ka apna
   "push" event, jo Firebase ka message seedha padh leta hai. Token ab
   bhi app ke page me Firebase se hi banta hai — uske liye yahan library
   ki zaroorat nahi.

   Firebase ka message aisa aata hai:
     { "data": { "title", "body", "nav", "tag" }, "from": "...", ... }

   Naya: push aate hi yahan ek chhota nishaan likha jata hai ki "is
   device par push pahuncha" (Cache me), aur khuli app ko turant bataya
   jata hai. Portal isi se tay karta hai ki app-khuli wali notification
   band kare ya nahi — jab tak is device par ek bhi push nahi pahuncha,
   wo band nahi hoti. Pehle ye server ke "Firebase OK" par band ho jaati
   thi, aur push phone tak na pahunche to kuch bhi nahi aata tha.     */

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

/* 16Oct-01: Reminder zor se \u2014 lamba vibrate, aur screen par tab tak
   ruke jab tak koi chhue nahi. Apna song web push me nahi bajta (phone
   ka apna notification sound bajta hai), isliye ye kami vibrate se. */
function rmdOpt(o, d) {
  if (d && (d.nav === 'remind' || /^bp-rmd-/.test(String(d.tag || '')))) {
    o.vibrate = [400, 150, 400, 150, 400, 600, 400, 150, 400, 150, 400];
    o.requireInteraction = true;
  }
  return o;
}

self.addEventListener('push', function (e) {
  var p = {};
  try { p = e.data ? e.data.json() : {}; } catch (x) {
    try { p = { data: { body: e.data.text() } }; } catch (y) {}
  }
  var d = p.data || p.notification || {};
  var at = Date.now();
  /* Chrome ka niyam: har push par ek notification dikhani hi hai, warna
     wo apni taraf se "site updated in background" dikha deta hai. */
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || 'Bright Paper', rmdOpt({
      body: d.body || '',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: d.tag || undefined,
      renotify: !!d.tag,
      data: { nav: d.nav || '' }
    }, d)),
    /* saboot: is device par push pahuncha */
    caches.open('bp-meta').then(function (c) {
      return c.put('push-ok', new Response(String(at)));
    }).catch(function () {}),
    /* app khuli ho to use abhi bata do */
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      list.forEach(function (c) { try { c.postMessage({ bp: 'got', at: at }); } catch (x) {} });
    }).catch(function () {})
  ]));
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
