
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <section id="inscricao" className="py-20 bg-hero-gradient hero-pattern">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="animate-fade-in">
            {/* Main Title */}
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Junte-se a Nós e
              <span className="text-military-gold block">Prepare-se para Servir!</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Venha ao Reino. Sua jornada de transformação espiritual e liderança começa aqui.
            </p>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-military-gold hover:bg-military-gold-light text-military-black font-bold px-12 py-4 text-xl"
                onClick={() => navigate('/auth')}
              >
                INSCREVA-SE AGORA
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-military-gold text-military-gold hover:bg-military-gold hover:text-military-black font-bold px-12 py-4 text-xl"
                onClick={handleAuthClick}
              >
                FAZER LOGIN
              </Button>
            </div>

            {/* Contact Info */}
            <div className="border-t border-military-gold/20 pt-8">
              <p className="text-gray-400 mb-4">
                Tem dúvidas? Entre em contato conosco
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-military-gold">
                <a href="mailto:contato@comandogolgota.com" className="hover:text-military-gold-light transition-colors">
                  contato@comandogolgota.com
                </a>
                <span className="hidden sm:block text-gray-600">|</span>
                <a href="https://wa.me/5599984339294?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20comando%20g%C3%B3lgota!" className="hover:text-military-gold-light transition-colors">(99) 98433-9294</a>
                <span className="hidden sm:block text-gray-600">|</span>
                <a href="https://instagram.com/comandogolgota" className="hover:text-military-gold-light transition-colors">
                  @comandogolgota
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
