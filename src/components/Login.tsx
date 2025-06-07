
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, senha: string) => void;
  onShowRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, senha);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farmatech-teal/10 to-farmatech-blue/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-full farmatech-teal">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">FarmaTech</h1>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-12 rounded-lg border-2 focus:border-farmatech-teal"
                placeholder="Digite sua senha"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 farmatech-teal hover:farmatech-teal-light text-white font-semibold rounded-lg transition-all duration-200"
            >
              Entrar
            </Button>
          </form>
          <div className="text-center">
            <Button
              variant="link"
              onClick={onShowRegister}
              className="text-farmatech-teal hover:text-farmatech-teal-light font-medium"
            >
              Cadastrar-se
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
