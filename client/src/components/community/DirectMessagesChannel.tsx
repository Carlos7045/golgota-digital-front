import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { User } from '@/pages/Community';
import DirectMessageModal from './DirectMessageModal';

interface DirectMessagesChannelProps {
  user: User;
}

const DirectMessagesChannel = ({ user }: DirectMessagesChannelProps) => {
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full bg-military-black">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-military-gold/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare className="mr-2" size={20} />
              Mensagens Diretas
            </h2>
            <p className="text-gray-400 text-sm">
              Conversas privadas com outros membros
            </p>
          </div>
          <Button 
            onClick={() => setShowNewMessageModal(true)}
            className="bg-military-gold hover:bg-military-gold-dark text-black"
          >
            <Plus size={16} className="mr-2" />
            Nova Conversa
          </Button>
        </div>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2 text-white">Nenhuma conversa ainda</h3>
          <p className="text-sm mb-6 max-w-md mx-auto">
            Conecte-se diretamente com outros membros da comunidade Comando Gólgota através de mensagens privadas seguras
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => setShowNewMessageModal(true)}
              className="bg-military-gold hover:bg-military-gold-dark text-black"
            >
              <Plus size={16} className="mr-2" />
              Iniciar Nova Conversa
            </Button>
            <div className="text-xs text-gray-500">
              Suas conversas são privadas e criptografadas
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Nova Mensagem */}
      <DirectMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        currentUser={user}
      />
    </div>
  );
};

export default DirectMessagesChannel;