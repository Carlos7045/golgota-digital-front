
import { Calendar } from 'lucide-react';
import { User } from '@/pages/Community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EventsChannelProps {
  user: User;
}

const EventsChannel = ({ user }: EventsChannelProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center mb-2">
            <Calendar className="mr-3" size={24} />
            Eventos
          </h2>
          <p className="text-gray-400">
            Reuniões no Zoom, encontros e eventos especiais
          </p>
        </div>

        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold">Em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Este canal está sendo preparado com a agenda de eventos.
              Em breve você terá acesso aos links do Zoom, calendário de encontros e eventos especiais.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventsChannel;
