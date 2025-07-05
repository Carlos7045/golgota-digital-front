import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileText, 
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { User } from '@/pages/Community';
import { AdminView } from '@/pages/AdminDashboard';
import { useState } from 'react';

interface AdminSidebarProps {
  user: User;
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'overview' as AdminView, label: 'Painel Geral', icon: LayoutDashboard },
  { id: 'users' as AdminView, label: 'Usuários', icon: Users },
  { id: 'stats' as AdminView, label: 'Estatísticas', icon: BarChart3 },
  { id: 'content' as AdminView, label: 'Conteúdo', icon: FileText },
  { id: 'events' as AdminView, label: 'Eventos', icon: Calendar },
];

const AdminSidebar = ({ user, activeView, onViewChange, isOpen, onToggle }: AdminSidebarProps) => {
  const [managementOpen, setManagementOpen] = useState(true);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      <aside className={`
        fixed md:relative left-0 top-0 h-full bg-military-black-light border-r border-military-gold/20 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isOpen ? 'w-64' : 'w-0 md:w-16'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-4 border-b border-military-gold/20">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/c4ac806c-d627-45fe-bb9f-9a6d338605a0.png" 
                alt="Comando Gólgota" 
                className="h-8 w-8 object-contain"
              />
              {isOpen && (
                <div>
                  <h2 className="text-military-gold font-bold text-sm">ADMIN PANEL</h2>
                  <p className="text-xs text-gray-400">Comando Gólgota</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div>
              {isOpen && (
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-400 hover:text-white hover:bg-military-gold/20 mb-2"
                  onClick={() => setManagementOpen(!managementOpen)}
                >
                  <span className="text-xs uppercase tracking-wider">Gestão</span>
                  {managementOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </Button>
              )}
              
              {(managementOpen || !isOpen) && (
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`
                        w-full justify-start space-x-3 text-left
                        ${activeView === item.id 
                          ? 'bg-military-gold/20 text-military-gold' 
                          : 'text-gray-300 hover:text-white hover:bg-military-gold/10'
                        }
                      `}
                      onClick={() => onViewChange(item.id)}
                    >
                      <item.icon size={18} />
                      {isOpen && <span>{item.label}</span>}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User info */}
          {isOpen && (
            <div className="p-4 border-t border-military-gold/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-military-gold rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{user.name}</p>
                  <p className="text-gray-400 text-xs">Administrador</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;