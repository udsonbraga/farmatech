
// src/components/charts/VendasBarChart.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VendaRegistro } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VendasBarChartProps {
  data: { periodo: string; vendas: number; quantidade: number; }[];
  periodoTexto: string;
}

const VendasBarChart: React.FC<VendasBarChartProps> = ({ data, periodoTexto }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Vendas - {periodoTexto}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum dado de vendas para exibir.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip formatter={(value: any) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value);
                return `R$ ${numValue.toFixed(2)}`;
              }} />
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
