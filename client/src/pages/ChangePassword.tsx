import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiPut } from '@/lib/api';
import { Shield, Eye, EyeOff } from 'lucide-react';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await apiPut('/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso!",
      });

      // Redirect to community
      navigate('/comunidade');
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-military-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-military-black-light border-military-gold/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-military-gold/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-military-gold" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Alterar Senha
          </CardTitle>
          <p className="text-gray-400">
            É necessário alterar sua senha padrão
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-gray-300">
                Senha Atual
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  className="bg-military-black border-military-gold/30 text-white pr-10"
                  placeholder="Digite sua senha atual"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-gray-300">
                Nova Senha
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="bg-military-black border-military-gold/30 text-white"
                placeholder="Digite sua nova senha"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="bg-military-black border-military-gold/30 text-white pr-10"
                  placeholder="Confirme sua nova senha"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-military-gold text-black hover:bg-military-gold-dark"
              disabled={loading}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;