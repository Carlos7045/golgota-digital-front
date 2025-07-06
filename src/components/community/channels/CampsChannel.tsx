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
      type: 'Inverno',
      description: 'Experiência de sobrevivência e fortalecimento espiritual na Serra da Mantiqueira',
      date: '2024-07-15',
      endDate: '2024-07-20',
      location: 'Serra da Mantiqueira, MG',
      maxParticipants: 50,
      enrolledCount: 32,
      price: 450,
      status: 'Inscrições Abertas',
      level: 'intermediário',
      activities: ['Orientação', 'Rapel', 'Devocional', 'Trabalho em Equipe']
    },
    {
      id: '2',
      name: 'Acampamento de Liderança',
      type: 'Liderança',
      description: 'Desenvolvimento de habilidades de liderança e comando',
      date: '2024-08-10',
      endDate: '2024-08-15',
      location: 'Campos do Jordão, SP',
      maxParticipants: 30,
      enrolledCount: 28,
      price: 650,
      status: 'Quase Lotado',
      level: 'avançado',
      activities: ['Comando Tático', 'Planejamento', 'Psicologia', 'Tomada de Decisão']
    }
  ];

  const pastCamps = [
    {
      id: '3',
      name: 'Acampamento de Verão 2024',
      type: 'Verão',
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Inscrições Abertas':
        return 'bg-green-600';
      case 'Quase Lotado':
        return 'bg-yellow-600';
      case 'Lotado':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center mb-2">
            <Tent className="mr-3" size={24} />
            Acampamentos
          </h2>
          <p className="text-gray-400">
            Experiências na selva para fortalecimento espiritual e trabalho em equipe
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-military-gold/20 pb-2">
          <Button 
            variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('upcoming')}
            className={activeTab === 'upcoming' ? 'bg-military-gold text-black' : 'text-gray-400 hover:text-white'}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Próximos
          </Button>
          <Button 
            variant={activeTab === 'my-camps' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('my-camps')}
            className={activeTab === 'my-camps' ? 'bg-military-gold text-black' : 'text-gray-400 hover:text-white'}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Minhas Inscrições
          </Button>
          <Button 
            variant={activeTab === 'gallery' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('gallery')}
            className={activeTab === 'gallery' ? 'bg-military-gold text-black' : 'text-gray-400 hover:text-white'}
          >
            <Camera className="mr-2 h-4 w-4" />
            Galeria
          </Button>
          <Button 
            variant={activeTab === 'past' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('past')}
            className={activeTab === 'past' ? 'bg-military-gold text-black' : 'text-gray-400 hover:text-white'}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Realizados
          </Button>
        </div>

        {/* Upcoming Camps Tab */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {upcomingCamps.map((camp) => (
                <Card key={camp.id} className="bg-military-black-light border-military-gold/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center">
                          {camp.name}
                          <Badge className="ml-3 bg-military-gold text-black">
                            {camp.type}
                          </Badge>
                        </CardTitle>
                        <p className="text-gray-400 mt-1">{camp.description}</p>
                      </div>
                      <Badge className={`${getStatusColor(camp.status)} text-white`}>
                        {camp.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-300">
                          <Users size={16} className="mr-2" />
                          <span>{camp.enrolledCount}/{camp.maxParticipants} participantes</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Calendar size={16} className="mr-2" />
                          <span>{formatDate(camp.date)} - {formatDate(camp.endDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <MapPin size={16} className="mr-2" />
                          <span>{camp.location}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <span className="mr-2 text-military-gold">R$</span>
                          {camp.price}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-2">Atividades:</h4>
                        <ul className="text-gray-400 text-sm space-y-1">
                          {camp.activities.map((activity, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-military-gold rounded-full mr-2"></span>
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-military-gold/20">
                      <Button 
                        className="bg-military-gold hover:bg-military-gold-dark text-black"
                        disabled={camp.status === 'Lotado'}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {camp.status === 'Lotado' ? 'Lotado' : 'Inscrever-se'}
                      </Button>
                      <Button variant="outline" className="border-military-gold/50 text-military-gold hover:bg-military-gold/10">
                        Mais Informações
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
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-white">Minhas Inscrições</CardTitle>
              </CardHeader>
              <CardContent>
                {myCamps.length > 0 ? (
                  <div className="space-y-4">
                    {myCamps.map((camp) => (
                      <div key={camp.id} className="flex items-center justify-between p-4 rounded-lg border border-military-gold/20">
                        <div>
                          <h4 className="font-medium text-white">{camp.name}</h4>
                          <p className="text-sm text-gray-400">
                            Inscrito em: {camp.enrolledAt}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-600 text-white">Confirmado</Badge>
                          <Button variant="outline" size="sm" className="border-military-gold/50 text-military-gold hover:bg-military-gold/10">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
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
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-white">Galeria de Fotos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">
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
            <div className="grid gap-6">
              {pastCamps.map((camp) => (
                <Card key={camp.id} className="bg-military-black-light border-military-gold/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center">
                          {camp.name}
                          <Badge className="ml-3 bg-military-gold text-black">
                            {camp.type}
                          </Badge>
                        </CardTitle>
                        <p className="text-gray-400 mt-1">{camp.description}</p>
                      </div>
                      <Badge className="bg-gray-600 text-white">
                        Concluído
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-300">
                          <Users size={16} className="mr-2" />
                          <span>{camp.participants} participantes</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Calendar size={16} className="mr-2" />
                          <span>{formatDate(camp.date)} - {formatDate(camp.endDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <MapPin size={16} className="mr-2" />
                          <span>{camp.location}</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Camera size={16} className="mr-2" />
                          <span>{camp.photos} fotos</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-2">Avaliação:</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-600 text-white">{camp.rating}/5</Badge>
                          <span className="text-gray-400 text-sm">Excelente</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-military-gold/20">
                      <Button variant="outline" className="border-military-gold/50 text-military-gold hover:bg-military-gold/10">
                        <Camera className="mr-2 h-4 w-4" />
                        Ver Fotos
                      </Button>
                      <Button variant="outline" className="border-military-gold/50 text-military-gold hover:bg-military-gold/10">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Comentários
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