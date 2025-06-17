
import { Shield } from 'lucide-react';
import { User } from '@/pages/Community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyPanelChannelProps {
  user: User;
}

const CompanyPanelChannel = ({ user }: CompanyPanelChannelProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center mb-2">
            <Shield className="mr-3" size={24} />
            Painel da Companhia
          </h2>
          <p className="text-gray-400">
            Área restrita para comandantes e administradores
          </p>
        </div>

        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold">Área Restrita</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Este painel está sendo desenvolvido para comandantes e administradores.
              Funcionalidades incluirão gestão de membros, relatórios e ferramentas administrativas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyPanelChannel;
