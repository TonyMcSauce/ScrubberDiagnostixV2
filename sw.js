const VERSION='scrubberdx-v6.5';
const CACHE=`static-${VERSION}`;

const ASSETS=[
'./',
'./index.html',
'./css/styles.css',
'./js/app.js',
'./js/data.js',
'./js/ui.js'
];

self.addEventListener('install',event=>{

self.skipWaiting();

event.waitUntil(
caches.open(CACHE).then(cache=>cache.addAll(ASSETS))
);

});

self.addEventListener('activate',event=>{

event.waitUntil(
caches.keys().then(keys=>
Promise.all(
keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))
)
)
);

self.clients.claim();

});

self.addEventListener('fetch',event=>{

if(event.request.mode==='navigate'){

event.respondWith(
fetch(event.request)
.then(response=>{

const copy=response.clone();

caches.open(CACHE).then(cache=>cache.put(event.request,copy));

return response;

})
.catch(()=>caches.match(event.request))
);

return;

}

event.respondWith(
caches.match(event.request).then(cache=>{
return cache || fetch(event.request);
})
);

});