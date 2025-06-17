
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreePine, Users, Calendar, MapPin } from 'lucide-react';

const Camps = () => {
  const requirements = [
    'Idade mínima: 14 anos',
    'Autorização para menores de idade',
    'Taxa de participação obrigatória',
    'Exame médico atualizado',
    'Equipamentos básicos de camping'
  ];

  const campImages = [
    '/lovable-uploads/f32c46af-478c-4fc7-99bb-9558787d6acb.png',
    // Placeholder para mais imagens quando fornecidas
  ];

  return (
    <section id="acampamentos" className="py-20 bg-section-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="section-divider mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-military-gold">Acampamentos</span> Gólgota
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Treinamento na selva para jovens, adultos e crianças, focado em espiritualidade e trabalho em equipe
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Informações */}
          <div className="space-y-8">
            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <TreePine className="w-6 h-6 text-military-gold mr-3" />
                  Experiência Completa
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Uma jornada de transformação em contato com a natureza
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-military-gold" />
                    <span className="text-gray-300">Todas as idades</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-military-gold" />
                    <span className="text-gray-300">7 dias intensivos</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-military-gold" />
                    <span className="text-gray-300">Ambiente selvagem</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TreePine className="w-5 h-5 text-military-gold" />
                    <span className="text-gray-300">Sobrevivência</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-military-black-light border-military-gold/20">
              <CardHeader>
                <CardTitle className="text-xl text-white">Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-military-gold rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-military-gold hover:bg-military-gold-dark text-black font-bold flex-1"
              >
                INSCREVA-SE AGORA
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-military-gold text-military-gold hover:bg-military-gold hover:text-black font-bold flex-1"
              >
                MAIS INFORMAÇÕES
              </Button>
            </div>
          </div>

          {/* Galeria */}
          <div className="space-y-6">
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src="/lovable-uploads/f32c46af-478c-4fc7-99bb-9558787d6acb.png" 
                alt="Acampamento Gólgota" 
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Galeria de Acampamentos</h3>
                  <p className="text-gray-200">Momentos transformadores na natureza</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-military-black-light rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-military-gold mb-2">50+</div>
                <div className="text-gray-400">Acampamentos Realizados</div>
              </div>
              <div className="bg-military-black-light rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-military-gold mb-2">1000+</div>
                <div className="text-gray-400">Vidas Transformadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Camps;
