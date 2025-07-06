import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    company: '',
    cpglYear: '',
    cpglMonth: '',
    currentRank: 'aluno'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const companies = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot'];
  const ranks = [{
    value: 'aluno',
    label: 'Aluno'
  }, {
    value: 'soldado',
    label: 'Soldado'
  }, {
    value: 'cabo',
    label: 'Cabo'
  }, {
    value: 'sargento',
    label: 'Sargento'
  }, {
    value: 'tenente',
    label: 'Tenente'
  }, {
    value: 'capitao',
    label: 'Capitão'
  }, {
    value: 'major',
    label: 'Major'
  }, {
    value: 'coronel',
    label: 'Coronel'
  }, {
    value: 'comandante',
    label: 'Comandante'
  }];
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

    // Simular envio do cadastro
    setTimeout(() => {
      // Criar usuário com status pendente
      const newUser = {
        id: Date.now().toString(),
        name: formData.fullName,
        email: formData.email,
        rank: formData.currentRank,
        company: formData.company,
        city: formData.city,
        phone: formData.phone,
        cpglYear: formData.cpglYear,
        cpglMonth: formData.cpglMonth,
        status: 'pendente',
        // Status de pré-aprovação
        registeredAt: new Date().toISOString()
      };

      // Salvar no localStorage (temporário)
      const pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      pendingUsers.push(newUser);
      localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
      setIsLoading(false);
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Seu cadastro foi enviado para análise. Aguarde aprovação dos administradores."
      });
      navigate('/login');
    }, 2000);
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return <div className="min-h-screen bg-hero-gradient hero-pattern flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="absolute top-4 left-4 text-primary hover:text-accent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <img src="/lovable-uploads/c4ac806c-d627-45fe-bb9f-9a6d338605a0.png" alt="Comando Gólgota" className="h-16 w-16 mx-auto mb-4" />
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
                <Input id="fullName" type="text" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="bg-background border-border text-foreground" placeholder="Seu nome completo" required />
              </div>

              {/* Email e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="bg-background border-border text-foreground" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="bg-background border-border text-foreground" placeholder="(11) 99999-9999" />
                </div>
              </div>

              {/* Senha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Senha *</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="bg-background border-border text-foreground pr-10" placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} className="bg-background border-border text-foreground pr-10" placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cidade e CIA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">Cidade *</Label>
                  <Input id="city" type="text" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className="bg-background border-border text-foreground" placeholder="Sua cidade" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">CIA (Companhia) *</Label>
                  <Select value={formData.company} onValueChange={value => handleInputChange('company', value)} required>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione sua CIA" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => <SelectItem key={company} value={company}>
                          CIA {company}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CPGL Data e Patente */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Ano CPGL</Label>
                  <Input type="number" value={formData.cpglYear} onChange={e => handleInputChange('cpglYear', e.target.value)} className="bg-background border-border text-foreground" placeholder="2024" min="2000" max={new Date().getFullYear()} />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Mês CPGL</Label>
                  <Select value={formData.cpglMonth} onValueChange={value => handleInputChange('cpglMonth', value)}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({
                      length: 12
                    }, (_, i) => <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                          {new Date(2024, i).toLocaleDateString('pt-BR', {
                        month: 'long'
                      })}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Patente Atual *</Label>
                  <Select value={formData.currentRank} onValueChange={value => handleInputChange('currentRank', value)} required>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {ranks.map(rank => <SelectItem key={rank.value} value={rank.value}>
                          {rank.label}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full text-secondary-foreground font-bold bg-military-gold">
                {isLoading ? 'Enviando cadastro...' : 'Finalizar Cadastro'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Já tem uma conta? 
                <button onClick={() => navigate('/login')} className="text-secondary hover:text-accent ml-1 underline">
                  Faça login aqui
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Register;