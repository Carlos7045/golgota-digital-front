import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Users, Calendar, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Rally Missionário 2025',
    type: 'rally',
    date: '2025-03-15',
    location: 'Campo de Treinamento - SP',
    duration: '3 dias',
    maxParticipants: 150,
    registeredParticipants: 89,
    status: 'active',
    description: 'Rally focado em criatividade, resistência e missão.'
  },
  {
    id: '2',
    name: 'Acampamento Gólgota - Julho',
    type: 'camp',
    date: '2025-07-20',
    location: 'Mata Atlântica - RJ',
    duration: '5 dias',
    maxParticipants: 100,
    registeredParticipants: 34,
    status: 'planning',
    description: 'Treinamento na selva para fortalecimento espiritual.'
  },
  {
    id: '3',
    name: 'FEG - Fase 1',
    type: 'training',
    date: '2025-05-10',
    location: 'Base Gólgota',
    duration: '2 dias',
    maxParticipants: 50,
    registeredParticipants: 23,
    status: 'planning',
    description: 'Primeira fase do treinamento de sobrevivência.'
  }
];

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedTab, setSelectedTab] = useState('events');
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'rally' as const,
    date: '',
    location: '',
    duration: '',
    maxParticipants: 50,
    description: ''
  });
  const { toast } = useToast();

  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.date || !newEvent.location) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      name: newEvent.name,
      type: newEvent.type,
      date: newEvent.date,
      location: newEvent.location,
      duration: newEvent.duration,
      maxParticipants: newEvent.maxParticipants,
      registeredParticipants: 0,
      status: 'planning',
      description: newEvent.description
    };

    setEvents(prev => [event, ...prev]);
    setNewEvent({
      name: '',
      type: 'rally',
      date: '',
      location: '',
      duration: '',
      maxParticipants: 50,
      description: ''
    });
    
    toast({
      title: "Evento criado",
      description: "O evento foi criado com sucesso",
    });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    toast({
      title: "Evento removido",
      description: "O evento foi removido com sucesso",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rally': return 'bg-military-gold';
      case 'camp': return 'bg-green-600';
      case 'training': return 'bg-blue-600';
      case 'meeting': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'planning': return 'bg-yellow-600';
      case 'completed': return 'bg-blue-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rally': return 'Rally';
      case 'camp': return 'Acampamento';
      case 'training': return 'Treinamento';
      case 'meeting': return 'Reunião';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'planning': return 'Planejando';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gestão de Eventos</h2>
          <p className="text-gray-400">Gerencie rallys, acampamentos e treinamentos</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 bg-military-black-light">
            <TabsTrigger value="events" className="data-[state=active]:bg-military-gold data-[state=active]:text-black">
              <Calendar className="w-4 h-4 mr-2" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-military-gold data-[state=active]:text-black">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-military-black-light border-military-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-military-gold" />
                    <div>
                      <p className="text-xs text-gray-400">Eventos Ativos</p>
                      <p className="text-lg font-bold text-white">
                        {events.filter(e => e.status === 'active').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-military-black-light border-military-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-xs text-gray-400">Total Inscritos</p>
                      <p className="text-lg font-bold text-white">
                        {events.reduce((sum, e) => sum + e.registeredParticipants, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-military-black-light border-military-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400">Em Planejamento</p>
                      <p className="text-lg font-bold text-white">
                        {events.filter(e => e.status === 'planning').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-military-black-light border-military-gold/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <div>
                      <p className="text-xs text-gray-400">Concluídos</p>
                      <p className="text-lg font-bold text-white">
                        {events.filter(e => e.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-military-gold">Lista de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Nome</TableHead>
                      <TableHead className="text-gray-400">Tipo</TableHead>
                      <TableHead className="text-gray-400">Data</TableHead>
                      <TableHead className="text-gray-400">Local</TableHead>
                      <TableHead className="text-gray-400">Participantes</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{event.name}</TableCell>
                        <TableCell>
                          <Badge className={`${getTypeColor(event.type)} text-white text-xs`}>
                            {getTypeLabel(event.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {event.location}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {event.registeredParticipants}/{event.maxParticipants}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(event.status)} text-white text-xs`}>
                            {getStatusLabel(event.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-military-gold hover:bg-military-gold/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-400 hover:bg-red-600/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-military-gold">Criar Novo Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Nome do Evento *
                    </label>
                    <Input
                      placeholder="Ex: Rally Missionário 2025"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-military-black border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Tipo
                    </label>
                    <Select 
                      value={newEvent.type} 
                      onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="bg-military-black border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rally">Rally</SelectItem>
                        <SelectItem value="camp">Acampamento</SelectItem>
                        <SelectItem value="training">Treinamento</SelectItem>
                        <SelectItem value="meeting">Reunião</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Data *
                    </label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      className="bg-military-black border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Duração
                    </label>
                    <Input
                      placeholder="Ex: 3 dias"
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, duration: e.target.value }))}
                      className="bg-military-black border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Máx. Participantes
                    </label>
                    <Input
                      type="number"
                      value={newEvent.maxParticipants}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 50 }))}
                      className="bg-military-black border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Local *
                  </label>
                  <Input
                    placeholder="Ex: Campo de Treinamento - SP"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-military-black border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Descrição
                  </label>
                  <Textarea
                    placeholder="Descreva o evento..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-military-black border-gray-600 text-white min-h-24"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateEvent}
                    className="bg-military-gold text-black hover:bg-military-gold/80"
                  >
                    Criar Evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventManagement;