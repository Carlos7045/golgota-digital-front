import { useState } from 'react';
import { User, Calendar, Award, Activity, Settings, Shield, Users, BookOpen, Camera, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data - em produção viria do backend/contexto
  const userData = {
    id: '1',
    name: 'João Silva',
    rank: 'Sargento',
    company: 'Alpha',
    joinedAt: '2023-06-15',
    email: 'joao.silva@comandogolgota.com',
    phone: '(11) 99999-9999',
    birthDate: '1985-03-20',
    address: 'São Paulo, SP',
    avatar: '/placeholder.svg',
    bio: 'Militar dedicado com 15 anos de experiência em operações especiais e treinamento de tropas.',
    specialties: ['Liderança', 'Tática', 'Primeiros Socorros'],
    achievements: [
      { name: 'Melhor Soldado 2023', date: '2023-12-01', type: 'award' },
      { name: 'Curso de Liderança Avançada', date: '2023-10-15', type: 'course' },
      { name: '100 Dias de Atividade', date: '2023-11-30', type: 'milestone' }
    ],
    stats: {
      totalTrainings: 45,
      completedCourses: 8,
      totalPoints: 2340,
      rank: 3
    },
    activities: [
      {
        id: '1',
        type: 'training',
        title: 'Participou do Rally Missionário',
        description: 'Completou com sucesso o rally de resistência física',
        date: '2024-01-10',
        points: 50
      },
      {
        id: '2',
        type: 'course',
        title: 'Concluiu curso de Primeiros Socorros',
        description: 'Certificação em atendimento de emergência',
        date: '2024-01-05',
        points: 100
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Alcançou posição #3 no ranking',
        description: 'Subiu 2 posições no ranking mensal',
        date: '2024-01-01',
        points: 25
      }
    ]
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'training': return <Activity className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-blue-600';
      case 'course': return 'bg-green-600';
      case 'achievement': return 'bg-secondary';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="min-h-screen bg-military-black">
      {/* Header com botão voltar */}
      <div className="bg-military-black-light border-b border-military-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white hover:bg-military-gold/20"
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-white">Perfil do Membro</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 bg-military-black-light border-military-gold/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-military-gold/20 flex items-center justify-center overflow-hidden border-4 border-military-gold/30">
                  <img 
                    src={userData.avatar} 
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  size="sm" 
                  className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 bg-military-gold hover:bg-military-gold-dark text-black"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Info Principal */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{userData.name}</h2>
                    <div className="flex items-center gap-4 mb-3">
                      <Badge className="bg-military-gold text-black flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {userData.rank}
                      </Badge>
                      <Badge className="bg-military-olive text-white flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        CIA {userData.company}
                      </Badge>
                    </div>
                    <p className="text-gray-300 mb-4 max-w-2xl">{userData.bio}</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 border-military-gold text-military-gold hover:bg-military-gold hover:text-black"
                  >
                    <Edit className="h-4 w-4" />
                    Editar Perfil
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-military-black border border-military-gold/20 rounded-lg">
                    <div className="text-2xl font-bold text-military-gold">{userData.stats.totalTrainings}</div>
                    <div className="text-sm text-gray-400">Treinamentos</div>
                  </div>
                  <div className="text-center p-3 bg-military-black border border-military-gold/20 rounded-lg">
                    <div className="text-2xl font-bold text-military-gold">{userData.stats.completedCourses}</div>
                    <div className="text-sm text-gray-400">Cursos</div>
                  </div>
                  <div className="text-center p-3 bg-military-black border border-military-gold/20 rounded-lg">
                    <div className="text-2xl font-bold text-military-gold">{userData.stats.totalPoints}</div>
                    <div className="text-sm text-gray-400">Pontos</div>
                  </div>
                  <div className="text-center p-3 bg-military-black border border-military-gold/20 rounded-lg">
                    <div className="text-2xl font-bold text-military-gold">#{userData.stats.rank}</div>
                    <div className="text-sm text-gray-400">Ranking</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-military-black-light border border-military-gold/20">
            <TabsTrigger value="info" className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300">Informações</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300">Atividades</TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300">Conquistas</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab Informações */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5 text-military-gold" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Email</label>
                    <p className="text-white">{userData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Telefone</label>
                    <p className="text-white">{userData.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Data de Nascimento</label>
                    <p className="text-white">{new Date(userData.birthDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Endereço</label>
                    <p className="text-white">{userData.address}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-military-black-light border-military-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-military-gold" />
                    Dados Militares
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Patente</label>
                    <p className="text-white">{userData.rank}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Companhia</label>
                    <p className="text-white">CIA {userData.company}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Data de Ingresso</label>
                    <p className="text-white">{new Date(userData.joinedAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Especialidades</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {userData.specialties.map((specialty) => (
                        <Badge key={specialty} className="bg-military-gold text-black">{specialty}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Atividades */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5 text-military-gold" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 border border-military-gold/20 rounded-lg bg-military-black/50">
                      <div className={`w-10 h-10 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{activity.title}</h4>
                        <p className="text-sm text-gray-300 mb-2">{activity.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(activity.date).toLocaleDateString('pt-BR')}
                          </span>
                          <Badge className="bg-military-gold text-black text-xs">
                            +{activity.points} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Conquistas */}
          <TabsContent value="achievements" className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="h-5 w-5 text-military-gold" />
                  Conquistas e Certificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData.achievements.map((achievement, index) => (
                    <div key={index} className="p-4 border border-military-gold/20 rounded-lg text-center bg-military-black/50">
                      <div className="w-16 h-16 bg-military-gold rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="h-8 w-8 text-black" />
                      </div>
                      <h4 className="font-medium text-white mb-2">{achievement.name}</h4>
                      <p className="text-sm text-gray-400">
                        {new Date(achievement.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5 text-military-gold" />
                  Configurações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-military-gold/20 rounded-lg bg-military-black/50">
                  <div>
                    <h4 className="font-medium text-white">Notificações por Email</h4>
                    <p className="text-sm text-gray-400">Receber emails sobre atividades e eventos</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-military-gold text-military-gold hover:bg-military-gold hover:text-black">Configurar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-military-gold/20 rounded-lg bg-military-black/50">
                  <div>
                    <h4 className="font-medium text-white">Privacidade do Perfil</h4>
                    <p className="text-sm text-gray-400">Controlar quem pode ver seu perfil</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-military-gold text-military-gold hover:bg-military-gold hover:text-black">Editar</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-military-gold/20 rounded-lg bg-military-black/50">
                  <div>
                    <h4 className="font-medium text-white">Alterar Senha</h4>
                    <p className="text-sm text-gray-400">Atualizar sua senha de acesso</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-military-gold text-military-gold hover:bg-military-gold hover:text-black">Alterar</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;