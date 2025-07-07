import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiPost } from '@/lib/api';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    address: '',
    birthYear: '',
    company: '',
    currentRank: 'aluno'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const companies = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot'];
  const ranks = [
    { value: 'aluno', label: 'Aluno' },
    { value: 'soldado', label: 'Soldado' },
    { value: 'cabo', label: 'Cabo' },
    { value: 'sargento', label: 'Sargento' },
    { value: 'tenente', label: 'Tenente' },
    { value: 'capitao', label: 'Capitão' },
    { value: 'major', label: 'Major' },
    { value: 'coronel', label: 'Coronel' },
    { value: 'comandante', label: 'Comandante' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Fazer cadastro via API
      await apiPost('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        cpf: formData.cpf,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        birthYear: formData.birthYear,
        company: formData.company,
        rank: formData.currentRank
      });

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada. Faça login para acessar a plataforma.",
      });

      navigate('/auth');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Erro no cadastro",
        description: error.response?.data?.message || "Erro ao criar conta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-hero-gradient hero-pattern flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 text-primary hover:text-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <img 
            src="/lovable-uploads/c4ac806c-d627-45fe-bb9f-9a6d338605a0.png" 
            alt="Comando Gólgota" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-military-gold">COMANDO GÓLGOTA</h1>
          <p className="text-foreground/70">Cadastro de Novo Membro</p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-center">Inscreva-se</CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              Preencha todos os dados para solicitar acesso à comunidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">Nome Completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-background border-border text-foreground"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Email e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-background border-border text-foreground pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="bg-background border-border text-foreground pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cidade e CIA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">Cidade *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="Sua cidade"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">CIA (Companhia) *</Label>
                  <Select value={formData.company} onValueChange={(value) => handleInputChange('company', value)} required>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione sua CIA" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company} value={company}>
                          CIA {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dados Pessoais Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-foreground">CPF *</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthYear" className="text-foreground">Ano de Nascimento *</Label>
                  <Input
                    id="birthYear"
                    type="number"
                    value={formData.birthYear}
                    onChange={(e) => handleInputChange('birthYear', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="1990"
                    min="1940"
                    max={new Date().getFullYear() - 16}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Patente Atual *</Label>
                  <Select value={formData.currentRank} onValueChange={(value) => handleInputChange('currentRank', value)} required>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ranks.map((rank) => (
                        <SelectItem key={rank.value} value={rank.value}>
                          {rank.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Endereço Completo *</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="bg-background border-border text-foreground"
                  placeholder="Rua, número, bairro, CEP"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-military-gold hover:bg-military-gold-light text-military-black font-bold"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando cadastro...' : 'Finalizar Cadastro'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Já tem uma conta? 
                <button 
                  onClick={() => navigate('/login')}
                  className="text-military-gold hover:text-accent ml-1 underline"
                >
                  Faça login aqui
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;