// src/components/charts/MovimentacoesBarChart.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Movimento, Medicamento } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MovimentacoesBarChartProps {
  movimentos: Movimento[];
  medicamentos: Medicamento[];
}

const MovimentacoesBarChart: React.FC<MovimentacoesBarChartProps> = ({ movimentos, medicamentos }) => {
  const processChartData = () => {
    // Agrupar movimentos por mês e ano
    const monthlyDataMap = new Map<string, { entrada: number; saida: number }>();

    movimentos.forEach(mov => {
      const date = new Date(mov.data);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!monthlyDataMap.has(monthYear)) {
        monthlyDataMap.set(monthYear, { entrada: 0, saida: 0 });
      }
      const data = monthlyDataMap.get(monthYear)!;
      if (mov.tipo === 'entrada') {
        data.entrada += mov.quantidade;
      } else {
        data.saida += mov.quantidade;
      }
    });

    // Converter para array e ordenar por data
    const sortedData = Array.from(monthlyDataMap.entries())
      .map(([monthYear, data]) => ({
        name: monthYear, // Ou formatar para "Jan 2025"
        ...data,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Ordena cronologicamente

    // Adiciona o nome do mês formatado
    return sortedData.map(item => {
      const [year, month] = item.name.split('-');
      const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString('pt-BR', { month: 'short' });
      return {
        ...item,
        name: `${monthName} ${year}`
      };
    });
  };

  const data = processChartData();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Movimentações - Análise por Mês</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum dado de movimentação para exibir.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entrada" fill="#16A34A" name="Entradas" />
              <Bar dataKey="saida" fill="#EF4444" name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default MovimentacoesBarChart;
