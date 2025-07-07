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
  type: 'rally' | 'cplg' | 'feg' | 'acampamento' | 'campanha' | 'doacao';
  category: 'treinamento' | 'acampamento' | 'campanha';
  start_date: string;
  end_date: string;
  location: string;
  duration: string;
  max_participants: number;
  registered_participants: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled' | 'published';
  description: string;
  price: string;
  requirements: string;
  objectives: string;
  instructor: string;
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'rally' as Event['type'],
    category: 'treinamento' as Event['category'],
    start_date: '',
    end_date: '',
    location: '',
    duration: '',
    max_participants: 50,
    description: '',
    price: '0.00',
    requirements: '',
    objectives: '',
    instructor: ''
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
    console.log('handleCreateEvent chamado', newEvent);
    
    if (!newEvent.name.trim() || !newEvent.start_date || !newEvent.end_date || !newEvent.location.trim()) {
      console.log('Validação falhou:', {
        name: newEvent.name,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
        location: newEvent.location
      });
      toast({
        title: "Erro",
        description: "Nome, datas de início/fim e local são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    console.log('Enviando para API:', newEvent);
    try {
      const response = await apiPost('/api/events', {
        name: newEvent.name,
        type: newEvent.type,
        category: newEvent.category,
        start_date: newEvent.start_date,
        end_date: newEvent.end_date,
        location: newEvent.location,
        duration: newEvent.duration,
        max_participants: newEvent.max_participants,
        registered_participants: 0,
        status: 'planning',
        description: newEvent.description,
        price: newEvent.price,
        requirements: newEvent.requirements,
        objectives: newEvent.objectives,
        instructor: newEvent.instructor
      });

      console.log('Resposta da API:', response);
      
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!"
      });

      setIsCreateDialogOpen(false);
      setNewEvent({
        name: '',
        type: 'rally',
        category: 'treinamento',
        start_date: '',
        end_date: '',
        location: '',
        duration: '',
        max_participants: 50,
        description: '',
        price: '0.00',
        requirements: '',
        objectives: '',
        instructor: ''
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar evento",
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
      case 'cplg':
        return <Badge className="bg-orange-600/20 text-orange-400">CPLG</Badge>;
      case 'feg':
        return <Badge className="bg-yellow-600/20 text-yellow-400">FEG</Badge>;
      case 'acampamento':
        return <Badge className="bg-green-600/20 text-green-400">Acampamento</Badge>;
      case 'campanha':
        return <Badge className="bg-blue-600/20 text-blue-400">Campanha</Badge>;
      case 'doacao':
        return <Badge className="bg-purple-600/20 text-purple-400">Doação</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400">{type}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'treinamento':
        return <Badge className="bg-military-gold/20 text-military-gold">Treinamento</Badge>;
      case 'acampamento':
        return <Badge className="bg-green-600/20 text-green-400">Acampamento</Badge>;
      case 'campanha':
        return <Badge className="bg-blue-600/20 text-blue-400">Campanha</Badge>;
      default:
        return <Badge className="bg-gray-600/20 text-gray-400">{category}</Badge>;
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
                      <SelectItem value="cplg">CPLG</SelectItem>
                      <SelectItem value="feg">FEG</SelectItem>
                      <SelectItem value="acampamento">Acampamento</SelectItem>
                      <SelectItem value="campanha">Campanha</SelectItem>
                      <SelectItem value="doacao">Doação</SelectItem>

                    </SelectContent>
                  </Select>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-white">Valor (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newEvent.price}
                      onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
                      className="bg-military-black border-military-gold/30 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_participants" className="text-white">Máx. Participantes</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={newEvent.max_participants}
                      onChange={(e) => setNewEvent({...newEvent, max_participants: parseInt(e.target.value) || 50})}
                      className="bg-military-black border-military-gold/30 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration" className="text-white">Duração</Label>
                  <Input
                    id="duration"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                    className="bg-military-black border-military-gold/30 text-white"
                    placeholder="Ex: 2 dias, 4 horas"
                  />
                </div>
                <div>
                  <Label htmlFor="instructor" className="text-white">Instrutor (opcional)</Label>
                  <Input
                    id="instructor"
                    value={newEvent.instructor}
                    onChange={(e) => setNewEvent({...newEvent, instructor: e.target.value})}
                    className="bg-military-black border-military-gold/30 text-white"
                    placeholder="Nome do instrutor"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-white">Descrição</Label>
                  <Input
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="bg-military-black border-military-gold/30 text-white"
                    placeholder="Descrição do evento"
                  />
                </div>
                <div>
                  <Label htmlFor="requirements" className="text-white">Requisitos (opcional)</Label>
                  <Input
                    id="requirements"
                    value={newEvent.requirements}
                    onChange={(e) => setNewEvent({...newEvent, requirements: e.target.value})}
                    className="bg-military-black border-military-gold/30 text-white"
                    placeholder="Requisitos para participação"
                  />
                </div>
                <div>
                  <Label htmlFor="objectives" className="text-white">Objetivos (opcional)</Label>
                  <Input
                    id="objectives"
                    value={newEvent.objectives}
                    onChange={(e) => setNewEvent({...newEvent, objectives: e.target.value})}
                    className="bg-military-black border-military-gold/30 text-white"
                    placeholder="Objetivos do evento"
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
                    {new Date(event.start_date).toLocaleDateString('pt-BR')} - {new Date(event.end_date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex gap-2 mb-2">
                    {getCategoryBadge(event.category)}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPinIcon className="w-4 h-4 mr-2 text-military-gold" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <UsersIcon className="w-4 h-4 mr-2 text-military-gold" />
                    {event.registered_participants}/{event.max_participants} participantes
                  </div>
                  {event.price && parseFloat(event.price) > 0 && (
                    <div className="flex items-center text-military-gold text-sm font-bold">
                      <span className="mr-2">💰</span>
                      R$ {parseFloat(event.price).toFixed(2)}
                    </div>
                  )}
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