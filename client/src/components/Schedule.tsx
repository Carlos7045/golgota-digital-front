
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const Schedule = () => {
  const events = [
    {
      title: 'Rally Missionário 2025',
      date: '15-17 de Março, 2025',
      location: 'Sede do Comando Gólgota',
      participants: '200 vagas',
      status: 'Inscrições Abertas',
      statusColor: 'bg-green-500',
      description: 'Treinamento intensivo de 3 dias focado em criatividade e resistência missionária'
    },
    {
      title: 'Acampamento Gólgota',
      date: '15-22 de Julho, 2025',
      location: 'Mata Atlântica - Local Reservado',
      participants: '150 vagas',
      status: 'Em Breve',
      statusColor: 'bg-yellow-500',
      description: 'Semana completa de sobrevivência e treinamento espiritual na natureza'
    },
    {
      title: 'FEG - Fase 1',
      date: '20-27 de Setembro, 2025',
      location: 'Centro de Treinamento Avançado',
      participants: '50 vagas',
      status: 'Pré-requisitos',
      statusColor: 'bg-blue-500',
      description: 'Formação especial para membros selecionados - Gadita Gólgota'
    }
  ];

  return (
    <section id="agenda" className="py-20 bg-military-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-divider mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Próxima <span className="text-military-gold">Agenda</span>
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Eventos programados para 2025 - Prepare-se para uma jornada de transformação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <Card 
              key={event.title}
              className="bg-military-black-light border-military-gold/20 hover:border-military-gold/40 transition-all duration-300 hover:transform hover:scale-105 group relative overflow-hidden"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="absolute top-0 right-0 p-3">
                <div className={`${event.statusColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {event.status}
                </div>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-white pr-20">{event.title}</CardTitle>
                <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-military-gold flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-military-gold flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-military-gold flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{event.participants}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-military-gold/20">
                  <Button 
                    className="w-full bg-military-gold hover:bg-military-gold-dark text-black font-bold group-hover:scale-105 transition-transform duration-200"
                    disabled={event.status === 'Em Breve'}
                  >
                    {event.status === 'Inscrições Abertas' ? 'INSCREVA-SE' : 
                     event.status === 'Em Breve' ? 'EM BREVE' : 'SAIBA MAIS'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-6">
            Fique atento às nossas redes sociais para atualizações e novas datas
          </p>
          <Button 
            variant="outline" 
            className="border-military-gold text-military-gold hover:bg-military-gold hover:text-black font-bold"
          >
            Seguir no Instagram
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
