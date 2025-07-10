import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiPost, apiGet } from '@/lib/api';

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
  const [companies, setCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Buscar companhias do banco de dados
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const response = await apiGet('/api/companies');
        setCompanies(response.companies || []);
      } catch (error) {
        console.error('Erro ao buscar companhias:', error);
        // Fallback para companhias padrão se não conseguir buscar
        setCompanies([
          { id: 1, name: 'Quemuel', description: 'Companhia Principal' }
        ]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

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
    <div className="min-h-screen bg-military-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-military-gold/10 via-military-black to-military-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 text-military-gold hover:text-military-gold-light"
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
          <p className="text-gray-300">Cadastro de Novo Membro</p>
        </div>

        <Card className="bg-military-black-light border-military-gold/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-military-gold text-center text-xl">Inscreva-se</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Preencha todos os dados para solicitar acesso à comunidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Nome Completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-military-black border-military-gold/30 text-white placeholder:text-gray-400 focus:border-military-gold"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Email e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-military-black border-military-gold/30 text-white placeholder:text-gray-400 focus:border-military-gold"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-military-black border-military-gold/30 text-white placeholder:text-gray-400 focus:border-military-gold"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-military-black border-military-gold/30 text-white placeholder:text-gray-400 focus:border-military-gold pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-military-gold"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="bg-military-black border-military-gold/30 text-white placeholder:text-gray-400 focus:border-military-gold pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-military-gold"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cidade e CIA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">Cidade *</Label>
                  <Input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="bg-military-black border-military-gold/30 text-white placeholder:text-gray-400 focus:border-military-gold"
                    placeholder="Sua cidade"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">CIA (Companhia) *</Label>
                  <Select value={formData.company} onValueChange={(value) => handleInputChange('company', value)} required>
                    <SelectTrigger className="bg-military-black border-military-gold/30 text-white focus:border-military-gold">
                      <SelectValue placeholder={loadingCompanies ? "Carregando..." : "Selecione sua CIA"} />
                    </SelectTrigger>
                    <SelectContent className="bg-military-black border-military-gold/30">
                      {companies.map((company) => (
                        <SelectItem key={company.id || company.name} value={company.name} className="text-white hover:bg-military-gold/10">
                          CIA {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dados Pessoais Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-white">CPF *</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    className="bg-military-black border-military-gold/30 text-white placeholder:text-gray-400 focus:border-military-gold"
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthYear" className="text-white">Ano de Nascimento *</Label>
                  <Input
                    id="birthYear"
                    type="number"
                    value={formData.birthYear}
                    onChange={(e) => handleInputChange('birthYear', e.target.value)}
                    className="bg-military-black border-military-gold/30 text-white placeholder:text-gray-400 focus:border-military-gold"
                    placeholder="1990"
                    min="1940"
                    max={new Date().getFullYear() - 16}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Patente Atual *</Label>
                  <Select value={formData.currentRank} onValueChange={(value) => handleInputChange('currentRank', value)} required>
                    <SelectTrigger className="bg-military-black border-military-gold/30 text-white focus:border-military-gold">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-military-black border-military-gold/30">
                      {ranks.map((rank) => (
                        <SelectItem key={rank.value} value={rank.value} className="text-white hover:bg-military-gold/10">
                          {rank.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-white">Endereço Completo *</Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="bg-military-black border-military-gold/30 text-white placeholder:text-gray-400 focus:border-military-gold"
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
              <p className="text-gray-300 text-sm">
                Já tem uma conta? 
                <button 
                  onClick={() => navigate('/login')}
                  className="text-military-gold hover:text-military-gold-light ml-1 underline"
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