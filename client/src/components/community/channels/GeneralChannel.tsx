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
  created_at: string;
  author_name?: string;
  author_rank?: string;
  author_company?: string;
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

const GeneralChannel = ({ user }: GeneralChannelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-refresh messages every 5 seconds for better real-time experience
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
      fetchOnlineUsers();
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    fetchOnlineUsers();
    
    // Auto-refresh messages every 3 seconds for real-time feel
    const interval = setInterval(() => {
      fetchMessages();
      fetchOnlineUsers();
    }, 3000);
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
        await apiPost('/api/messages/general', { content: newMessage });
        setNewMessage('');
        await fetchMessages();
        
        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi publicada com sucesso!",
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
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
          messages.map((message) => (
            <div key={message.id} className="group hover:bg-military-black-light/30 p-3 rounded-lg transition-all duration-200">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10 border-2 border-military-gold/30 shrink-0">
                  <AvatarImage src={message.author_avatar} alt={message.author_name || 'Usuário'} />
                  <AvatarFallback className="bg-military-gold/20 text-military-gold font-semibold">
                    {(message.author_name || 'U').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-military-gold font-medium hover:underline cursor-pointer">
                      {message.author_name || 'Usuário'}
                    </span>
                    <Badge className={`${rankColors[message.author_rank || 'aluno']} text-white text-xs px-2 py-0.5`}>
                      {message.author_rank?.toUpperCase() || 'ALUNO'}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(new Date(message.created_at))} às {formatTime(new Date(message.created_at))}
                    </span>
                  </div>
                  
                  <div className="bg-military-black-light/80 border border-military-gold/20 rounded-lg p-3 mb-2">
                    <p className="text-gray-300 leading-relaxed">{message.content}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-1 h-auto"
                    >
                      <Heart size={16} className="mr-1" />
                      <span className="text-sm">{message.interactions || 0}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 p-1 h-auto"
                      title="Responder mensagem"
                    >
                      <Reply size={16} className="mr-1" />
                      <span className="text-sm">Responder</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-300 hover:bg-gray-400/10 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Nova Mensagem */}
      <div className="p-4 border-t border-military-gold/20 bg-military-black-light/30">
        <div className="flex items-center space-x-3 mb-2">
          <Avatar className="w-8 h-8 border-2 border-military-gold/30">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback className="bg-military-gold/20 text-military-gold font-semibold">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-400">
            Escrevendo como <span className="text-military-gold">{user.name}</span>
          </span>
        </div>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem para o canal geral..."
              className="flex-1 bg-military-black border-military-gold/30 text-white resize-none focus:border-military-gold pr-20"
              rows={3}
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
          <p className="text-xs text-gray-400">
            Enter para enviar • Shift+Enter para quebrar linha
          </p>
          <div className="text-xs text-gray-400">
            {newMessage.length}/2000 caracteres
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralChannel;