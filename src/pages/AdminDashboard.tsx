import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/pages/Community';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardOverview from '@/components/admin/DashboardOverview';
import UserManagement from '@/components/admin/UserManagement';
import CommunityStats from '@/components/admin/CommunityStats';
import ContentManagement from '@/components/admin/ContentManagement';
import EventManagement from '@/components/admin/EventManagement';

export type AdminView = 'overview' | 'users' | 'stats' | 'content' | 'events';

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.rank !== 'admin') {
      navigate('/comunidade');
      return;
    }
    
    setUser(parsedUser);
  }, [navigate]);

  if (!user) {
    return <div>Carregando...</div>;
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