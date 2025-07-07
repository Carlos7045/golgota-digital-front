import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon, PlusIcon } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  type: 'rally' | 'camp' | 'training' | 'meeting';
  date: string;
  location: string;
  duration: string;
  maxParticipants: number;
  registeredParticipants: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  description: string;
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'rally' as Event['type'],
    date: '',
    location: '',
    duration: '',
    maxParticipants: 50,
    description: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await apiGet('/api/events');
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível carregar os eventos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.name.trim() || !newEvent.date || !newEvent.location.trim()) {
      toast({
        title: "Erro",
        description: "Nome, data e local são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiPost('/api/events', {
        name: newEvent.name,
        type: newEvent.type,
        event_date: newEvent.date,
        location: newEvent.location,
        duration: newEvent.duration,
        max_participants: newEvent.maxParticipants,
        registered_participants: 0,
        status: 'planning',
        description: newEvent.description
      });

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!"
      });

      setIsCreateDialogOpen(false);
      setNewEvent({
        name: '',
        type: 'rally',
        date: '',
        location: '',
        duration: '',
        maxParticipants: 50,
        description: ''
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar evento",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este evento?')) return;

    try {
      await apiDelete(`/api/events/${eventId}`);

      toast({
        title: "Sucesso",
        description: "Evento cancelado com sucesso!"
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar evento",
        variant: "destructive"
      });
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'rally':
        return <Badge className="bg-red-600/20 text-red-400">Rally</Badge>;
      case 'camp':
        return <Badge className="bg-green-600/20 text-green-400">Acampamento</Badge>;
      case 'training':
        return <Badge className="bg-blue-600/20 text-blue-400">Treinamento</Badge>;
      case 'meeting':
        return <Badge className="bg-purple-600/20 text-purple-400">Reunião</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600/20 text-green-400">Ativo</Badge>;
      case 'planning':
        return <Badge className="bg-yellow-600/20 text-yellow-400">Planejamento</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600/20 text-blue-400">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-600/20 text-red-400">Cancelado</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-military-gold">Gerenciamento de Eventos</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-military-gold text-military-black hover:bg-military-gold/80">
                <PlusIcon className="w-4 h-4 mr-2" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-military-black-light border-military-gold/20">
              <DialogHeader>
                <DialogTitle className="text-military-gold">Criar Novo Evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Nome do Evento</Label>
                  <Input
                    id="name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                    className="bg-military-black border-military-gold/30 text-white"
                    placeholder="Ex: Rally Noturno"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-white">Tipo</Label>
                  <Select value={newEvent.type} onValueChange={(value: Event['type']) => setNewEvent({...newEvent, type: value})}>
                    <SelectTrigger className="bg-military-black border-military-gold/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-military-black-light border-military-gold/20">
                      <SelectItem value="rally">Rally</SelectItem>
                      <SelectItem value="camp">Acampamento</SelectItem>
                      <SelectItem value="training">Treinamento</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date" className="text-white">Data</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="bg-military-black border-military-gold/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-white">Local</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="bg-military-black border-military-gold/30 text-white"
                    placeholder="Ex: Base Principal"
                  />
                </div>
                <Button onClick={handleCreateEvent} className="w-full bg-military-gold text-military-black hover:bg-military-gold/80">
                  Criar Evento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">
            Carregando eventos...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <CalendarIcon className="w-4 h-4 mr-2 text-military-gold" />
                    {new Date(event.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPinIcon className="w-4 h-4 mr-2 text-military-gold" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <UsersIcon className="w-4 h-4 mr-2 text-military-gold" />
                    {event.registeredParticipants}/{event.maxParticipants} participantes
                  </div>
                  {event.duration && (
                    <div className="flex items-center text-gray-300 text-sm">
                      <ClockIcon className="w-4 h-4 mr-2 text-military-gold" />
                      {event.duration}
                    </div>
                  )}
                  {event.description && (
                    <p className="text-gray-400 text-sm">{event.description}</p>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-military-gold/30 text-white hover:bg-military-gold/10"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;