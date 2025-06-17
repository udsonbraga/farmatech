// src/components/charts/EstoquePieChart.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'; // Importar Tooltip
import { Package } from 'lucide-react';
import { Medicamento } from '@/types';

interface EstoquePieChartProps {
  medicamentos: Medicamento[];
}

const EstoquePieChart: React.FC<EstoquePieChartProps> = ({ medicamentos }) => {
  const ALERTA_ESTOQUE_BAIXO_PADRAO = 20; // Limite padrão para estoque baixo

  const statusContagem = medicamentos.reduce((acc, med) => {
    if (med.quantidade <= (med.quantidadeMinima || ALERTA_ESTOQUE_BAIXO_PADRAO)) {
      acc.estoqueBaixo++;
    } else {
      acc.estoqueOk++;
    }

    // Verificar medicamentos vencidos (assumindo dataVencimento é YYYY-MM-DD)
    if (med.dataVencimento) {
      const hoje = new Date();
      const [ano, mes, dia] = med.dataVencimento.split('-').map(Number);
      const vencimento = new Date(ano, mes - 1, dia); // Mês é 0-indexado

      if (vencimento <= hoje) {
        acc.vencidos++;
      }
    }
    return acc;
  }, { estoqueOk: 0, estoqueBaixo: 0, vencidos: 0 });

  // Ajustar os dados para o PieChart, garantindo que "vencidos" não seja contado duas vezes no "estoqueBaixo"
  // E que o total de fatias seja consistente
  const data = [
    { name: 'Estoque OK', value: statusContagem.estoqueOk, fill: '#16A34A' }, // Verde
    { name: 'Estoque Baixo', value: statusContagem.estoqueBaixo, fill: '#F59E0B' }, // Laranja
    { name: 'Vencidos', value: statusContagem.vencidos, fill: '#EF4444' }, // Vermelho
  ].filter(item => item.value > 0); // Exclui fatias com valor zero para não aparecer na legenda

  // Função para formatar os rótulos do PieChart (mostra o valor)
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name}: ${value}`} {/* Mostra o nome da categoria e o valor */}
      </text>
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          Status do Estoque
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-muted-foreground">Nenhum dado de estoque para exibir.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel} // Usa o rótulo customizado
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} unidades`, name]} /> {/* Tooltip aprimorado */}
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                layout="horizontal" 
                wrapperStyle={{ paddingTop: '20px' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EstoquePieChart;
