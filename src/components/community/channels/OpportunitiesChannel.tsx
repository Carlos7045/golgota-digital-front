
import { Briefcase } from 'lucide-react';
import { User } from '@/pages/Community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OpportunitiesChannelProps {
  user: User;
}

const OpportunitiesChannel = ({ user }: OpportunitiesChannelProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center mb-2">
            <Briefcase className="mr-3" size={24} />
            Oportunidades
          </h2>
          <p className="text-gray-400">
            Vagas de liderança, cruzadas e oportunidades de serviço
          </p>
        </div>

        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold">Em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Este canal está sendo preparado com oportunidades de serviço.
              Em breve você terá acesso a vagas de liderança, cruzadas missionárias e outras oportunidades.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OpportunitiesChannel;
