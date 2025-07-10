
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CommunityHeader from '@/components/community/CommunityHeader';
import CommunitySidebar from '@/components/community/CommunitySidebar';
import ChannelContent from '@/components/community/ChannelContent';
import MainContent from '@/components/community/MainContent';
import CompactChat from '@/components/community/CompactChat';
import MobileChatBubble from '@/components/MobileChatBubble';

export type UserRank = 'aluno' | 'soldado' | 'cabo' | 'sargento' | 'tenente' | 'capitao' | 'major' | 'coronel' | 'comandante' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  rank: UserRank;
  company: string;
  avatar_url?: string;
}

export type ChannelType = 'geral' | 'treinamentos' | 'acampamentos' | 'campanhas' | 'ensine-aprenda' | 'eventos' | 'oportunidades' | 'painel-cia' | 'financeiro' | 'direct-messages';

const Community = () => {
  const { user: authUser, profile, roles, loading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelType>('geral');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser && !loading) {
      navigate('/auth');
      return;
    }

    if (authUser && profile) {
      // Convert profile data to User type for backward compatibility
      const isAdmin = roles?.includes('admin') || false;
      
      setUser({
        id: authUser.id,
        name: profile.name || 'Membro',
        email: authUser.email || '',
        rank: isAdmin ? 'admin' : ((profile.rank as UserRank) || 'aluno'),
        company: profile.company || 'Não informada',
        avatar_url: profile.avatar_url
      });
    }
  }, [authUser, profile, roles, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen bg-military-black flex items-center justify-center text-white">
      Carregando...
    </div>;
  }

  return (
    <div className="min-h-screen bg-military-black flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <CommunitySidebar 
          user={user}
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* Mobile Sidebar - Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="absolute left-0 top-0 h-full w-64">
          <CommunitySidebar 
            user={user}
            activeChannel={activeChannel}
            onChannelChange={setActiveChannel}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
      </div>
      
      <div className="flex-1 flex">
        {/* Área Principal - Notícias e Conteúdo */}
        <div className="flex-1 flex flex-col">
          <CommunityHeader 
            user={user}
            activeChannel={activeChannel}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          {/* Conteúdo baseado no canal ativo */}
          <div className="flex-1 overflow-y-auto">
            {activeChannel === 'geral' ? (
              <MainContent user={user} />
            ) : (
              <ChannelContent 
                user={user}
                channel={activeChannel}
              />
            )}
          </div>
        </div>
        
        {/* Desktop Chat Sidebar - Só aparece no canal geral e em desktop */}
        {activeChannel === 'geral' && (
          <div className="hidden lg:block w-80 border-l border-military-gold/20 bg-military-black-light h-screen flex-col">
            <CompactChat user={user} />
          </div>
        )}
      </div>

      {/* Mobile Chat Bubble - Só aparece no canal geral e em mobile */}
      {activeChannel === 'geral' && <MobileChatBubble />}
    </div>
  );
};

export default Community;
