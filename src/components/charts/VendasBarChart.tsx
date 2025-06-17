// src/components/charts/VendasBarChart.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendaRegistro } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VendasBarChartProps {
  vendas: VendaRegistro[];
}

const VendasBarChart: React.FC<VendasBarChartProps> = ({ vendas }) => {
  const processChartData = () => {
    // Agrupar vendas por mês e ano
    const monthlySalesMap = new Map<string, number>(); // Map<YYYY-MM, totalVendas>

    vendas.forEach(venda => {
      const date = new Date(venda.data);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      monthlySalesMap.set(monthYear, (monthlySalesMap.get(monthYear) || 0) + venda.total);
    });

    // Converter para array e ordenar por data
    const sortedData = Array.from(monthlySalesMap.entries())
      .map(([monthYear, total]) => ({
        name: monthYear,
        vendas: total,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

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
        <CardTitle>Vendas - Análise por Mês</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum dado de vendas para exibir.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="vendas" fill="#F59E0B" name="Vendas" /> {/* farmatech-orange */}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default VendasBarChart;
