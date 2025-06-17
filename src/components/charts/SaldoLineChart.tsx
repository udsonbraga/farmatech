// src/components/charts/SaldoLineChart.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Movimento } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SaldoLineChartProps {
  movimentos: Movimento[];
}

const SaldoLineChart: React.FC<SaldoLineChartProps> = ({ movimentos }) => {
  const processChartData = () => {
    // Calcular o saldo cumulativo ao longo do tempo
    const dailySaldoMap = new Map<string, number>(); // Map<YYYY-MM-DD, saldo>
    const sortedMovimentos = [...movimentos].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    let currentSaldo = 0;
    sortedMovimentos.forEach(mov => {
      const dateKey = new Date(mov.data).toISOString().split('T')[0]; // YYYY-MM-DD

      if (mov.tipo === 'entrada') {
        currentSaldo += mov.quantidade;
      } else {
        currentSaldo -= mov.quantidade;
      }
      dailySaldoMap.set(dateKey, currentSaldo);
    });

    // Preencher dias sem movimento com o saldo do dia anterior
    const allDates = Array.from(new Set(sortedMovimentos.map(mov => new Date(mov.data).toISOString().split('T')[0]))).sort();
    if (allDates.length === 0) return [];

    const minDate = new Date(allDates[0]);
    const maxDate = new Date(allDates[allDates.length - 1]);
    const chartData = [];
    let cumulativeSaldo = 0;

    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      if (dailySaldoMap.has(dateKey)) {
        cumulativeSaldo = dailySaldoMap.get(dateKey)!;
      }
      chartData.push({ name: dateKey, saldo: cumulativeSaldo });
    }

    return chartData;
  };

  const data = processChartData();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Tendência do Saldo de Estoque</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum dado de saldo para exibir.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="saldo" stroke="#06B6D4" name="Saldo" /> {/* farmatech-teal */}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default SaldoLineChart;
