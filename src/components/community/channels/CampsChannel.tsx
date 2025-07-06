import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tent, Calendar, MapPin, Users, Clock, CheckCircle, UserPlus, Camera, MessageCircle } from 'lucide-react';
import { User } from '@/pages/Community';
import { useState } from 'react';

interface CampsChannelProps {
  user: User;
}

const CampsChannel = ({ user }: CampsChannelProps) => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data - em produção viria do backend
  const upcomingCamps = [
    {
      id: '1',
      name: 'Acampamento de Inverno 2024',
      description: 'Experiência de sobrevivência e fortalecimento espiritual na Serra da Mantiqueira',
      date: '2024-07-15',
      endDate: '2024-07-20',
      location: 'Serra da Mantiqueira, MG',
      maxParticipants: 50,
      enrolledCount: 32,
      price: 450,
      status: 'open',
      level: 'intermediário',
      activities: ['Orientação', 'Rapel', 'Devocional', 'Trabalho em Equipe']
    },
    {
      id: '2',
      name: 'Acampamento de Liderança',
      description: 'Desenvolvimento de habilidades de liderança e comando',
      date: '2024-08-10',
      endDate: '2024-08-15',
      location: 'Campos do Jordão, SP',
      maxParticipants: 30,
      enrolledCount: 28,
      price: 650,
      status: 'almost_full',
      level: 'avançado',
      activities: ['Comando Tático', 'Planejamento', 'Psicologia', 'Tomada de Decisão']
    }
  ];

  const pastCamps = [
    {
      id: '3',
      name: 'Acampamento de Verão 2024',
      description: 'Primeira experiência do ano na natureza',
      date: '2024-02-10',
      endDate: '2024-02-15',
      location: 'Itatiaia, RJ',
      participants: 45,
      rating: 4.8,
      photos: 156
    }
  ];

  const myCamps = [
    {
      id: '1',
      name: 'Acampamento de Inverno 2024',
      status: 'enrolled',
      enrolledAt: '2024-01-15'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'secondary';
      case 'almost_full': return 'outline';
      case 'full': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Vagas Disponíveis';
      case 'almost_full': return 'Últimas Vagas';
      case 'full': return 'Lotado';
      default: return 'Disponível';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center mb-2">
            <Tent className="mr-3 text-military-gold" size={24} />
            Acampamentos
          </h2>
          <p className="text-muted-foreground">
            Experiências na selva para fortalecimento espiritual e trabalho em equipe
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-border pb-2">
          <Button 
            variant={activeTab === 'upcoming' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('upcoming')}
            className="text-sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Próximos
          </Button>
          <Button 
            variant={activeTab === 'my-camps' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('my-camps')}
            className="text-sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Minhas Inscrições
          </Button>
          <Button 
            variant={activeTab === 'gallery' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('gallery')}
            className="text-sm"
          >
            <Camera className="mr-2 h-4 w-4" />
            Galeria
          </Button>
          <Button 
            variant={activeTab === 'past' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('past')}
            className="text-sm"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Realizados
          </Button>
        </div>

        {/* Upcoming Camps Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingCamps.map((camp) => (
                <Card key={camp.id} className="bg-card border-border hover:border-military-gold/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-foreground text-lg mb-2">{camp.name}</CardTitle>
                        <Badge variant={getStatusColor(camp.status)}>
                          {getStatusText(camp.status)}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-military-gold border-military-gold">
                        {camp.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{camp.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {camp.date} - {camp.endDate}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {camp.location}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {camp.enrolledCount}/{camp.maxParticipants} inscritos
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <span className="mr-2 text-military-gold">R$</span>
                        {camp.price}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Atividades:</h4>
                      <div className="flex flex-wrap gap-1">
                        {camp.activities.map((activity) => (
                          <Badge key={activity} variant="outline" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-military-gold hover:bg-military-gold-light text-military-black"
                        disabled={camp.status === 'full'}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {camp.status === 'full' ? 'Lotado' : 'Inscrever-se'}
                      </Button>
                      <Button variant="outline" size="icon">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My Camps Tab */}
        {activeTab === 'my-camps' && (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Minhas Inscrições</CardTitle>
              </CardHeader>
              <CardContent>
                {myCamps.length > 0 ? (
                  <div className="space-y-4">
                    {myCamps.map((camp) => (
                      <div key={camp.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div>
                          <h4 className="font-medium text-foreground">{camp.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Inscrito em: {camp.enrolledAt}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Confirmado</Badge>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Você ainda não se inscreveu em nenhum acampamento.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Galeria de Fotos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Galeria de fotos dos acampamentos será adicionada em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Past Camps Tab */}
        {activeTab === 'past' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pastCamps.map((camp) => (
                <Card key={camp.id} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground text-lg">{camp.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">{camp.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {camp.date} - {camp.endDate}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {camp.location}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {camp.participants} participantes
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Camera className="mr-2 h-4 w-4" />
                        {camp.photos} fotos
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Avaliação:</span>
                        <Badge variant="secondary">{camp.rating}/5</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Fotos
                      </Button>
                    </div>
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

export default CampsChannel;