
import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Cadastro from '@/components/Cadastro';
import Dashboard from '@/components/Dashboard';
import AlertasEstoque from '@/components/AlertasEstoque';
import EstoqueProdutos from '@/components/EstoqueProdutos';
import MovimentacaoEstoque from '@/components/MovimentacaoEstoque';
import RegistroVendas from '@/components/RegistroVendas';

type Screen = 'login' | 'cadastro' | 'dashboard' | 'alertas' | 'estoque' | 'movimentacao' | 'vendas';

const AppContent = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const { user, logout, isAuthenticated } = useAuth();

  // Se estiver autenticado, navegar para o dashboard
  React.useEffect(() => {
    if (isAuthenticated && currentScreen === 'login') {
      setCurrentScreen('dashboard');
    } else if (!isAuthenticated && currentScreen !== 'login' && currentScreen !== 'cadastro') {
      setCurrentScreen('login');
    }
  }, [isAuthenticated, currentScreen]);

  const handleLogout = () => {
    logout();
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    // Se não estiver autenticado, só mostrar login ou cadastro
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'cadastro':
          return (
            <Cadastro
              onBackToLogin={() => setCurrentScreen('login')}
            />
          );
        default:
          return (
            <Login
              onShowRegister={() => setCurrentScreen('cadastro')}
            />
          );
      }
    }

    // Se estiver autenticado, mostrar as telas internas
    switch (currentScreen) {
      case 'dashboard':
        return user ? (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onNavigateToAlertas={() => setCurrentScreen('alertas')}
            onNavigateToEstoque={() => setCurrentScreen('estoque')}
            onNavigateToMovimentacao={() => setCurrentScreen('movimentacao')}
            onNavigateToVendas={() => setCurrentScreen('vendas')}
          />
        ) : null;
      case 'alertas':
        return (
          <AlertasEstoque
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'estoque':
        return (
          <EstoqueProdutos
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'movimentacao':
        return (
          <MovimentacaoEstoque
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'vendas':
        return (
          <RegistroVendas
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderScreen()}</>;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
