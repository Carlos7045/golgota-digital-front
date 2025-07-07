
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-hero-gradient hero-pattern">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-military-gold/20 border border-military-gold/30 mb-6">
            <span className="text-military-gold font-semibold text-sm">
              ⭐ TREINANDO PARA SERVIR
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            COMANDO
            <span className="text-military-gold block">GÓLGOTA</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Participe dos nossos treinamentos missionários e acampamentos para 
            <span className="text-military-gold font-semibold"> fortalecer sua fé e liderança</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-military-gold hover:bg-military-gold-light text-military-black font-bold px-8 py-3 text-lg"
              onClick={() => navigate('/cadastro')}
            >
              INSCREVA-SE AGORA
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-military-gold text-military-gold hover:bg-military-gold hover:text-military-black font-bold px-8 py-3 text-lg"
            >
              SAIBA MAIS
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-12 pt-8 border-t border-military-gold/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-military-gold">15+</div>
              <div className="text-gray-400">Anos de Experiência</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-military-gold">500+</div>
              <div className="text-gray-400">Membros Treinados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-military-gold">50+</div>
              <div className="text-gray-400">Acampamentos Realizados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-military-gold rounded-full flex justify-center">
          <div className="w-1 h-3 bg-military-gold rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
