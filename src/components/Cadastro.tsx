import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CadastroProps {
  onRegister: (userData: {
    farmaciaName: string;
    responsavelName: string;
    email: string;
    senha: string;
    telefone: string;
  }) => void;
  onBackToLogin: () => void;
}

const Cadastro: React.FC<CadastroProps> = ({ onRegister, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    farmaciaName: '',
    responsavelName: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      toast.error('As senhas não coincidem', {
        description: 'Por favor, verifique se as senhas são idênticas.'
      });
      return;
    }
    
    const { confirmarSenha, ...userData } = formData;
    
    // Simula o cadastro
    onRegister(userData);
    
    // Mostra mensagem de sucesso
    toast.success('Cadastro realizado com sucesso!', {
      description: 'Sua conta foi criada. Você será redirecionado para o login em alguns segundos.',
      duration: 3000,
    });
    
    // Redireciona para o login após 3 segundos
    setTimeout(() => {
      onBackToLogin();
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmaciaName">Nome da Farmácia</Label>
              <Input
                id="farmaciaName"
                type="text"
                value={formData.farmaciaName}
                onChange={(e) => handleInputChange('farmaciaName', e.target.value)}
                className="h-12 rounded-lg border-2 focus:border-farmatech-teal"
                placeholder="Farmácia Central"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavelName">Nome do responsável</Label>
              <Input
                id="responsavelName"
                type="text"
                value={formData.responsavelName}
                onChange={(e) => handleInputChange('responsavelName', e.target.value)}
                className="h-12 rounded-lg border-2 focus:border-farmatech-teal"
                placeholder="João Silva"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="h-12 rounded-lg border-2 focus:border-farmatech-teal"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => handleInputChange('senha', e.target.value)}
                className="h-12 rounded-lg border-2 focus:border-farmatech-teal"
                placeholder="Digite sua senha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={formData.confirmarSenha}
                onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                className="h-12 rounded-lg border-2 focus:border-farmatech-teal"
                placeholder="Confirme sua senha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="h-12 rounded-lg border-2 focus:border-farmatech-teal"
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 farmatech-teal hover:farmatech-teal-light text-white font-semibold rounded-lg transition-all duration-200"
            >
              Criar Conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cadastro;
