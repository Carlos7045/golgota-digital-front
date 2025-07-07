import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/pages/Community';
import { apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardOverview from '@/components/admin/DashboardOverview';
import UserManagement from '@/components/admin/UserManagement';
import CommunityStats from '@/components/admin/CommunityStats';
import ContentManagement from '@/components/admin/ContentManagement';
import EventManagement from '@/components/admin/EventManagement';
import FinancialManagement from '@/components/admin/FinancialManagement';

import CompanyManagement from '@/components/admin/CompanyManagement';

export type AdminView = 'overview' | 'users' | 'stats' | 'content' | 'events' | 'financial' | 'companies';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  rank: string;
  company: string;
  roles: string[];
}

const AdminDashboard = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await apiGet('/api/profile');
      
      if (!response.profile) {
        navigate('/login');
        return;
      }

      // Check if user has admin role
      const roles = response.roles || [];
      if (!roles.includes('admin')) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar o painel administrativo.",
          variant: "destructive"
        });
        navigate('/comunidade');
        return;
      }

      const adminUser: AdminUser = {
        id: response.profile.user_id,
        name: response.profile.name,
        email: response.profile.email || '',
        rank: response.profile.rank || 'admin',
        company: response.profile.company || '',
        roles: roles
      };

      setUser(adminUser);
    } catch (error) {
      console.error('Error fetching profile:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-military-black flex items-center justify-center">
        <div className="text-white">Carregando painel administrativo...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-military-black flex items-center justify-center">
        <div className="text-white">Acesso negado</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement />;
      case 'stats':
        return <CommunityStats />;
      case 'content':
        return <ContentManagement />;
      case 'events':
        return <EventManagement />;
      case 'financial':
        return <FinancialManagement />;

      case 'companies':
        return <CompanyManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-military-black flex">
      <AdminSidebar 
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader 
          user={user}
          activeView={activeView}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;