import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, MessageSquare, Users, Minimize2, Maximize2 } from 'lucide-react';
import { User } from '@/pages/Community';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';

interface CompactChatProps {
  user: User;
}

interface Message {
  id: string;
  user_id: string;
  channel: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_rank?: string;
  author_avatar?: string;
}

const rankColors: Record<string, string> = {
  'aluno': 'bg-gray-500',
  'soldado': 'bg-green-600',
  'cabo': 'bg-green-700',
  'sargento': 'bg-blue-600',
  'tenente': 'bg-blue-700',
  'capitao': 'bg-purple-600',
  'major': 'bg-purple-700',
  'coronel': 'bg-red-600',
  'comandante': 'bg-red-700',
  'admin': 'bg-military-gold'
};

const CompactChat = ({ user }: CompactChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    loadOnlineCount();

    // Auto-refresh menos frequente
    const interval = setInterval(() => {
      loadMessages();
      loadOnlineCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await apiGet('/api/messages/general');
      const latestMessages = (data.messages || []).slice(-20); // Últimas 20 mensagens
      
      if (JSON.stringify(latestMessages) !== JSON.stringify(messages)) {
        setMessages(latestMessages);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const loadOnlineCount = async () => {
    try {
      const response = await fetch('/api/users/online', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setOnlineCount(data.users?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários online:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && !sending) {
      setSending(true);
      try {
        await apiPost('/api/messages/general', { content: newMessage });
        setNewMessage('');
        await loadMessages();
        scrollToBottom();
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast({
          title: "Erro ao enviar mensagem",
          description: "Não foi possível enviar a mensagem.",
          variant: "destructive"
        });
      } finally {
        setSending(false);
      }
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col bg-military-black-light min-h-0">
      {/* Header do Chat - Fixo */}
      <div className="flex-shrink-0 p-4 border-b border-military-gold/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="text-military-gold" size={18} />
            <span className="text-white font-medium">Chat Geral</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-400">{onlineCount}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white p-1 h-auto"
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </Button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Mensagens - Área scrollável que cresce */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <MessageSquare className="mx-auto mb-2" size={32} />
                    <p className="text-sm">Nenhuma mensagem ainda.</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMyMessage = String(message.user_id) === String(user?.id);
                    
                    return (
                      <div key={message.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                          {!isMyMessage && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="w-5 h-5 border border-military-gold/30">
                                <AvatarImage src={message.author_avatar} alt={message.author_name || 'U'} />
                                <AvatarFallback className="bg-military-gold/20 text-military-gold text-xs">
                                  {(message.author_name || 'U').substring(0, 1).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-military-gold text-xs font-medium">
                                {message.author_name}
                              </span>
                              <Badge className={`${rankColors[message.author_rank || 'aluno']} text-white text-xs px-1 py-0`}>
                                {(message.author_rank || 'aluno').toUpperCase()}
                              </Badge>
                            </div>
                          )}
                          
                          <div className={`rounded-lg p-2 text-sm ${
                            isMyMessage 
                              ? 'bg-military-gold text-black ml-auto' 
                              : 'bg-gray-700 text-white'
                          }`}>
                            <p className="leading-relaxed">{message.content}</p>
                            <div className={`text-xs mt-1 ${
                              isMyMessage ? 'text-black/70' : 'text-gray-400'
                            }`}>
                              {formatTime(message.created_at)}
                              {isMyMessage && <span className="ml-1">✓</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input de Mensagem - Fixo na parte inferior */}
          <div className="flex-shrink-0 p-3 border-t border-military-gold/20 bg-military-black-light">
            <div className="flex space-x-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="flex-1 min-h-[36px] max-h-[72px] resize-none bg-military-black border-military-gold/30 text-white placeholder-gray-400 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                size="sm"
                className="bg-military-gold hover:bg-military-gold/90 text-black px-3"
              >
                <Send size={14} />
              </Button>
            </div>
            
            {/* Character count */}
            <div className="text-xs text-gray-500 mt-1 text-right">
              {newMessage.length}/500
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompactChat;