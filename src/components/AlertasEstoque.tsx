
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, Clock, Package } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AlertasEstoqueProps {
  onBack: () => void;
}

const AlertasEstoque: React.FC<AlertasEstoqueProps> = ({ onBack }) => {
  const [medicamentos] = useLocalStorage('medicamentos', []);

  // Gerar alertas baseados nos dados reais
  const alertasEstoqueBaixo = medicamentos.filter(med => med.quantidade <= med.quantidadeMinima);
  const alertasVencimento = medicamentos.filter(med => {
    const hoje = new Date();
    const vencimento = new Date(med.dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  const todos_alertas = [
    ...alertasEstoqueBaixo.map(med => ({
      id: `baixo_${med.id}`,
      medicamento: med,
      tipo: 'estoque_baixo' as const,
      mensagem: `Estoque baixo: ${med.quantidade} unidades (mínimo: ${med.quantidadeMinima})`,
      data: new Date().toISOString()
    })),
    ...alertasVencimento.map(med => ({
      id: `venc_${med.id}`,
      medicamento: med,
      tipo: 'vencimento_proximo' as const,
      mensagem: `Vence em ${Math.ceil((new Date(med.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias`,
      data: new Date().toISOString()
    }))
  ];

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'estoque_baixo':
        return <Package className="h-5 w-5" />;
      case 'vencimento_proximo':
        return <Clock className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (tipo: string) => {
    switch (tipo) {
      case 'estoque_baixo':
        return 'farmatech-danger';
      case 'vencimento_proximo':
        return 'farmatech-warning';
      default:
        return 'farmatech-orange';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farmatech-teal/5 to-farmatech-blue/5">
      {/* Header */}
      <div className="farmatech-teal text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Alertas de Estoque</h1>
              <p className="text-white/80 text-sm">Monitoramento em tempo real</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {todos_alertas.map((alerta, index) => (
            <Card 
              key={alerta.id} 
              className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${getAlertColor(alerta.tipo)} text-white`}>
                      {getAlertIcon(alerta.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {alerta.medicamento.nome}
                        </h3>
                        <Badge variant="destructive" className="text-xs">
                          {alerta.medicamento.quantidade} unid.
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {alerta.mensagem}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Mínimo: {alerta.medicamento.quantidadeMinima} unid.</span>
                        <span>•</span>
                        <span>Categoria: {alerta.medicamento.categoria}</span>
                        <span>•</span>
                        <span>R$ {alerta.medicamento.preco.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(alerta.data).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {todos_alertas.length === 0 && (
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhum alerta ativo
              </h3>
              <p className="text-muted-foreground">
                Todos os medicamentos estão com estoque adequado.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AlertasEstoque;
