// PWA Utilities para Comando Gólgota

export const registerServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não suportado neste navegador');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registrado com sucesso:', registration.scope);

    // Listener para atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    return true;
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
    return false;
  }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    console.log('Service Worker desregistrado:', result);
    return result;
  } catch (error) {
    console.error('Erro ao desregistrar Service Worker:', error);
    return false;
  }
};

export const updateServiceWorker = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('Service Worker atualizado');
  } catch (error) {
    console.error('Erro ao atualizar Service Worker:', error);
  }
};

export const isAppInstalled = (): boolean => {
  // Verificar se está em modo standalone
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Verificar propriedade standalone do iOS
  const iosStandalone = (window.navigator as any).standalone;
  
  return standalone || iosStandalone;
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

export const addToHomeScreen = async (): Promise<boolean> => {
  const deferredPrompt = (window as any).deferredPrompt;
  
  if (!deferredPrompt) {
    console.warn('Prompt de instalação não disponível');
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('PWA instalado pelo usuário');
      (window as any).deferredPrompt = null;
      return true;
    } else {
      console.log('Usuário dispensou a instalação');
      return false;
    }
  } catch (error) {
    console.error('Erro na instalação:', error);
    return false;
  }
};

export const getInstallInstructions = (): string => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  if (isIOS) {
    return 'Para instalar: toque no ícone de compartilhamento e selecione "Adicionar à Tela de Início"';
  } else if (isAndroid) {
    return 'Para instalar: toque no menu do navegador e selecione "Adicionar à tela inicial"';
  } else {
    return 'Para instalar: use o botão de instalação que aparece na barra de endereços';
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Notificações não suportadas');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Permissão de notificação:', permission);
    return permission;
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return 'denied';
  }
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('Notificações não permitidas');
    return;
  }

  const defaultOptions: NotificationOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'comando-golgota-notification',
    requireInteraction: false,
    ...options
  };

  new Notification(title, defaultOptions);
};

export const clearCache = async (): Promise<void> => {
  if (!('caches' in window)) {
    console.warn('Cache API não suportada');
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('Cache limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
};

export const getStorageEstimate = async (): Promise<StorageEstimate | null> => {
  if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
    console.warn('Storage API não suportada');
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    console.log('Estimativa de armazenamento:', estimate);
    return estimate;
  } catch (error) {
    console.error('Erro ao obter estimativa de armazenamento:', error);
    return null;
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Event listeners para PWA
export const setupPWAListeners = (): void => {
  // Listener para beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });

  // Listener para mudança de conectividade
  window.addEventListener('online', () => {
    window.dispatchEvent(new CustomEvent('pwa-online'));
  });

  window.addEventListener('offline', () => {
    window.dispatchEvent(new CustomEvent('pwa-offline'));
  });

  // Listener para instalação completa
  window.addEventListener('appinstalled', () => {
    console.log('PWA instalado com sucesso');
    (window as any).deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
};