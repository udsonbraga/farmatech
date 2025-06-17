// src/components/Login.tsx (Exemplo de ajuste)

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface LoginProps {
  onRegisterClick: () => void;
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // NOVO: Estado para controlar o envio

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Ativa o estado de envio
    try {
      const result = await login({ email, senha });
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        onLoginSuccess();
      } else {
        toast.error('Erro no login', {
          description: result.error || 'Credenciais inválidas. Tente novamente.'
        });
      }
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      toast.error('Erro de conexão', {
        description: 'Não foi possível conectar ao servidor. Verifique sua rede.'
      });
    } finally {
      setIsSubmitting(false); // Desativa o estado de envio
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-farmatech-teal/10 to-farmatech-blue/10 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-farmatech-blue">FarmaTech</CardTitle>
          <p className="text-muted-foreground">Acesse sua conta</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting} // Desabilita input durante o envio
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="********"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={isSubmitting} // Desabilita input durante o envio
              />
            </div>
            <Button 
              type="submit" 
              className="w-full farmatech-blue hover:farmatech-blue-light"
              disabled={isSubmitting} // Desabilita o botão durante o envio
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'} {/* Muda o texto do botão */}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Button type="button" variant="link" onClick={onRegisterClick} disabled={isSubmitting}>
                Cadastre-se
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;