
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommunityHeader from '@/components/community/CommunityHeader';
import CommunitySidebar from '@/components/community/CommunitySidebar';
import ChannelContent from '@/components/community/ChannelContent';

export type UserRank = 'aluno' | 'soldado' | 'cabo' | 'sargento' | 'tenente' | 'capitao' | 'major' | 'coronel' | 'comandante' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  rank: UserRank;
  company: string;
}

export type ChannelType = 'geral' | 'treinamentos' | 'acampamentos' | 'ensine-aprenda' | 'eventos' | 'oportunidades' | 'painel-cia';

const Community = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelType>('geral');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-military-black flex">
      <CommunitySidebar 
        user={user}
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col">
        <CommunityHeader 
          user={user}
          activeChannel={activeChannel}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <ChannelContent 
          user={user}
          channel={activeChannel}
        />
      </div>
    </div>
  );
};

export default Community;
