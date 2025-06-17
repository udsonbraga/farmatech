
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CadastroProps {
  onBackToLogin: () => void;
}

const Cadastro: React.FC<CadastroProps> = ({ onBackToLogin }) => {
  const [formData, setFormData] = useState({
    farmaciaName: '',
    responsavelName: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { register, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validar nome da farmácia
    if (!formData.farmaciaName.trim()) {
      newErrors.farmaciaName = 'Nome da farmácia é obrigatório';
    } else if (formData.farmaciaName.trim().length < 2) {
      newErrors.farmaciaName = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar nome do responsável
    if (!formData.responsavelName.trim()) {
      newErrors.responsavelName = 'Nome do responsável é obrigatório';
    } else if (formData.responsavelName.trim().length < 2) {
      newErrors.responsavelName = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar e-mail
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    // Validar senha
if (!formData.senha) {
  newErrors.senha = 'Senha é obrigatória';
} else if (formData.senha.length < 8) { // MUDAR DE 6 PARA 8
  newErrors.senha = 'Senha deve ter pelo menos 8 caracteres'; // Mudar a mensagem
} else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.senha)) {
  newErrors.senha = 'Senha deve conter pelo menos uma letra e um número';
}

    // Validar confirmação de senha
    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    // Validar telefone
    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Telefone deve estar no formato (XX) XXXXX-XXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const { confirmarSenha, ...userData } = formData;
      const result = await register(userData);
      
      if (result.success) {
        toast.success('Cadastro realizado com sucesso!', {
          description: 'Você será redirecionado para o login em alguns segundos.',
          duration: 3000,
        });
        
        // Redirecionar para o login após 3 segundos
        setTimeout(() => {
          onBackToLogin();
        }, 3000);
      } else {
        toast.error('Erro no cadastro', {
          description: result.message
        });
      }
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Tente novamente em alguns instantes'
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleInputChange('telefone', formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farmatech-teal/10 to-farmatech-blue/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLogin}
              className="p-2"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full farmatech-teal">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">FarmaTech</h1>
            </div>
            <div className="w-8"></div>
          </div>
          <p className="text-muted-foreground">Crie sua conta</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmaciaName">Nome da Farmácia *</Label>
              <Input
                id="farmaciaName"
                type="text"
                value={formData.farmaciaName}
                onChange={(e) => handleInputChange('farmaciaName', e.target.value)}
                className={`h-12 rounded-lg border-2 focus:border-farmatech-teal ${
                  errors.farmaciaName ? 'border-red-500' : ''
                }`}
                placeholder="Farmácia Central"
                disabled={isLoading}
              />
              {errors.farmaciaName && (
                <p className="text-sm text-red-500">{errors.farmaciaName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavelName">Nome do responsável *</Label>
              <Input
                id="responsavelName"
                type="text"
                value={formData.responsavelName}
                onChange={(e) => handleInputChange('responsavelName', e.target.value)}
                className={`h-12 rounded-lg border-2 focus:border-farmatech-teal ${
                  errors.responsavelName ? 'border-red-500' : ''
                }`}
                placeholder="João Silva"
                disabled={isLoading}
              />
              {errors.responsavelName && (
                <p className="text-sm text-red-500">{errors.responsavelName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`h-12 rounded-lg border-2 focus:border-farmatech-teal ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder="seu@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={(e) => handleInputChange('senha', e.target.value)}
                  className={`h-12 rounded-lg border-2 focus:border-farmatech-teal pr-12 ${
                    errors.senha ? 'border-red-500' : ''
                  }`}
                  placeholder="Mínimo 6 caracteres com letra e número"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.senha && (
                <p className="text-sm text-red-500">{errors.senha}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmarSenha}
                  onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  className={`h-12 rounded-lg border-2 focus:border-farmatech-teal pr-12 ${
                    errors.confirmarSenha ? 'border-red-500' : ''
                  }`}
                  placeholder="Confirme sua senha"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmarSenha && (
                <p className="text-sm text-red-500">{errors.confirmarSenha}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`h-12 rounded-lg border-2 focus:border-farmatech-teal ${
                  errors.telefone ? 'border-red-500' : ''
                }`}
                placeholder="(11) 99999-9999"
                maxLength={15}
                disabled={isLoading}
              />
              {errors.telefone && (
                <p className="text-sm text-red-500">{errors.telefone}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 farmatech-teal hover:farmatech-teal-light text-white font-semibold rounded-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cadastro;
