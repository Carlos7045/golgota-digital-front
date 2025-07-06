
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  const { user: authUser, loading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelType>('geral');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser && !loading) {
      navigate('/auth');
      return;
    }

    if (authUser) {
      fetchUserProfile();
    }
  }, [authUser, loading, navigate]);

  const fetchUserProfile = async () => {
    if (!authUser) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error) throw error;

      setUser({
        id: authUser.id,
        name: profile.name || authUser.email || 'Usuário',
        email: authUser.email || '',
        rank: (profile.rank as UserRank) || 'aluno',
        company: 'Alpha' // Por enquanto padrão, depois implementaremos companies
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback com dados básicos
      setUser({
        id: authUser.id,
        name: authUser.email || 'Usuário',
        email: authUser.email || '',
        rank: 'aluno',
        company: 'Alpha'
      });
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen bg-military-black flex items-center justify-center text-white">
      Carregando...
    </div>;
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
