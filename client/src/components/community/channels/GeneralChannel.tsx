import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Heart, MessageSquare, MoreHorizontal, Reply, Smile } from 'lucide-react';
import { User } from '@/pages/Community';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';

interface GeneralChannelProps {
  user: User;
}

interface Message {
  id: string;
  user_id: string;
  channel: string;
  content: string;
  parent_message_id?: string;
  thread_id?: string;
  reply_count?: number;
  is_thread_starter?: boolean;
  created_at: string;
  author_name?: string;
  author_rank?: string;
  author_company?: string;
  author_avatar?: string;
  isReply?: boolean;
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

const GeneralChannel = ({ user }: GeneralChannelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(0);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/api/messages/general');
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Detecta se o usuário está rolando manualmente
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setIsUserScrolling(!isNearBottom);
    }
  };

  // Detecta novas mensagens e rola automaticamente se apropriado
  useEffect(() => {
    if (messages.length > previousMessageCount.current && previousMessageCount.current > 0) {
      if (isUserScrolling) {
        setHasNewMessages(true);
      } else {
        const timer = setTimeout(() => {
          scrollToBottom();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
    previousMessageCount.current = messages.length;
  }, [messages, isUserScrolling]);

  const scrollToBottomAndClearNotification = () => {
    setHasNewMessages(false);
    setIsUserScrolling(false);
    scrollToBottom();
  };

  // Carrega mensagens iniciais e configura refresh menos frequente
  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
    
    // Auto-refresh messages every 8 seconds (menos frequente)
    const interval = setInterval(() => {
      fetchMessages();
      fetchOnlineUsers();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch('/api/users/online', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && !sending) {
      setSending(true);
      try {
        const messageData: any = { 
          content: newMessage 
        };
        
        // If replying to a message, include thread information
        if (replyingTo) {
          messageData.parent_message_id = replyingTo.id;
          messageData.thread_id = replyingTo.thread_id || replyingTo.id;
        }
        
        await apiPost('/api/messages/general', messageData);
        setNewMessage('');
        
        // No need to expand threads in linear flow
        
        setReplyingTo(null); // Clear reply state
        await fetchMessages();
        
        // Force scroll after sending a message
        setIsUserScrolling(false);
        setTimeout(() => scrollToBottom(), 200);
        
        toast({
          title: replyingTo ? "Resposta enviada" : "Mensagem enviada",
          description: replyingTo 
            ? "Sua resposta foi publicada com sucesso!" 
            : "Sua mensagem foi publicada com sucesso!",
        });
      } catch (error) {
        console.error('Error sending message:', error);
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

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    // Focus on the input field
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    textarea?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const toggleThread = (messageId: string) => {
    const newExpandedThreads = new Set(expandedThreads);
    if (newExpandedThreads.has(messageId)) {
      newExpandedThreads.delete(messageId);
    } else {
      newExpandedThreads.add(messageId);
    }
    setExpandedThreads(newExpandedThreads);
  };

  // Simple chronological order (WhatsApp style)
  const organizedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-military-black">
      {/* Cabeçalho do Canal */}
      <div className="p-4 border-b border-military-gold/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare className="mr-2" size={20} />
              Canal Geral
            </h2>
            <p className="text-gray-400 text-sm">
              Espaço para conversas gerais e informações importantes
            </p>
          </div>
          <Badge className="bg-green-600 text-white">
            {messages.length} mensagens
          </Badge>
        </div>
      </div>

      {/* Usuários Online */}
      <div className="px-4 py-2 border-b border-military-gold/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">
              {onlineUsers.filter(u => u.profile?.name).length} membros conectados
            </span>
          </div>
          <div className="flex -space-x-2">
            {onlineUsers.filter(u => u.profile?.name).slice(0, 5).map((user) => (
              <Avatar key={user.id} className="w-6 h-6 border-2 border-military-black">
                <AvatarImage src={user.profile?.avatar_url} alt={user.profile?.name} />
                <AvatarFallback className="bg-military-gold/20 text-military-gold text-xs">
                  {(user.profile?.name || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {onlineUsers.filter(u => u.profile?.name).length > 5 && (
              <div className="w-6 h-6 rounded-full bg-military-gold/20 border-2 border-military-black flex items-center justify-center">
                <span className="text-xs text-military-gold font-bold">
                  +{onlineUsers.filter(u => u.profile?.name).length - 5}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2 relative"
      >
        {loading ? (
          <div className="text-center text-gray-400 py-8">
            Carregando mensagens...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare className="mx-auto mb-4" size={48} />
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
          </div>
        ) : (
          organizedMessages.map((message) => {
            const isMyMessage = String(message.user_id) === String(user?.id);
            const originalMessage = message.parent_message_id 
              ? messages.find(m => m.id === message.parent_message_id)
              : null;

            return (
              <div 
                key={message.id} 
                className={`mb-4 flex group ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                  
                  {/* Avatar para mensagens de outros (lado esquerdo) */}
                  <div className="flex items-start space-x-3">
                    {!isMyMessage && (
                      <Avatar className="w-8 h-8 border-2 border-military-gold/30 shrink-0 mt-1">
                        <AvatarImage src={message.author_avatar} alt={message.author_name || 'Usuário'} />
                        <AvatarFallback className="bg-military-gold/20 text-military-gold font-semibold text-xs">
                          {(message.author_name || 'U').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1">
                      {/* Nome do usuário (apenas para mensagens de outros) */}
                      {!isMyMessage && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-military-gold font-medium text-sm">
                            {message.author_name || 'Usuário'}
                          </span>
                          <Badge className={`${rankColors[message.author_rank || 'aluno']} text-white text-xs px-1.5 py-0.5`}>
                            {message.author_rank?.toUpperCase() || 'ALUNO'}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Mensagem citada (quando é resposta) */}
                      {originalMessage && (
                        <div className={`mb-2 p-2 rounded-lg border-l-4 text-xs ${
                          isMyMessage 
                            ? 'bg-black/20 border-black/30 text-black/80' 
                            : 'bg-gray-600/50 border-gray-500 text-gray-300'
                        }`}>
                          <div className="flex items-center space-x-1 mb-1">
                            <span className={`font-medium ${
                              isMyMessage ? 'text-black' : 'text-gray-200'
                            }`}>
                              {originalMessage.author_name}
                            </span>
                          </div>
                          <p className="italic truncate">
                            {originalMessage.content}
                          </p>
                        </div>
                      )}
                      
                      {/* Balão da mensagem */}
                      <div className={`rounded-2xl p-3 shadow-lg max-w-full break-words ${
                        isMyMessage 
                          ? 'bg-military-gold text-black rounded-br-md ml-auto' 
                          : 'bg-gray-700 text-white rounded-bl-md'
                      }`}>
                        <p className="leading-relaxed text-sm">
                          {message.content}
                        </p>
                        <div className={`text-xs mt-2 flex items-center justify-end gap-1 ${
                          isMyMessage ? 'text-black/70' : 'text-gray-400'
                        }`}>
                          <span>{formatTime(new Date(message.created_at))}</span>
                          {isMyMessage && (
                            <span className="text-black/60 text-xs">✓✓</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Botões de ação (aparece no hover) */}
                      <div className={`mt-2 flex space-x-2 ${isMyMessage ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-1 h-auto text-xs"
                        >
                          <Heart size={12} className="mr-1" />
                          <span>0</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 p-1 h-auto text-xs"
                          title="Responder mensagem"
                          onClick={() => handleReply(message)}
                        >
                          <Reply size={12} className="mr-1" />
                          <span>Responder</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
        
        {/* Indicador de novas mensagens */}
        {hasNewMessages && isUserScrolling && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={scrollToBottomAndClearNotification}
              className="bg-military-gold hover:bg-military-gold/80 text-black font-medium shadow-lg"
              size="sm"
            >
              <MessageSquare size={16} className="mr-2" />
              Novas mensagens ↓
            </Button>
          </div>
        )}
      </div>

      {/* Input de Nova Mensagem */}
      <div className="p-4 border-t border-military-gold/20 bg-military-black-light/30">
        {/* Reply Banner */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Reply size={16} className="text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">
                  Respondendo para {replyingTo.author_name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelReply}
                className="text-gray-400 hover:text-white p-1 h-auto"
              >
                ×
              </Button>
            </div>
            <div className="bg-military-black-light/50 border border-military-gold/10 rounded p-2">
              <p className="text-gray-400 text-sm truncate">
                {replyingTo.content}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-3 mb-2">
          <Avatar className="w-8 h-8 border-2 border-military-gold/30">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback className="bg-military-gold/20 text-military-gold font-semibold">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-400">
            {replyingTo ? 'Respondendo como' : 'Escrevendo como'} <span className="text-military-gold">{user.name}</span>
          </span>
        </div>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={replyingTo 
                ? `Responder para ${replyingTo.author_name}...`
                : "Digite sua mensagem para o canal geral..."
              }
              className="flex-1 bg-military-black border-military-gold/30 text-white resize-none focus:border-military-gold pr-20"
              rows={replyingTo ? 2 : 3}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-300 p-1 h-auto"
                title="Adicionar emoji"
              >
                <Smile size={16} />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-military-gold hover:bg-military-gold-dark text-black self-end"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-4">
            <p className="text-xs text-gray-400">
              Enter para enviar • Shift+Enter para quebrar linha
            </p>
            {replyingTo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelReply}
                className="text-xs text-gray-500 hover:text-gray-300 p-1 h-auto"
              >
                Cancelar resposta
              </Button>
            )}
          </div>
          <div className="text-xs text-gray-400">
            {newMessage.length}/2000 caracteres
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralChannel;