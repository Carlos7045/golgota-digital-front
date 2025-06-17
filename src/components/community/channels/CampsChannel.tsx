
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tent } from 'lucide-react';
import { User } from '@/pages/Community';

interface CampsChannelProps {
  user: User;
}

const CampsChannel = ({ user }: CampsChannelProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center mb-2">
            <Tent className="mr-3" size={24} />
            Acampamentos
          </h2>
          <p className="text-gray-400">
            Experiências na selva para fortalecimento espiritual e trabalho em equipe
          </p>
        </div>

        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold">Em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Este canal está sendo preparado com informações sobre os acampamentos.
              Em breve você terá acesso a cronogramas, galeria de fotos e fórum de discussões.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampsChannel;
