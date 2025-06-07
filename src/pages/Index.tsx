
import React, { useState } from 'react';
import { toast } from 'sonner';
import Login from '@/components/Login';
import Cadastro from '@/components/Cadastro';
import Dashboard from '@/components/Dashboard';
import AlertasEstoque from '@/components/AlertasEstoque';
import { User } from '@/types';

type Screen = 'login' | 'cadastro' | 'dashboard' | 'alertas';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (email: string, senha: string) => {
    console.log('Login attempt:', { email, senha });
    
    // Simulação de login - em produção, isso seria uma chamada para a API
    const mockUser: User = {
      id: '1',
      email,
      farmaciaName: 'Farmácia Central',
      responsavelName: 'João Silva',
      telefone: '(11) 99999-9999'
    };
    
    setUser(mockUser);
    setCurrentScreen('dashboard');
    
    toast.success('Login realizado com sucesso!', {
      description: `Bem-vindo, ${mockUser.responsavelName}!`
    });
  };

  const handleRegister = (userData: {
    farmaciaName: string;
    responsavelName: string;
    email: string;
    senha: string;
    telefone: string;
  }) => {
    console.log('Register attempt:', userData);
    
    // Simulação de cadastro - em produção, isso seria uma chamada para a API
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      farmaciaName: userData.farmaciaName,
      responsavelName: userData.responsavelName,
      telefone: userData.telefone
    };
    
    setUser(newUser);
    setCurrentScreen('dashboard');
    
    toast.success('Conta criada com sucesso!', {
      description: `Bem-vindo ao FarmaTech, ${newUser.responsavelName}!`
    });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
    toast.info('Logout realizado com sucesso!');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <Login
            onLogin={handleLogin}
            onShowRegister={() => setCurrentScreen('cadastro')}
          />
        );
      case 'cadastro':
        return (
          <Cadastro
            onRegister={handleRegister}
            onBackToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'dashboard':
        return user ? (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onNavigateToAlertas={() => setCurrentScreen('alertas')}
          />
        ) : null;
      case 'alertas':
        return (
          <AlertasEstoque
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderScreen()}</>;
};

export default Index;
