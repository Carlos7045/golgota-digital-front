import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Clock, MapPin, DollarSign, Calendar } from 'lucide-react';
import { User } from '@/pages/Community';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

interface Event {
  id: string;
  name: string;
  type: 'rally' | 'cplg' | 'feg';
  category: 'treinamento';
  start_date: string;
  end_date: string;
  location: string;
  duration: string;
  max_participants: number;
  registered_participants: number;
  status: string;
  description: string;
  price: string;
  requirements: string;
  objectives: string;
  instructor: string;
}

interface TrainingsChannelProps {
  user: User;
}

const TrainingsChannel = ({ user }: TrainingsChannelProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledEvents, setEnrolledEvents] = useState<string[]>([]);

  useEffect(() => {
    fetchTrainingEvents();
    fetchUserRegistrations();
  }, []);

  const fetchTrainingEvents = async () => {
    try {
      const data = await apiGet('/api/events');
      const trainingEvents = data.events.filter((event: Event) => event.category === 'treinamento');
      setEvents(trainingEvents);
    } catch (error) {
      console.error('Error fetching training events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const data = await apiGet('/api/user/event-registrations');
      const enrolledEventIds = data.registrations.map((reg: any) => reg.event_id);
      setEnrolledEvents(enrolledEventIds);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    }
  };

  const handleEnroll = async (eventId: string) => {
    try {
      if (enrolledEvents.includes(eventId)) {
        await apiDelete(`/api/events/${eventId}/register`);
        setEnrolledEvents(prev => prev.filter(id => id !== eventId));
        console.log('Inscrição cancelada com sucesso');
      } else {
        const response = await apiPost(`/api/events/${eventId}/register`, {});
        
        if (response.payment) {
          // Event requires payment - show payment info
          alert(`Pagamento necessário: R$ ${response.payment.value}\nCódigo PIX: ${response.payment.pixCode}\nVencimento: ${new Date(response.payment.dueDate).toLocaleDateString()}`);
          window.open(response.payment.invoiceUrl, '_blank');
        } else {
          // Free event - registration complete
          setEnrolledEvents(prev => [...prev, eventId]);
        }
        
        // Refresh events to update participant count
        fetchTrainingEvents();
        fetchUserRegistrations();
      }
    } catch (error: any) {
      console.error('Error with enrollment:', error);
      alert(error.message || 'Erro ao processar inscrição');
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'rally':
        return <Badge className="bg-red-600/20 text-red-400">Rally</Badge>;
      case 'cplg':
        return <Badge className="bg-orange-600/20 text-orange-400">CPLG</Badge>;
      case 'feg':
        return <Badge className="bg-yellow-600/20 text-yellow-400">FEG</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge className="bg-yellow-600/20 text-yellow-400">Planejamento</Badge>;
      case 'published':
        return <Badge className="bg-blue-600/20 text-blue-400">Publicado</Badge>;
      case 'registration_open':
        return <Badge className="bg-green-600/20 text-green-400">Inscrições Abertas</Badge>;
      case 'final_days':
        return <Badge className="bg-orange-600/20 text-orange-400">Últimos Dias</Badge>;
      case 'active':
        return <Badge className="bg-purple-600/20 text-purple-400">Em Andamento</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600/20 text-blue-400">Finalizado</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-600/20 text-red-400">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center text-gray-400 py-8">
          Carregando eventos de treinamento...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-military-gold mb-2">Canal de Treinamentos</h2>
        <p className="text-gray-400">
          Eventos de treinamento incluindo Rally, CPLG e FEG - desenvolvendo liderança e habilidades militares cristãs.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold mb-2">Nenhum treinamento disponível</h3>
          <p>Novos eventos de treinamento serão publicados em breve.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="bg-military-black-light border-military-gold/20 hover:border-military-gold/40 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{event.name}</CardTitle>
                  <div className="flex gap-2">
                    {getTypeBadge(event.type)}
                    {getStatusBadge(event.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-300 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-military-gold" />
                  {new Date(event.start_date).toLocaleDateString('pt-BR')} - {new Date(event.end_date).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-military-gold" />
                  {event.location}
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <Users className="w-4 h-4 mr-2 text-military-gold" />
                  {event.registered_participants}/{event.max_participants} participantes
                </div>
                {event.duration && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <Clock className="w-4 h-4 mr-2 text-military-gold" />
                    {event.duration}
                  </div>
                )}
                {event.price && parseFloat(event.price) > 0 && (
                  <div className="flex items-center text-military-gold text-sm font-bold">
                    <DollarSign className="w-4 h-4 mr-2" />
                    R$ {parseFloat(event.price).toFixed(2)}
                  </div>
                )}
                {event.instructor && (
                  <div className="flex items-center text-gray-300 text-sm">
                    <GraduationCap className="w-4 h-4 mr-2 text-military-gold" />
                    Instrutor: {event.instructor}
                  </div>
                )}
                {event.description && (
                  <p className="text-gray-400 text-sm">{event.description}</p>
                )}
                {event.requirements && (
                  <div className="text-gray-400 text-sm">
                    <strong>Requisitos:</strong> {event.requirements}
                  </div>
                )}
                {event.objectives && (
                  <div className="text-gray-400 text-sm">
                    <strong>Objetivos:</strong> {event.objectives}
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleEnroll(event.id)}
                    className={`flex-1 ${
                      enrolledEvents.includes(event.id)
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : event.registered_participants >= event.max_participants
                        ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                        : 'bg-military-gold text-military-black hover:bg-military-gold/80'
                    }`}
                    disabled={
                      event.status === 'cancelled' || 
                      event.status === 'completed' ||
                      (event.registered_participants >= event.max_participants && !enrolledEvents.includes(event.id)) ||
                      !['published', 'registration_open', 'final_days'].includes(event.status)
                    }
                  >
                    {enrolledEvents.includes(event.id) 
                      ? 'Cancelar Inscrição' 
                      : event.registered_participants >= event.max_participants
                      ? 'Evento Lotado'
                      : !['published', 'registration_open', 'final_days'].includes(event.status)
                      ? 'Inscrições Fechadas'
                      : 'Inscrever-se'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingsChannel;