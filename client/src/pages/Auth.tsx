import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Mail, Lock, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/comunidade';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);
    
    if (!error) {
      navigate(from, { replace: true });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-military-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-military-gold p-3 rounded-full">
              <Shield className="h-8 w-8 text-military-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Comando Gólgota</h1>
          <p className="text-gray-400">Entre na sua conta para continuar</p>
        </div>

        {/* Login Form */}
        <Card className="bg-military-black-light border-military-gold/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Login</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Acesse sua conta do Comando Gólgota
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-military-black border-military-gold/30 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-military-black border-military-gold/30 text-white"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-military-gold hover:bg-military-gold-dark text-black"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Cadastro Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 mb-4">
            Ainda não tem uma conta?
          </p>
          <Button 
            variant="outline"
            onClick={() => navigate('/cadastro')}
            className="w-full border-military-gold text-military-gold hover:bg-military-gold hover:text-black"
          >
            Fazer Cadastro Completo
          </Button>
        </div>

        {/* Voltar */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;