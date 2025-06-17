// src/components/Dashboard.tsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, AlertTriangle, LineChart, Clock, ShoppingCart, Sparkles } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DashboardProps {
  onProdutosEstoqueClick: () => void;
  onMovimentacaoEstoqueClick: () => void;
  onAlertasEstoqueClick: () => void;
  onAnaliseMovimentacoesClick: () => void;
  onMedicamentosAVencerClick: () => void;
  onRegistroVendasClick: () => void;
  onAnaliseIaClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onProdutosEstoqueClick, 
  onMovimentacaoEstoqueClick, 
  onAlertasEstoqueClick,
  onAnaliseMovimentacoesClick,
  onMedicamentosAVencerClick,
  onRegistroVendasClick,
  onAnaliseIaClick,
}) => {
  const { currentUser, logout } = useAuth();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const confirmLogout = () => {
    logout();
    toast.success('Você foi desconectado com sucesso.', { duration: 2000 });
    setShowConfirmLogout(false);
  };

  const handleLogout = () => {
    setShowConfirmLogout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farmatech-teal/10 to-farmatech-blue/10 flex flex-col">
      {/* Header */}
      <div className="farmatech-blue text-white p-6 rounded-b-3xl shadow-lg flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-white/20">
            <ArrowRight className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">FarmaTech</h1>
            {currentUser && (
              <p className="text-sm text-white/80">Olá, {currentUser.username || currentUser.email}!</p>
            )}
          </div>
        </div>
        <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-white/20">
          Sair
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-foreground">
          Painel Principal
        </h2>
        {currentUser && (
          <p className="text-lg text-center text-muted-foreground mb-8">
            Sua farmácia: ID {currentUser.farmacia_id}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Produtos em Estoque */}
          <Card 
            className="flex items-center justify-between p-6 cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
            onClick={onProdutosEstoqueClick}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-farmatech-teal text-white">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Produtos em Estoque</h3>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </Card>

          {/* Entradas e Saídas */}
          <Card 
            className="flex items-center justify-between p-6 cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
            onClick={onMovimentacaoEstoqueClick}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-farmatech-blue text-white">
                <ArrowRight className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Entradas e Saídas</h3>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </Card>

          {/* Alertas de Estoque */}
          <Card 
            className="flex items-center justify-between p-6 cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
            onClick={onAlertasEstoqueClick}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-farmatech-orange text-white">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Alertas de Estoque</h3>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </Card>

          {/* Análise de Movimentações */}
          <Card 
            className="flex items-center justify-between p-6 cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
            onClick={onAnaliseMovimentacoesClick}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-farmatech-blue text-white">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Análise de Movimentações</h3>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </Card>

          {/* Medicamentos a Vencer */}
          <Card 
            className="flex items-center justify-between p-6 cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
            onClick={onMedicamentosAVencerClick}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-farmatech-orange text-white">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Medicamentos a Vencer</h3>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </Card>

          {/* Registro de Vendas */}
          <Card 
            className="flex items-center justify-between p-6 cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
            onClick={onRegistroVendasClick}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-farmatech-teal text-white">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Registro de Vendas</h3>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </Card>

          {/* Análise com IA */}
          <Card 
            className="flex items-center justify-between p-6 cursor-pointer hover:shadow-lg transition-all duration-200 bg-card"
            onClick={onAnaliseIaClick}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-farmatech-blue text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Análise com IA</h3>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </Card>
        </div>
      </div>

      {/* AlertDialog para confirmação de Logout */}
      <AlertDialog open={showConfirmLogout} onOpenChange={setShowConfirmLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Realmente deseja sair?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado da sua conta. Certifique-se de que salvou seu trabalho.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setShowConfirmLogout(false)}>Não</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={confirmLogout} className="farmatech-danger hover:bg-farmatech-danger/90">Sim</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
