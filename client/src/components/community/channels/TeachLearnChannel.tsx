
import { BookOpen } from 'lucide-react';
import { User } from '@/pages/Community';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeachLearnChannelProps {
  user: User;
}

const TeachLearnChannel = ({ user }: TeachLearnChannelProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-military-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center mb-2">
            <BookOpen className="mr-3" size={24} />
            Ensine/Aprenda
          </h2>
          <p className="text-gray-400">
            Compartilhe conhecimento e aprenda com outros membros
          </p>
        </div>

        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-military-gold">Em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Este canal está sendo preparado para o compartilhamento de conhecimentos.
              Em breve você poderá compartilhar experiências, tutoriais e aprender com outros membros.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeachLearnChannel;
