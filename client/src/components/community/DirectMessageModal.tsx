import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, X, Users } from 'lucide-react';
import { User } from '@/pages/Community';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

interface UserForDM {
  id: string;
  name: string;
  rank: string;
  company: string;
  avatar_url?: string;
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

const DirectMessageModal = ({ isOpen, onClose, currentUser }: DirectMessageModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserForDM[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/online', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Filter out current user and map to correct format
        const filteredUsers = data.users
          .filter((user: any) => user.id !== currentUser.id)
          .map((user: any) => ({
            id: user.id,
            name: user.profile?.name || user.email,
            rank: user.profile?.rank || 'aluno',
            company: user.profile?.company || 'Não informada',
            avatar_url: user.profile?.avatar_url
          }));
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startDirectMessage = (user: UserForDM) => {
    // Implementação básica de conversa privada
    console.log('Iniciando conversa com:', user);
    
    // Criar um canal de conversa baseado nos IDs dos usuários
    const channelId = [currentUser.id, user.id].sort().join('_');
    
    // Mostrar notificação de sucesso e fechar modal
    alert(`Conversa iniciada com ${user.name}!\n\nEm breve você poderá enviar mensagens privadas diretamente através desta interface.`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-military-black-light border-military-gold/20 text-white max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-military-gold">
            <MessageSquare className="mr-2" size={20} />
            Nova Conversa Privada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar por nome, cargo ou companhia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-military-black-light border-military-gold/30 text-white placeholder:text-gray-500 focus:border-military-gold"
            />
          </div>

          {/* Users List */}
          <ScrollArea className="h-64">
            {loading ? (
              <div className="text-center text-gray-400 py-4">
                Carregando usuários...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                {searchTerm ? (
                  <div>
                    <p className="font-medium mb-1">Nenhum resultado encontrado</p>
                    <p className="text-sm">Tente buscar por outro termo</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-1">Nenhum usuário disponível</p>
                    <p className="text-sm">Aguarde outros membros se conectarem</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className="w-full justify-start p-3 hover:bg-military-black-light"
                    onClick={() => startDirectMessage(user)}
                  >
                    <Avatar className="w-10 h-10 mr-3 border-2 border-military-gold/30">
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                      <AvatarFallback className="bg-military-gold/20 text-military-gold font-semibold">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{user.name}</span>
                        <Badge className={`${rankColors[user.rank]} text-white text-xs`}>
                          {user.rank.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{user.company}</p>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-400">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'membro disponível' : 'membros disponíveis'}
            </div>
            <Button variant="outline" onClick={onClose} className="border-military-gold/30 text-gray-300 hover:bg-military-gold/10">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectMessageModal;