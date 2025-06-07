
import React from 'react';
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

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onNavigateToAlertas: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigateToAlertas }) => {
  const dashboardCards = [
    {
      title: 'Produtos em Estoque',
      icon: Package,
      bgColor: 'farmatech-teal',
      textColor: 'text-white'
    },
    {
      title: 'Entradas Saídas',
      icon: ArrowRight,
      bgColor: 'farmatech-blue',
      textColor: 'text-white'
    },
    {
      title: 'Alertas de Estoque Baixo',
      icon: AlertTriangle,
      bgColor: 'farmatech-orange',
      textColor: 'text-white',
      onClick: onNavigateToAlertas
    },
    {
      title: 'Entradas e Saídas no Mês',
      icon: TrendingUp,
      bgColor: 'farmatech-blue',
      textColor: 'text-white'
    },
    {
      title: 'Medicamentos a Vencer',
      icon: ShoppingBag,
      bgColor: 'farmatech-orange',
      textColor: 'text-white'
    },
    {
      title: 'Registro de Vendas',
      icon: DollarSign,
      bgColor: 'farmatech-teal',
      textColor: 'text-white'
    }
  ];

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
            onClick={onLogout}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-farmatech-teal/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-farmatech-teal">247</div>
              <div className="text-sm text-muted-foreground">Produtos Cadastrados</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-farmatech-orange/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-farmatech-orange">12</div>
              <div className="text-sm text-muted-foreground">Alertas Ativos</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-farmatech-blue/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-farmatech-blue">R$ 15.420</div>
              <div className="text-sm text-muted-foreground">Vendas do Mês</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
