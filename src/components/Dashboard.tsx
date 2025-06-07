
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign,
  LogOut,
  Plus
} from 'lucide-react';
import { User } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useConfirmExit } from '@/hooks/useConfirmExit';
import ConfirmDialog from '@/components/ConfirmDialog';
import MovimentacoesChart from '@/components/MovimentacoesChart';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToAlertas: () => void;
  onNavigateToEstoque: () => void;
  onNavigateToMovimentacao: () => void;
  onNavigateToVendas: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  onNavigateToAlertas,
  onNavigateToEstoque,
  onNavigateToMovimentacao,
  onNavigateToVendas
}) => {
  const [medicamentos] = useLocalStorage('medicamentos', []);
  const [vendas] = useLocalStorage('vendas', []);
  const [movimentos] = useLocalStorage('movimentos', []);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMovimentacoesChart, setShowMovimentacoesChart] = useState(false);

  // Hook para confirmação de saída do navegador
  useConfirmExit(true);

  // Calcular estatísticas
  const totalProdutos = medicamentos.length;
  const alertasAtivos = medicamentos.filter(med => med.quantidade <= med.quantidadeMinima).length;
  const vendasMes = vendas.reduce((total, venda) => total + venda.total, 0);
  const medicamentosVencendo = medicamentos.filter(med => {
    const hoje = new Date();
    const vencimento = new Date(med.dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }).length;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    onLogout();
  };

  const handleMovimentacoesClick = () => {
    if (movimentos.length > 0) {
      setShowMovimentacoesChart(true);
    } else {
      onNavigateToMovimentacao();
    }
  };

  const dashboardCards = [
    {
      title: 'Produtos em Estoque',
      icon: Package,
      bgColor: 'farmatech-teal',
      textColor: 'text-white',
      onClick: onNavigateToEstoque
    },
    {
      title: 'Entradas e Saídas',
      icon: ArrowRight,
      bgColor: 'farmatech-blue',
      textColor: 'text-white',
      onClick: onNavigateToMovimentacao
    },
    {
      title: 'Alertas de Estoque Baixo',
      icon: AlertTriangle,
      bgColor: 'farmatech-orange',
      textColor: 'text-white',
      onClick: onNavigateToAlertas
    },
    {
      title: 'Análise de Movimentações',
      icon: TrendingUp,
      bgColor: 'farmatech-blue',
      textColor: 'text-white',
      onClick: handleMovimentacoesClick
    },
    {
      title: 'Medicamentos a Vencer',
      icon: ShoppingBag,
      bgColor: 'farmatech-orange',
      textColor: 'text-white',
      onClick: onNavigateToEstoque
    },
    {
      title: 'Registro de Vendas',
      icon: DollarSign,
      bgColor: 'farmatech-teal',
      textColor: 'text-white',
      onClick: onNavigateToVendas
    }
  ];

  if (showMovimentacoesChart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-farmatech-teal/5 to-farmatech-blue/5">
        {/* Header */}
        <div className="farmatech-blue text-white p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMovimentacoesChart(false)}
                className="text-white hover:bg-white/20 p-2"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Análise de Movimentações</h1>
                  <p className="text-white/80 text-sm">Gráficos e estatísticas</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogoutClick}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          <MovimentacoesChart movimentos={movimentos} />
        </div>

        <ConfirmDialog
          open={showLogoutConfirm}
          onOpenChange={setShowLogoutConfirm}
          onConfirm={handleConfirmLogout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-farmatech-teal/5 to-farmatech-blue/5">
      {/* Header */}
      <div className="farmatech-teal text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FarmaTech</h1>
              <p className="text-white/80 text-sm">{user.farmaciaName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogoutClick}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Painel Principal</h2>
          <p className="text-muted-foreground">Bem-vindo, {user.responsavelName}</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Card 
              key={index} 
              className={`${card.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={card.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`${card.textColor}`}>
                    <card.icon className="h-8 w-8 mb-3" />
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                  </div>
                  <ArrowRight className={`h-5 w-5 ${card.textColor} opacity-70`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-farmatech-teal/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-farmatech-teal">{totalProdutos}</div>
              <div className="text-sm text-muted-foreground">Produtos Cadastrados</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-farmatech-orange/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-farmatech-orange">{alertasAtivos}</div>
              <div className="text-sm text-muted-foreground">Alertas Ativos</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-farmatech-blue/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-farmatech-blue">R$ {vendasMes.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Vendas do Mês</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-farmatech-orange/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-farmatech-orange">{medicamentosVencendo}</div>
              <div className="text-sm text-muted-foreground">Vencendo em 30 dias</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default Dashboard;
