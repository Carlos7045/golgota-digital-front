import { useEffect } from 'react';
import { registerServiceWorker, setupPWAListeners } from '@/utils/pwa-utils';
import PWAInstallPrompt from './PWAInstallPrompt';
import PWAUpdateNotification from './PWAUpdateNotification';

const PWAWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Registrar Service Worker quando o componente montar
    registerServiceWorker();
    
    // Configurar listeners PWA
    setupPWAListeners();
    
    // Log para debug
    console.log('🚀 PWA Wrapper inicializado - Comando Gólgota');
  }, []);

  return (
    <>
      {children}
      <PWAInstallPrompt />
      <PWAUpdateNotification />
    </>
  );
};

export default PWAWrapper;