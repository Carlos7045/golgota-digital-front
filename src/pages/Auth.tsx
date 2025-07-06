import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, User, Mail, Lock } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  
  const { signIn, signUp } = useAuth();
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(signupData.email, signupData.password, signupData.name);
    
    if (!error) {
      // Usuario será redirecionado após confirmação do email
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-military-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-military-gold rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-black" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Comando Pré-Gólgota</h1>
          <p className="text-gray-400">Acesse sua conta militar</p>
        </div>

        <Card className="bg-military-black-light border-military-gold/20">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-military-black">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="data-[state=active]:bg-military-gold data-[state=active]:text-black text-gray-300"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-white">Fazer Login</CardTitle>
                <CardDescription className="text-gray-400">
                  Entre com suas credenciais militares
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-military-black border-military-gold/30 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha
                    </Label>
                    <Input
                      id="login-password"
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
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="text-white">Cadastro Militar</CardTitle>
                <CardDescription className="text-gray-400">
                  Crie sua conta para ingressar na comunidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome Completo
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-military-black border-military-gold/30 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-military-black border-military-gold/30 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Senha
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-military-black border-military-gold/30 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirmar Senha
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-military-black border-military-gold/30 text-white"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-military-gold hover:bg-military-gold-dark text-black"
                    disabled={isLoading || signupData.password !== signupData.confirmPassword}
                  >
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            ← Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;