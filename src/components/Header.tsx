
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Sobre', href: '#sobre' },
    { name: 'Treinamentos', href: '#treinamentos' },
    { name: 'Acampamentos', href: '#acampamentos' },
    { name: 'Agenda', href: '#agenda' },
    { name: 'Inscreva-se', href: '#inscricao' },
  ];

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-military-black/95 backdrop-blur-sm border-b border-military-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/c4ac806c-d627-45fe-bb9f-9a6d338605a0.png" 
              alt="Comando Gólgota" 
              className="h-10 w-10 object-contain"
            />
            <div className="text-xl font-bold text-military-gold">
              COMANDO GÓLGOTA
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-military-gold transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Login Button */}
          <div className="hidden md:block">
            <Button 
              variant="outline" 
              className="border-military-gold text-military-gold hover:bg-military-gold hover:text-black"
              onClick={handleLoginClick}
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-military-black/98 border-t border-military-gold/20">
            <nav className="flex flex-col space-y-4 py-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-military-gold transition-colors duration-200 font-medium px-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="px-4 pt-2">
                <Button 
                  variant="outline" 
                  className="w-full border-military-gold text-military-gold hover:bg-military-gold hover:text-black"
                  onClick={() => {
                    handleLoginClick();
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
