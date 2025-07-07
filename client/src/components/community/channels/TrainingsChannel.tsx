
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Clock, MapPin } from 'lucide-react';
import { User } from '@/pages/Community';

interface TrainingsChannelProps {
  user: User;
}

const trainings = [
  {
    id: '1',
    name: 'Rally Missionário 2025',
    type: 'Rally',
    description: 'Treinamento focado em criatividade, resistência e missão',
    participants: 45,
    maxParticipants: 60,
    nextSession: '2025-02-15T09:00:00',
    location: 'Campo de Treinamento - SP',
    status: 'Inscrições Abertas',
    requirements: ['14+ anos', 'Autorização dos pais (menores)', 'Taxa de inscrição']
  },
  {
    id: '2',
    name: 'CPLG - Fase 1',
    type: 'CPLG',
    description: 'Curso Preparatório de Liderança Gólgota - Primeira Fase',
    participants: 28,
    maxParticipants: 30,
    nextSession: '2025-03-01T08:00:00',
    location: 'Centro de Treinamento',
    status: 'Quase Lotado',
    requirements: ['Soldado ou superior', 'Aprovação do comandante', 'Disponibilidade fins de semana']
  },
  {
    id: '3',
    name: 'FEG - Sobrevivência',
    type: 'FEG',
    description: 'Formação Especial Gólgota - Módulo Sobrevivência',
    participants: 15,
    maxParticipants: 20,
    nextSession: '2025-03-20T07:00:00',
    location: 'Mata Atlântica - RJ',
    status: 'Pré-requisitos Exigidos',
    requirements: ['Cabo ou superior', 'Experiência em acampamentos', 'Exame médico']
  }
];

const TrainingsChannel = ({ user }: TrainingsChannelProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Inscrições Abertas':
        return 'bg-green-600';
      case 'Quase Lotado':
        return 'bg-yellow-600';
      case 'Pré-requisitos Exigidos':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center mb-2">
            <GraduationCap className="mr-3" size={24} />
            Treinamentos Disponíveis
          </h2>
          <p className="text-gray-400">
            Rally Missionário, CPLG e FEG - Desenvolva suas habilidades e liderança
          </p>
        </div>

        <div className="grid gap-6">
          {trainings.map((training) => (
            <Card key={training.id} className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      {training.name}
                      <Badge className="ml-3 bg-military-gold text-black">
                        {training.type}
                      </Badge>
                    </CardTitle>
                    <p className="text-gray-400 mt-1">{training.description}</p>
                  </div>
                  <Badge className={`${getStatusColor(training.status)} text-white`}>
                    {training.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-300">
                      <Users size={16} className="mr-2" />
                      <span>{training.participants}/{training.maxParticipants} participantes</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock size={16} className="mr-2" />
                      <span>Próxima sessão: {formatDate(training.nextSession)}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin size={16} className="mr-2" />
                      <span>{training.location}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2">Requisitos:</h4>
                    <ul className="text-gray-400 text-sm space-y-1">
                      {training.requirements.map((req, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-military-gold rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-military-gold/20">
                  <Button className="bg-military-gold hover:bg-military-gold-dark text-black">
                    Inscrever-se
                  </Button>
                  <Button variant="outline" className="border-military-gold/50 text-military-gold hover:bg-military-gold/10">
                    Mais Informações
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold">Cronograma de Treinamentos 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 space-y-2">
              <p><strong>Fevereiro:</strong> Rally Missionário (15-16/02)</p>
              <p><strong>Março:</strong> CPLG Fase 1 (01-31/03)</p>
              <p><strong>Abril:</strong> FEG Sobrevivência (20-22/04)</p>
              <p><strong>Maio:</strong> Rally Missionário (10-11/05)</p>
              <p><strong>Junho:</strong> CPLG Fase 2 (05-30/06)</p>
              <p><strong>Julho:</strong> Acampamento Gólgota (15-25/07)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainingsChannel;
