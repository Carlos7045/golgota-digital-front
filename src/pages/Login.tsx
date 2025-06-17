
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular autenticação (substituir por integração real)
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Soldado João Silva',
        email: email,
        rank: 'soldado',
        company: 'Alpha'
      }));
      setIsLoading(false);
      navigate('/comunidade');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-hero-gradient hero-pattern flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/c4ac806c-d627-45fe-bb9f-9a6d338605a0.png" 
            alt="Comando Gólgota" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-military-gold">COMANDO GÓLGOTA</h1>
          <p className="text-gray-300">Área de Membros</p>
        </div>

        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Acesso à Comunidade</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Entre com suas credenciais para acessar a área interna
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-military-black border-military-gold/30 text-white"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-military-black border-military-gold/30 text-white pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-military-gold hover:bg-military-gold-dark text-black font-bold"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Não tem acesso? 
                <a href="/#inscricao" className="text-military-gold hover:text-military-gold-light ml-1">
                  Inscreva-se aqui
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
