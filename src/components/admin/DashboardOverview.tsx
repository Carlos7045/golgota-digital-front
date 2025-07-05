import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react';

const DashboardOverview = () => {
  const stats = [
    { title: 'Total de Membros', value: '247', icon: Users, change: '+12%' },
    { title: 'Mensagens Hoje', value: '89', icon: MessageSquare, change: '+5%' },
    { title: 'Eventos Ativos', value: '4', icon: Calendar, change: '+2' },
    { title: 'Crescimento Mensal', value: '8.2%', icon: TrendingUp, change: '+1.4%' },
  ];

  const recentActivity = [
    { user: 'João Silva', action: 'entrou no canal #treinamentos', time: '2 min atrás' },
    { user: 'Maria Santos', action: 'se inscreveu no Rally Missionário', time: '15 min atrás' },
    { user: 'Pedro Costa', action: 'foi promovido a Cabo', time: '1h atrás' },
    { user: 'Ana Oliveira', action: 'enviou uma mensagem em #geral', time: '2h atrás' },
  ];

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
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-military-gold rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader>
              <CardTitle className="text-military-gold">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Rally Missionário 2025</p>
                    <p className="text-xs text-gray-400">15 de Março, 2025</p>
                  </div>
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                    Ativo
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Acampamento Gólgota</p>
                    <p className="text-xs text-gray-400">20-25 de Julho, 2025</p>
                  </div>
                  <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                    Planejando
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">FEG - Fase 1</p>
                    <p className="text-xs text-gray-400">A definir</p>
                  </div>
                  <span className="text-xs bg-gray-600/20 text-gray-400 px-2 py-1 rounded">
                    Preparação
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;