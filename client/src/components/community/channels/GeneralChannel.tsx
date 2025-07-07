import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Send, Heart, MessageSquare } from 'lucide-react';
import { User } from '@/pages/Community';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';

interface GeneralChannelProps {
  user: User;
}

interface Message {
  id: string;
  title: string;
  body: string;
  author_id: string;
  created_at: string;
  interactions: number;
  views: number;
  author_name?: string;
  author_rank?: string;
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
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await apiGet('/api/messages/geral');
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

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await apiPost('/api/messages/geral', { content: newMessage });
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

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <Card key={message.id} className="bg-military-black-light border-military-gold/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{message.author_name}</span>
                      <Badge className={`${rankColors[message.author_rank || 'soldado']} text-white text-xs`}>
                        {(message.author_rank || 'soldado').toUpperCase()}
                      </Badge>
                      <span className="text-gray-400 text-sm">Cia {message.author_company || 'Não informada'}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(new Date(message.created_at))} às {formatTime(new Date(message.created_at))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {message.title && message.title !== 'Mensagem no Canal Geral' && (
                  <h4 className="font-semibold text-white mb-2">{message.title}</h4>
                )}
                <p className="text-gray-300 mb-3">{message.body}</p>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 p-1">
                    <Heart size={16} className="mr-1" />
                    {message.interactions || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-military-gold p-1">
                    <MessageSquare size={16} className="mr-1" />
                    {message.views || 0}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Input de Nova Mensagem */}
      <div className="p-4 border-t border-military-gold/20">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-military-black-light border-military-gold/30 text-white resize-none"
            rows={2}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-military-gold hover:bg-military-gold-dark text-black"
          >
            <Send size={18} />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Pressione Enter para enviar, Shift+Enter para quebrar linha
        </p>
      </div>
    </div>
  );
};

export default GeneralChannel;