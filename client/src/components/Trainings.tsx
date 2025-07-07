
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Crown, Compass } from 'lucide-react';

const Trainings = () => {
  const trainings = [
    {
      icon: Zap,
      title: 'Rally Missionário',
      description: 'Desenvolvimento de criatividade, resistência física e mental, focado na missão evangelística',
      features: ['Provas de Resistência', 'Trabalho em Equipe', 'Criatividade Missionária', 'Liderança Prática'],
      duration: '3 dias intensivos',
      level: 'Iniciante a Avançado'
    },
    {
      icon: Crown,
      title: 'CPLG - Curso de Liderança',
      description: 'Formação completa em liderança cristã, submissão e superação pessoal dividido em fases progressivas',
      features: ['Liderança Estratégica', 'Submissão Consciente', 'Superação de Limites', 'Mentoria Personalizada'],
      duration: 'Fases Progressivas',
      level: 'Intermediário a Avançado'
    },
    {
      icon: Compass,
      title: 'FEG - Formação Especial',
      description: 'Treinamento avançado de sobrevivência e a tradicional Gadita Gólgota',
      features: ['Sobrevivência na Selva', 'Gadita Gólgota', 'Resistência Extrema', 'Formação Elite'],
      duration: '7 dias intensivos',
      level: 'Avançado'
    }
  ];

  return (
    <section id="treinamentos" className="py-20 bg-military-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-divider mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nossos <span className="text-military-gold">Treinamentos</span>
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Programas de formação que transformam vidas através da disciplina, fé e superação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainings.map((training, index) => (
            <Card 
              key={training.title}
              className="bg-military-black-light border-military-gold/20 hover:border-military-gold/40 transition-all duration-300 hover:transform hover:scale-105 group"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-military-gold/20 rounded-full flex items-center justify-center group-hover:bg-military-gold/30 transition-colors duration-300">
                    <training.icon className="w-8 h-8 text-military-gold" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-white">{training.title}</CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  {training.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  {training.features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-military-gold rounded-full"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-military-gold/20 pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Duração:</span>
                    <span className="text-military-gold text-sm font-semibold">{training.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Nível:</span>
                    <span className="text-military-gold text-sm font-semibold">{training.level}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-military-gold hover:bg-military-gold-dark text-black font-bold"
                >
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Trainings;
