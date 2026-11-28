/* Fedophone service worker: makes the site installable as an app and opens it fast.
   Network first — you always get the newest version when online; fonts stay cached across updates. */
const C='fedophone-v97',FC='fedophone-fonts-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.add('./')).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!==FC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(/\/fonts\/.+\.woff2$/.test(u.pathname)){e.respondWith(caches.open(FC).then(fc=>fc.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();fc.put(r,cp).catch(()=>{})}return res}))));return}
  e.respondWith(fetch(r,r.mode==='navigate'||/.json$/.test(u.pathname)?{cache:'no-cache'}:{}).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(C).then(c=>c.put(r.mode==='navigate'?'./':r,cp)).catch(()=>{})}return res})
    .catch(()=>caches.match(r.mode==='navigate'?'./':r,{ignoreSearch:true}).then(m=>m||caches.match('./'))));
});
