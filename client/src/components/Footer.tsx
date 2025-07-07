
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer className="bg-military-black border-t border-military-gold/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/c4ac806c-d627-45fe-bb9f-9a6d338605a0.png" 
                alt="Comando Gólgota" 
                className="h-12 w-12 object-contain"
              />
              <div className="text-xl font-bold text-military-gold">
                COMANDO GÓLGOTA
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Treinando para servir. Capacitamos missionários e líderes através de 
              treinamentos transformadores baseados em princípios cristãos e disciplina militar.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Filiado à IEADI - Igreja Evangélica Assembleia de Deus Itinerante
            </div>
          </div>

          {/* Contatos */}
          <div>
            <h4 className="text-white font-bold mb-4">Contatos</h4>
            <div className="space-y-2 text-gray-400">
              <div>
                <a href="mailto:contato@comandogolgota.com" className="hover:text-military-gold transition-colors">
                  contato@comandogolgota.com
                </a>
              </div>
              <div>
                <a href="tel:+5511999999999" className="hover:text-military-gold transition-colors">
                  (11) 99999-9999
                </a>
              </div>
              <div>
                <a href="https://instagram.com/comandogolgota" className="hover:text-military-gold transition-colors">
                  @comandogolgota
                </a>
              </div>
            </div>
          </div>

          {/* Links Úteis */}
          <div>
            <h4 className="text-white font-bold mb-4">Links Úteis</h4>
            <div className="space-y-2 text-gray-400">
              <div>
                <a href="#" className="hover:text-military-gold transition-colors">
                  Regimento Interno
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-military-gold transition-colors">
                  Política de Privacidade
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-military-gold transition-colors">
                  Fale Conosco
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-military-gold transition-colors">
                  ASGOL
                </a>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-military-gold/20" />

        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <div>
            © 2024 Comando Gólgota. Todos os direitos reservados.
          </div>
          <div className="mt-4 md:mt-0">
            "Treinando para Servir" - Desenvolvido com ❤️ para o Reino
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
