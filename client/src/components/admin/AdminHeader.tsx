import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, LogOut, Settings, ArrowLeft } from 'lucide-react';
import { User } from '@/pages/Community';
import { AdminView } from '@/pages/AdminDashboard';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  user: User;
  activeView: AdminView;
  onMenuToggle: () => void;
}

const viewNames: Record<AdminView, string> = {
  'overview': 'Painel Geral',
  'users': 'Gestão de Usuários',
  'stats': 'Estatísticas',
  'content': 'Gestão de Conteúdo',
  'events': 'Gestão de Eventos',
  'financial': 'Controle Financeiro',
  'companies': 'Gestão de Companhias'
};

const AdminHeader = ({ user, activeView, onMenuToggle }: AdminHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    localStorage.clear();
    navigate('/');
  };

  const handleBackToCommunity = () => {
    navigate('/comunidade');
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
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToCommunity}
          className="text-gray-400 hover:text-white hover:bg-military-gold/20"
        >
          <ArrowLeft size={16} className="mr-2" />
          Comunidade
        </Button>
        
        <div>
          <h1 className="text-xl font-bold text-white">
            {viewNames[activeView]}
          </h1>
          <p className="text-sm text-gray-400">
            Painel Administrativo - Comando Gólgota
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-white font-medium hidden sm:block">{user.name}</span>
          <Badge className="bg-military-gold text-black text-xs uppercase font-bold">
            ADMIN
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
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

export default AdminHeader;