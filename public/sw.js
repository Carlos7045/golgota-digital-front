// Service Worker para Comando Gólgota PWA
const CACHE_NAME = 'comando-golgota-v1.0.0';
const STATIC_CACHE_NAME = 'comando-golgota-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'comando-golgota-dynamic-v1.0.0';

// Recursos essenciais para cache (funcionalidade offline básica)
const ESSENTIAL_RESOURCES = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Recursos para pré-cache (assets estáticos)
const STATIC_RESOURCES = [
  '/assets/index.css',
  '/assets/index.js'
];

// URLs da API que devem ser cacheadas
const API_CACHE_PATTERNS = [
  '/api/profile',
  '/api/users/online',
  '/api/messages/general'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache recursos essenciais
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('📦 Cacheando recursos essenciais...');
        return cache.addAll(ESSENTIAL_RESOURCES);
      }),
      
      // Pular espera para ativar imediatamente
      self.skipWaiting()
    ])
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Ativando...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar controle de todas as abas
      self.clients.claim()
    ])
  );
});

// Interceptar requests
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorar requests não HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Estratégia Cache First para recursos estáticos
  if (isStaticResource(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Estratégia Network First para API calls
  if (isApiRequest(request)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Estratégia Stale While Revalidate para páginas
  event.respondWith(staleWhileRevalidateStrategy(request));
});

// Verificar se é recurso estático
function isStaticResource(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/assets/') || 
         url.pathname.includes('/icons/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.ico');
}

// Verificar se é request da API
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Estratégia Cache First (para recursos estáticos)
async function cacheFirstStrategy(request) {
  try {
    // Tentar buscar no cache primeiro
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não estiver no cache, buscar na rede
    const networkResponse = await fetch(request);
    
    // Cachear a resposta se for bem-sucedida
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First falhou:', error);
    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Estratégia Network First (para API calls)
async function networkFirstStrategy(request) {
  try {
    // Tentar buscar na rede primeiro
    const networkResponse = await fetch(request);
    
    // Cachear apenas respostas GET bem-sucedidas
    if (request.method === 'GET' && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🔄 Network falhou, tentando cache:', request.url);
    
    // Se a rede falhar, tentar buscar no cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar resposta de erro se não houver cache
    return new Response(
      JSON.stringify({ 
        error: 'Dados não disponíveis offline',
        offline: true 
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia Stale While Revalidate (para páginas)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Buscar na rede em background  
  const networkPromise = fetch(request).then(networkResponse => {
    // Only cache GET requests with successful responses
    if (networkResponse.status === 200 && request.method === 'GET') {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Falhou na rede, retornar cache se disponível
    return cachedResponse;
  });
  
  // Retornar cache imediatamente se disponível, senão esperar rede
  return cachedResponse || networkPromise;
}

// Listener para mensagens do cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Forçar atualização de cache
    event.waitUntil(updateCaches());
  }
});

// Atualizar caches programaticamente
async function updateCaches() {
  console.log('🔄 Atualizando caches...');
  
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    await cache.addAll(ESSENTIAL_RESOURCES);
    console.log('✅ Caches atualizados');
  } catch (error) {
    console.error('❌ Erro ao atualizar caches:', error);
  }
}

// Listener para sync em background (quando voltar online)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

// Handle background sync
async function handleBackgroundSync() {
  console.log('🔄 Background sync executado');
  // Aqui você pode implementar lógica para sincronizar dados quando voltar online
}

// Listener para notificações push
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nova mensagem na comunidade',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'comando-golgota-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icons/icon-96x96.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Comando Gólgota', options)
    );
  }
});

// Listener para cliques em notificações
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🚀 Service Worker carregado - Comando Gólgota PWA');