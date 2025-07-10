import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

const PWAUpdateNotification = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    const handleSWUpdate = () => {
      setShowUpdatePrompt(true);
    };

    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-military-black border border-military-gold rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 text-military-gold" />
            <h3 className="text-white font-semibold text-sm">
              Atualização Disponível
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">
          Uma nova versão do Comando Gólgota está disponível. Atualize para obter as últimas funcionalidades.
        </p>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleUpdate}
            className="flex-1 bg-military-gold text-black hover:bg-military-gold/90"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Agora
          </Button>
          
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            size="sm"
          >
            Depois
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;