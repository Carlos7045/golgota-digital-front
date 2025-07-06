
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { User, ChannelType } from '@/pages/Community';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CommunityHeaderProps {
  user: User;
  activeChannel: ChannelType;
  onMenuToggle: () => void;
}

const channelNames: Record<ChannelType, string> = {
  'geral': 'Geral',
  'treinamentos': 'Treinamentos',
  'acampamentos': 'Acampamentos',
  'ensine-aprenda': 'Ensine/Aprenda',
  'eventos': 'Eventos',
  'oportunidades': 'Oportunidades',
  'painel-cia': 'Painel da Cia'
};

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

const CommunityHeader = ({ user, activeChannel, onMenuToggle }: CommunityHeaderProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-military-black-light border-b border-military-gold/20 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="text-white hover:bg-military-gold/20 md:hidden"
        >
          <Menu size={20} />
        </Button>
        
        <div>
          <h1 className="text-xl font-bold text-white">
            #{channelNames[activeChannel]}
          </h1>
          <p className="text-sm text-gray-400">
            Comando Gólgota - Comunidade Interna
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-white font-medium hidden sm:block">{user.name}</span>
          <Badge className={`${rankColors[user.rank]} text-white text-xs uppercase`}>
            {user.rank}
          </Badge>
          <span className="text-gray-400 text-sm hidden md:block">Cia {user.company}</span>
        </div>

        <div className="flex items-center space-x-2">
          {user.rank === 'admin' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="text-military-gold hover:text-white hover:bg-military-gold/20"
            >
              <Settings size={16} />
              <span className="ml-1 hidden sm:block">Admin</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/perfil')}
            className="text-gray-400 hover:text-white hover:bg-military-gold/20"
          >
            <UserIcon size={16} />
            <span className="ml-1 hidden sm:block">Perfil</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-military-gold/20"
          >
            <Settings size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-white hover:bg-red-600/20"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default CommunityHeader;
