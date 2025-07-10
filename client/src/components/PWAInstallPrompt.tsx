import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar se já está em modo standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Event listener para capturar o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt de instalação apenas se não estiver instalado
      if (!standalone) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificar se deve mostrar instruções para iOS
    if (iOS && !standalone) {
      const hasSeenIOSPrompt = localStorage.getItem('ios-install-prompt-seen');
      if (!hasSeenIOSPrompt) {
        setShowInstallPrompt(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA instalado com sucesso');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Erro na instalação do PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    
    // Para iOS, marcar que o usuário já viu o prompt
    if (isIOS) {
      localStorage.setItem('ios-install-prompt-seen', 'true');
    }
  };

  // Não mostrar se já estiver instalado
  if (isStandalone) return null;

  // Não mostrar se o usuário dispensou
  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-military-black border border-military-gold rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-military-gold" />
            <h3 className="text-white font-semibold text-sm">
              Instalar Comando Gólgota
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
          {isIOS 
            ? 'Para instalar o app, toque no botão compartilhar e selecione "Adicionar à Tela de Início"'
            : 'Instale o app para acesso rápido e funcionamento offline'
          }
        </p>
        
        {!isIOS && deferredPrompt && (
          <Button
            onClick={handleInstallClick}
            className="w-full bg-military-gold text-black hover:bg-military-gold/90"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Instalar App
          </Button>
        )}
        
        {isIOS && (
          <div className="text-xs text-gray-400 space-y-1">
            <p>1. Toque no ícone <span className="font-mono">⎙</span> na barra inferior</p>
            <p>2. Selecione "Adicionar à Tela de Início"</p>
            <p>3. Toque em "Adicionar"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;