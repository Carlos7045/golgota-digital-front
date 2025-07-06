import { Shield, Users, FileText, TrendingUp, Bell, UserPlus, AlertCircle, Calendar } from 'lucide-react';
import { User } from '@/pages/Community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface CompanyPanelChannelProps {
  user: User;
}

const CompanyPanelChannel = ({ user }: CompanyPanelChannelProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - em produção viria do backend
  const companyStats = {
    totalMembers: 45,
    activeMembers: 38,
    pendingApprovals: 7,
    thisMonthJoined: 12
  };

  const recentMembers = [
    { id: '1', name: 'João Silva', rank: 'soldado', joinedAt: '2024-01-15', status: 'ativo' },
    { id: '2', name: 'Maria Santos', rank: 'cabo', joinedAt: '2024-01-14', status: 'ativo' },
    { id: '3', name: 'Pedro Costa', rank: 'aluno', joinedAt: '2024-01-13', status: 'pendente' },
    { id: '4', name: 'Ana Oliveira', rank: 'soldado', joinedAt: '2024-01-12', status: 'ativo' }
  ];

  const announcements = [
    {
      id: '1',
      title: 'Treinamento de Campo - Próximo Sábado',
      content: 'Lembrete sobre o treinamento de campo programado para este sábado às 06h00.',
      priority: 'alta',
      createdAt: '2024-01-15'
    },
    {
      id: '2', 
      title: 'Reunião de Planejamento',
      content: 'Reunião para planejar as atividades do próximo mês.',
      priority: 'média',
      createdAt: '2024-01-14'
    }
  ];

  const isLeader = ['capitao', 'major', 'coronel', 'comandante', 'admin'].includes(user.rank);

  if (!isLeader) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-military-black">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center mb-2">
              <Shield className="mr-3" size={24} />
              Painel da Companhia
            </h2>
            <p className="text-gray-400">
              Área restrita para comandantes e administradores
            </p>
          </div>

          <Card className="bg-military-black-light border-military-gold/20">
            <CardHeader>
              <CardTitle className="text-military-gold flex items-center">
                <AlertCircle className="mr-2" size={20} />
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Este painel é exclusivo para líderes (Capitão ou superior). 
                Sua patente atual: <Badge variant="secondary">{user.rank}</Badge>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center mb-2">
            <Shield className="mr-3" size={24} />
            Painel da CIA {user.company}
          </h2>
          <p className="text-gray-400">
            Painel de controle e gestão da companhia
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-military-gold/20 pb-2">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'bg-military-gold text-black' : 'text-gray-400 hover:text-white'}
          >
            Visão Geral
          </Button>
          <Button 
            variant={activeTab === 'members' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('members')}
            className={activeTab === 'members' ? 'bg-military-gold text-black' : 'text-gray-400 hover:text-white'}
          >
            Membros
          </Button>
          <Button 
            variant={activeTab === 'announcements' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('announcements')}
            className={activeTab === 'announcements' ? 'bg-military-gold text-black' : 'text-gray-400 hover:text-white'}
          >
            Comunicados
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-gray-400">Total de Membros</CardTitle>
                    <Users className="h-4 w-4 text-military-gold" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{companyStats.totalMembers}</div>
                </CardContent>
              </Card>

              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-gray-400">Membros Ativos</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{companyStats.activeMembers}</div>
                </CardContent>
              </Card>

              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-gray-400">Aprovações Pendentes</CardTitle>
                    <UserPlus className="h-4 w-4 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{companyStats.pendingApprovals}</div>
                </CardContent>
              </Card>

              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-gray-400">Novos Este Mês</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{companyStats.thisMonthJoined}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-white">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMembers.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-military-gold/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-military-gold/20 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-military-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-sm text-gray-400">Ingressou em {member.joinedAt}</p>
                        </div>
                      </div>
                      <Badge className={member.status === 'ativo' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                        {member.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-white">Membros da CIA {user.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-military-gold/20">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-military-gold/20 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-military-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-sm text-gray-400">Patente: {member.rank}</p>
                          <p className="text-sm text-gray-400">Ingressou: {member.joinedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={member.status === 'ativo' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                          {member.status}
                        </Badge>
                        <Button variant="outline" size="sm" className="border-military-gold/50 text-military-gold hover:bg-military-gold/10">
                          Ver Perfil
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Comunicados da Companhia</h3>
              <Button className="bg-military-gold hover:bg-military-gold-dark text-black">
                <Bell className="mr-2 h-4 w-4" />
                Novo Comunicado
              </Button>
            </div>

            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="bg-military-black-light border-military-gold/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{announcement.title}</CardTitle>
                      <Badge 
                        className={announcement.priority === 'alta' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'}
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-2">{announcement.content}</p>
                    <p className="text-sm text-gray-400">Criado em: {announcement.createdAt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPanelChannel;