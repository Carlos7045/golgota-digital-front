
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Send, Heart, MessageSquare, Pin } from 'lucide-react';
import { User } from '@/pages/Community';

interface GeneralChannelProps {
  user: User;
}

const sampleMessages = [
  {
    id: '1',
    author: 'Comandante Silva',
    rank: 'comandante',
    company: 'Alpha',
    content: 'Bem-vindos ao canal geral! Aqui compartilhamos informações importantes e conversamos sobre assuntos gerais do Comando Gólgota.',
    timestamp: new Date('2024-01-15T10:30:00'),
    pinned: true,
    likes: 12,
    replies: 3
  },
  {
    id: '2',
    author: 'Sargento Costa',
    rank: 'sargento',
    company: 'Bravo',
    content: 'Pessoal, não esqueçam de conferir o cronograma de treinamentos para este mês. Há vagas abertas no Rally Missionário!',
    timestamp: new Date('2024-01-15T14:45:00'),
    pinned: false,
    likes: 8,
    replies: 5
  },
  {
    id: '3',
    author: 'Soldado Maria',
    rank: 'soldado',
    company: 'Alpha',
    content: 'Que bênção foi o último acampamento! Já estou ansiosa pelo próximo. A experiência na selva foi transformadora 🙏',
    timestamp: new Date('2024-01-15T16:20:00'),
    pinned: false,
    likes: 15,
    replies: 7
  }
];

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

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Enviando mensagem:', newMessage);
      setNewMessage('');
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
            {sampleMessages.length} mensagens
          </Badge>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sampleMessages.map((message) => (
          <Card key={message.id} className={`bg-military-black-light border-military-gold/20 ${message.pinned ? 'border-military-gold/50' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{message.author}</span>
                    <Badge className={`${rankColors[message.rank]} text-white text-xs`}>
                      {message.rank.toUpperCase()}
                    </Badge>
                    <span className="text-gray-400 text-sm">Cia {message.company}</span>
                  </div>
                  {message.pinned && (
                    <Pin size={16} className="text-military-gold" />
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(message.timestamp)} às {formatTime(message.timestamp)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-3">{message.content}</p>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 p-1">
                  <Heart size={16} className="mr-1" />
                  {message.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-military-gold p-1">
                  <MessageSquare size={16} className="mr-1" />
                  {message.replies}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
