import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { apiGet } from '@/lib/api';

const DashboardOverview = () => {
  const [stats, setStats] = useState([
    { title: 'Total de Membros', value: '0', icon: Users, change: '+0%' },
    { title: 'Mensagens Hoje', value: '0', icon: MessageSquare, change: '+0%' },
    { title: 'Eventos Ativos', value: '0', icon: Calendar, change: '+0' },
    { title: 'Crescimento Mensal', value: '0%', icon: TrendingUp, change: '+0%' },
  ]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await apiGet('/api/stats');
      
      setStats([
        { title: 'Total de Membros', value: data.totalMembers?.toString() || '0', icon: Users, change: '+12%' },
        { title: 'Mensagens Hoje', value: data.todayMessages?.toString() || '0', icon: MessageSquare, change: '+8%' },
        { title: 'Eventos Ativos', value: data.activeEvents?.toString() || '0', icon: Calendar, change: '+2' },
        { title: 'Crescimento Mensal', value: '0%', icon: TrendingUp, change: '+0%' },
      ]);

      setRecentActivity(data.activities || []);
      setUpcomingEvents(data.upcomingEvents || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600/20 text-green-400';
      case 'planning': return 'bg-yellow-600/20 text-yellow-400';
      case 'completed': return 'bg-blue-600/20 text-blue-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'planning': return 'Planejando';
      case 'completed': return 'Concluído';
      default: return 'Preparação';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-military-black-light border-military-gold/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-military-gold" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-green-400">
                  {stat.change} em relação ao mês anterior
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader>
              <CardTitle className="text-military-gold">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-400 py-4">
                    Carregando atividades...
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    Nenhuma atividade recente
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-military-gold rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader>
              <CardTitle className="text-military-gold">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-gray-400 py-4">
                    Carregando eventos...
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-center text-gray-400 py-4">
                    Nenhum evento próximo
                  </div>
                ) : (
                  upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{event.name}</p>
                        <p className="text-xs text-gray-400">
                          {event.date} às {event.time}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400">
                        Agendado
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;