import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Plus, 
  Send, 
  Search,
  ArrowLeft
} from 'lucide-react';
import { User } from '@/pages/Community';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';

interface DirectMessagesPanelProps {
  user: User;
}

interface Conversation {
  id: string;
  other_user: {
    id: string;
    name: string;
    avatar_url?: string;
    rank: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    user_id: string;
  };
  unread_count: number;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  conversation_id: string;
  created_at: string;
  user_name: string;
  avatar_url?: string;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar_url?: string;
  rank: string;
}

const DirectMessagesPanel = ({ user }: DirectMessagesPanelProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
    loadOnlineUsers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const data = await apiGet('/api/conversations');
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const data = await apiGet(`/api/conversations/${conversationId}/messages`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens da conversa.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await apiGet('/api/users/online');
      const users = (response.users || []).filter((u: OnlineUser) => u.id !== user.id);
      setOnlineUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários online:', error);
    }
  };

  const startNewConversation = async (otherUserId: string) => {
    try {
      const data = await apiPost('/api/conversations', { other_user_id: otherUserId });
      const newConversation = data.conversation;
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setIsNewChatDialogOpen(false);
      
      toast({
        title: "Conversa iniciada",
        description: `Conversa com ${newConversation.other_user.name} iniciada com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      toast({
        title: "Erro ao iniciar conversa",
        description: "Não foi possível iniciar a conversa.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      await apiPost(`/api/conversations/${selectedConversation.id}/messages`, { 
        content: newMessage 
      });
      
      setNewMessage('');
      await loadMessages(selectedConversation.id);
      await loadConversations(); // Atualizar lista para mostrar última mensagem
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
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageDate.toLocaleDateString('pt-BR');
  };

  const filteredUsers = onlineUsers.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (selectedConversation) {
    return (
      <div className="h-full flex flex-col bg-military-black-light">
        {/* Header da conversa */}
        <div className="p-4 border-b border-military-gold/20">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversation(null)}
              className="text-military-gold hover:bg-military-gold/10"
            >
              <ArrowLeft size={16} />
            </Button>
            <Avatar className="w-8 h-8 border border-military-gold/30">
              <AvatarImage src={selectedConversation.other_user.avatar_url || ''} />
              <AvatarFallback className="bg-military-gold text-black text-sm">
                {selectedConversation.other_user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium text-sm">{selectedConversation.other_user.name}</p>
              <p className="text-gray-400 text-xs">{selectedConversation.other_user.rank}</p>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-center text-gray-400">Carregando mensagens...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="mx-auto mb-2" size={32} />
                  <p className="text-sm">Inicie a conversa!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMyMessage = message.user_id === user.id;
                  
                  return (
                    <div key={message.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        isMyMessage 
                          ? 'bg-military-gold text-black' 
                          : 'bg-military-black border border-military-gold/20 text-white'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`text-xs mt-1 ${
                          isMyMessage ? 'text-black/70' : 'text-gray-400'
                        }`}>
                          {formatTime(message.created_at)}
                          {isMyMessage && <span className="ml-1">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input de mensagem */}
        <div className="p-4 border-t border-military-gold/20">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={sending}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-military-black border-military-gold/30 text-white placeholder-gray-400"
            />
            <Button 
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              size="sm"
              className="bg-military-gold hover:bg-military-gold/90 text-black"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-military-black-light">
      {/* Header */}
      <div className="p-4 border-b border-military-gold/20">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-military-gold flex items-center">
            <MessageCircle className="mr-2" size={20} />
            Mensagens Diretas
          </h3>
          <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-military-gold hover:bg-military-gold/90 text-black"
              >
                <Plus size={16} className="mr-1" />
                Nova Conversa
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-military-black-light border-military-gold/30 text-white">
              <DialogHeader>
                <DialogTitle className="text-military-gold">Iniciar Nova Conversa</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Buscar usuário..."
                    className="pl-10 bg-military-black border-military-gold/30 text-white"
                  />
                </div>
                
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredUsers.length === 0 ? (
                      <p className="text-center text-gray-400 py-4">Nenhum usuário encontrado</p>
                    ) : (
                      filteredUsers.map((onlineUser) => (
                        <div
                          key={onlineUser.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-military-black hover:bg-military-gold/10 cursor-pointer"
                          onClick={() => startNewConversation(onlineUser.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8 border border-military-gold/30">
                              <AvatarImage src={onlineUser.avatar_url || ''} />
                              <AvatarFallback className="bg-military-gold text-black text-sm">
                                {onlineUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium text-sm">{onlineUser.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {onlineUser.rank}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-military-gold">
                            <MessageCircle size={16} />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <MessageCircle className="mx-auto mb-2" size={32} />
                <p className="text-sm">Nenhuma conversa ainda.</p>
                <p className="text-xs mt-1">Clique em "Nova Conversa" para começar!</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center p-3 rounded-lg bg-military-black hover:bg-military-gold/10 cursor-pointer border border-military-gold/20"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <Avatar className="w-10 h-10 mr-3 border border-military-gold/30">
                    <AvatarImage src={conversation.other_user.avatar_url || ''} />
                    <AvatarFallback className="bg-military-gold text-black">
                      {conversation.other_user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium text-sm truncate">
                        {conversation.other_user.name}
                      </p>
                      {conversation.last_message && (
                        <span className="text-xs text-gray-400">
                          {formatTime(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs truncate">
                        {conversation.last_message?.content || 'Inicie a conversa...'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <Badge className="bg-military-gold text-black text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DirectMessagesPanel;