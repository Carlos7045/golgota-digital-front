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
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center mb-2">
              <Shield className="mr-3 text-secondary" size={24} />
              Painel da Companhia
            </h2>
            <p className="text-muted-foreground">
              Área restrita para comandantes e administradores
            </p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-secondary flex items-center">
                <AlertCircle className="mr-2" size={20} />
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
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
    <div className="flex-1 overflow-y-auto p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center mb-2">
            <Shield className="mr-3 text-secondary" size={24} />
            Painel da CIA {user.company}
          </h2>
          <p className="text-muted-foreground">
            Painel de controle e gestão da companhia
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-border pb-2">
          <Button 
            variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="text-sm"
          >
            Visão Geral
          </Button>
          <Button 
            variant={activeTab === 'members' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('members')}
            className="text-sm"
          >
            Membros
          </Button>
          <Button 
            variant={activeTab === 'announcements' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('announcements')}
            className="text-sm"
          >
            Comunicados
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Total de Membros</CardTitle>
                    <Users className="h-4 w-4 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{companyStats.totalMembers}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Membros Ativos</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{companyStats.activeMembers}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Aprovações Pendentes</CardTitle>
                    <UserPlus className="h-4 w-4 text-secondary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{companyStats.pendingApprovals}</div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Novos Este Mês</CardTitle>
                    <Calendar className="h-4 w-4 text-accent" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{companyStats.thisMonthJoined}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMembers.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">Ingressou em {member.joinedAt}</p>
                        </div>
                      </div>
                      <Badge variant={member.status === 'ativo' ? 'secondary' : 'outline'}>
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
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Membros da CIA {user.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">Patente: {member.rank}</p>
                          <p className="text-sm text-muted-foreground">Ingressou: {member.joinedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.status === 'ativo' ? 'secondary' : 'outline'}>
                          {member.status}
                        </Badge>
                        <Button variant="outline" size="sm">
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
              <h3 className="text-lg font-semibold text-foreground">Comunicados da Companhia</h3>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <Bell className="mr-2 h-4 w-4" />
                Novo Comunicado
              </Button>
            </div>

            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">{announcement.title}</CardTitle>
                      <Badge 
                        variant={announcement.priority === 'alta' ? 'destructive' : 'secondary'}
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{announcement.content}</p>
                    <p className="text-sm text-muted-foreground">Criado em: {announcement.createdAt}</p>
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