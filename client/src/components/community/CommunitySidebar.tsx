
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  MessageSquare,
  GraduationCap, 
  Tent, 
  BookOpen, 
  Calendar, 
  Briefcase, 
  Shield,
  X,
  Users,
  DollarSign,
  Heart
} from 'lucide-react';
import { User, ChannelType } from '@/pages/Community';
import { cn } from '@/lib/utils';

interface CommunitySidebarProps {
  user: User;
  activeChannel: ChannelType;
  onChannelChange: (channel: ChannelType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const channels = [
  { id: 'geral' as ChannelType, name: 'Geral', icon: MessageCircle, description: 'Conversas gerais', minRank: 'aluno' },
  { id: 'treinamentos' as ChannelType, name: 'Treinamentos', icon: GraduationCap, description: 'Rally, CPLG, FEG', minRank: 'aluno' },
  { id: 'acampamentos' as ChannelType, name: 'Acampamentos', icon: Tent, description: 'Acampamento Gólgota', minRank: 'aluno' },
  { id: 'campanhas' as ChannelType, name: 'Campanhas', icon: Heart, description: 'Campanhas sociais e doações', minRank: 'soldado' },
  { id: 'ensine-aprenda' as ChannelType, name: 'Ensine/Aprenda', icon: BookOpen, description: 'Compartilhe conhecimento', minRank: 'soldado' },
  { id: 'eventos' as ChannelType, name: 'Eventos', icon: Calendar, description: 'Zoom e encontros', minRank: 'soldado' },
  { id: 'financeiro' as ChannelType, name: 'Financeiro', icon: DollarSign, description: 'Mensalidades e pagamentos', minRank: 'aluno' },
  { id: 'oportunidades' as ChannelType, name: 'Oportunidades', icon: Briefcase, description: 'Vagas e cruzadas', minRank: 'cabo' },
  { id: 'painel-cia' as ChannelType, name: 'Painel da Cia', icon: Shield, description: 'Área de comandantes', minRank: 'comandante' },
];

const rankHierarchy = {
  'aluno': 0,
  'soldado': 1,
  'cabo': 2,
  'sargento': 3,
  'tenente': 4,
  'capitao': 5,
  'major': 6,
  'coronel': 7,
  'comandante': 8,
  'admin': 9
};

const CommunitySidebar = ({ user, activeChannel, onChannelChange, isOpen, onToggle }: CommunitySidebarProps) => {
  const canAccessChannel = (minRank: string) => {
    return rankHierarchy[user.rank] >= rankHierarchy[minRank as keyof typeof rankHierarchy];
  };

  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // Fetch real online count
    const fetchOnlineCount = async () => {
      try {
        const response = await fetch('/api/users/online', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setOnlineCount(data.count || 1);
        }
      } catch (error) {
        console.error('Error fetching online count:', error);
        setOnlineCount(1); // Show at least current user
      }
    };

    fetchOnlineCount();
    // Update every 30 seconds
    const interval = setInterval(fetchOnlineCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 w-80 bg-military-black-light border-r border-military-gold/20 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-military-gold/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/c4ac806c-d627-45fe-bb9f-9a6d338605a0.png" 
                  alt="Comando Gólgota" 
                  className="h-8 w-8"
                />
                <div>
                  <h2 className="text-lg font-bold text-military-gold">COMANDO GÓLGOTA</h2>
                  <p className="text-xs text-gray-400">Comunidade Interna</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-gray-400 hover:text-white md:hidden"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-green-500" />
                <span className="text-sm text-gray-300">{onlineCount} online</span>
              </div>
              <Badge variant="outline" className="border-military-gold/50 text-military-gold text-xs">
                Cia {user.company}
              </Badge>
            </div>
          </div>

          {/* Canais */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Canais
              </h3>
              
              {channels.map((channel) => {
                const hasAccess = canAccessChannel(channel.minRank);
                const Icon = channel.icon;
                
                return (
                  <Button
                    key={channel.id}
                    variant={activeChannel === channel.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start p-3 h-auto",
                      activeChannel === channel.id 
                        ? "bg-military-gold/20 text-military-gold border-l-4 border-military-gold" 
                        : hasAccess 
                          ? "text-gray-300 hover:text-white hover:bg-military-gold/10" 
                          : "text-gray-600 cursor-not-allowed",
                    )}
                    onClick={() => hasAccess && onChannelChange(channel.id)}
                    disabled={!hasAccess}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Icon size={18} />
                      <div className="flex-1 text-left">
                        <div className="font-medium"># {channel.name}</div>
                        <div className="text-xs opacity-70">{channel.description}</div>
                      </div>
                      {!hasAccess && (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-600">
                          {channel.minRank}+
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            <Separator className="my-4 bg-military-gold/20" />

            {/* Mensagens Diretas */}
            <div className="space-y-2 mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Mensagens Diretas
              </h3>
              <Button
                variant={activeChannel === 'direct-messages' ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start p-3 h-auto",
                  activeChannel === 'direct-messages' 
                    ? "bg-military-gold/20 text-military-gold border-l-4 border-military-gold" 
                    : "text-gray-300 hover:text-white hover:bg-military-gold/10"
                )}
                onClick={() => onChannelChange('direct-messages')}
              >
                <div className="flex items-center space-x-3 w-full">
                  <MessageSquare size={18} />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Conversas Privadas</div>
                    <div className="text-xs opacity-70">Mensagens diretas</div>
                  </div>
                </div>
              </Button>
            </div>

            <Separator className="my-4 bg-military-gold/20" />

            {/* Status do usuário */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Seu Status
              </h3>
              <div className="bg-military-black rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-white">{user.name}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Patente: <span className="text-military-gold">{user.rank.toUpperCase()}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Companhia: <span className="text-military-gold">{user.company}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunitySidebar;
