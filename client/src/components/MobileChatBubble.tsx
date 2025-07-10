import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Message {
  id: string;
  user_id: string;
  channel: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
}

const MobileChatBubble: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar mensagens do canal geral
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['/api/messages', 'general'],
    refetchInterval: isExpanded ? 3000 : 15000, // Mais frequente quando expandido
  });

  // Buscar usuários online
  const { data: onlineUsers = [] } = useQuery<OnlineUser[]>({
    queryKey: ['/api/users/online'],
    refetchInterval: 60000,
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/messages/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      setIsSending(false);
      queryClient.invalidateQueries({ queryKey: ['/api/messages', 'general'] });
      refetchMessages();
    },
    onError: () => {
      setIsSending(false);
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    sendMessageMutation.mutate(newMessage.trim());
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Bubble collapsed (floating button)
  if (!isExpanded) {
    const unreadCount = messages.length > 0 ? Math.min(messages.length, 9) : 0;
    
    return (
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button
          onClick={toggleExpanded}
          className="h-14 w-14 rounded-full bg-military-gold text-black hover:bg-military-gold/90 shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  // Expanded full screen chat
  return (
    <div className="fixed inset-0 bg-military-black z-50 md:hidden flex flex-col">
      {/* Header */}
      <div className="bg-military-black-light border-b border-military-gold/20 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6 text-military-gold" />
          <div>
            <h2 className="text-white font-semibold">Chat Geral</h2>
            <p className="text-gray-400 text-sm flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {onlineUsers.length} online
            </p>
          </div>
        </div>
        <Button
          onClick={toggleExpanded}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma mensagem ainda</p>
            <p className="text-sm">Seja o primeiro a conversar!</p>
          </div>
        ) : (
          messages.map((message: Message) => {
            const isOwn = message.user_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-military-gold text-black rounded-br-sm'
                      : 'bg-gray-800 text-white rounded-bl-sm'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs text-gray-400 mb-1">
                      {message.user?.name || 'Usuário'}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-black/70' : 'text-gray-400'}`}>
                    {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="border-t border-military-gold/20 p-4 bg-military-black-light">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            disabled={isSending}
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-military-gold text-black hover:bg-military-gold/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
          <span>{newMessage.length}/500</span>
          {isSending && <span className="text-military-gold">Enviando...</span>}
        </div>
      </div>
    </div>
  );
};

export default MobileChatBubble;