
// src/App.tsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import LoadingScreen from './components/LoadingScreen';

// Lazy Loading para os componentes de rota
const Login = lazy(() => import('./components/Login'));
const Cadastro = lazy(() => import('./components/Cadastro'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const EstoqueProdutos = lazy(() => import('./components/EstoqueProdutos'));
const MovimentacaoEstoque = lazy(() => import('./components/MovimentacaoEstoque'));
const AlertasEstoque = lazy(() => import('./components/AlertasEstoque'));
const AnaliseMovimentacoes = lazy(() => import('./components/AnaliseMovimentacoes'));
const MedicamentosAVencer = lazy(() => import('./components/MedicamentosAVencer'));
const RegistroVendas = lazy(() => import('./components/RegistroVendas'));
// NOVO: Lazy Load do componente AnaliseIA
const AnaliseIA = lazy(() => import('./components/AnaliseIA'));

// Definição do tema Tailwind
const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        'farmatech-blue': 'hsl(200, 100%, 30%)', 
        'farmatech-teal': 'hsl(180, 100%, 30%)', 
        'farmatech-blue-light': 'hsl(200, 100%, 50%)',
        'farmatech-teal-light': 'hsl(180, 100%, 50%)',
        'farmatech-orange': 'hsl(30, 100%, 50%)',
        'farmatech-danger': 'hsl(0, 100%, 50%)',
        // Cores neutras do shadcn/ui
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground)',
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
};

// Enum para gerenciar as rotas da aplicação
enum AppRoute {
  LOGIN = 'login',
  CADASTRO = 'cadastro',
  DASHBOARD = 'dashboard',
  ESTOQUE_PRODUTOS = 'estoque_produtos',
  MOVIMENTACAO_ESTOQUE = 'movimentacao_estoque',
  ALERTAS_ESTOQUE = 'alertas_estoque',
  ANALISE_MOVIMENTACOES = 'analise_movimentacoes',
  MEDICAMENTOS_A_VENCER = 'medicamentos_a_vencer',
  REGISTRO_VENDAS = 'registro_vendas',
  ANALISE_IA = 'analise_ia', // NOVO: Rota para Análise de IA
}

function App() {
  const { isAuthenticated, user } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [isLoading, setIsLoading] = useState(true);

  // Loading screen com duração de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Redireciona para o dashboard se já estiver autenticado, ou para login caso contrário
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentRoute(AppRoute.DASHBOARD);
    } else {
      setCurrentRoute(AppRoute.LOGIN);
    }
  }, [isAuthenticated, user]);

  // Função para renderizar o componente com base na rota atual
  const renderRoute = () => {
    switch (currentRoute) {
      case AppRoute.LOGIN:
        return <Login onShowRegister={() => setCurrentRoute(AppRoute.CADASTRO)} />;
      case AppRoute.CADASTRO:
        return <Cadastro onBackToLogin={() => setCurrentRoute(AppRoute.LOGIN)} />;
      case AppRoute.DASHBOARD:
        return (
          <Dashboard
            onProdutosEstoqueClick={() => setCurrentRoute(AppRoute.ESTOQUE_PRODUTOS)}
            onMovimentacaoEstoqueClick={() => setCurrentRoute(AppRoute.MOVIMENTACAO_ESTOQUE)}
            onAlertasEstoqueClick={() => setCurrentRoute(AppRoute.ALERTAS_ESTOQUE)}
            onAnaliseMovimentacoesClick={() => setCurrentRoute(AppRoute.ANALISE_MOVIMENTACOES)}
            onMedicamentosAVencerClick={() => setCurrentRoute(AppRoute.MEDICAMENTOS_A_VENCER)}
            onRegistroVendasClick={() => setCurrentRoute(AppRoute.REGISTRO_VENDAS)}
            onAnaliseIaClick={() => setCurrentRoute(AppRoute.ANALISE_IA)}
          />
        );
      case AppRoute.ESTOQUE_PRODUTOS:
        return <EstoqueProdutos onBack={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
      case AppRoute.MOVIMENTACAO_ESTOQUE:
        return <MovimentacaoEstoque onBack={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
      case AppRoute.ALERTAS_ESTOQUE:
        return <AlertasEstoque onBack={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
      case AppRoute.ANALISE_MOVIMENTACOES:
        return <AnaliseMovimentacoes onBack={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
      case AppRoute.MEDICAMENTOS_A_VENCER:
        return <MedicamentosAVencer onBack={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
      case AppRoute.REGISTRO_VENDAS:
        return <RegistroVendas onBack={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
      case AppRoute.ANALISE_IA:
        return <AnaliseIA onBack={() => setCurrentRoute(AppRoute.DASHBOARD)} />;
      default:
        return <Login onShowRegister={() => setCurrentRoute(AppRoute.CADASTRO)} />;
    }
  };

  // Mostra a tela de loading por 3 segundos
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App w-full h-full min-h-screen overflow-x-hidden"> 
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      }>
        {renderRoute()}
      </Suspense>
    </div>
  );
}

export default function RootApp() {
  return (
    <AuthProvider>
      <App />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
