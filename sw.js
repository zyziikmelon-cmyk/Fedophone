/* Fedophone service worker: makes the site installable as an app and opens it fast.
   Network first — you always get the newest version when online; the saved copy is only a fallback. */
const C='fedophone-v16';
const FONTS=['./fonts/caveat-cyrillic-12c256.woff2','./fonts/caveat-latin-14ecf1.woff2','./fonts/comfortaa-cyrillic-8c22e4.woff2','./fonts/comfortaa-latin-334b70.woff2','./fonts/inter-cyrillic-4ee8fc.woff2','./fonts/inter-latin-567244.woff2','./fonts/lobster-cyrillic-e238fd.woff2','./fonts/lobster-latin-920519.woff2','./fonts/montserrat-cyrillic-79ee10.woff2','./fonts/montserrat-latin-e56e84.woff2','./fonts/nunito-cyrillic-373a90.woff2','./fonts/nunito-latin-798ec6.woff2','./fonts/pressstart2p-cyrillic-611ac5.woff2','./fonts/pressstart2p-latin-3d97f0.woff2','./fonts/unbounded-cyrillic-c86556.woff2','./fonts/unbounded-latin-06f2e4.woff2'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./fonts.css','./manifest.webmanifest','./icon-192.png'].concat(FONTS))).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(/\/fonts\/.+\.woff2$/.test(u.pathname)){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})));return}
  e.respondWith(fetch(r,r.mode==='navigate'||/.json$/.test(u.pathname)?{cache:'no-cache'}:{}).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(C).then(c=>c.put(r.mode==='navigate'?'./':r,cp)).catch(()=>{})}return res})
    .catch(()=>caches.match(r.mode==='navigate'?'./':r,{ignoreSearch:true}).then(m=>m||caches.match('./'))));
});
