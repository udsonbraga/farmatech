
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MovimentacoesBarChartProps {
  data: Array<{
    periodo: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
  periodoTexto: string;
}

const MovimentacoesBarChart: React.FC<MovimentacoesBarChartProps> = ({ data, periodoTexto }) => {
  const chartConfig = {
    entradas: {
      label: 'Entradas',
      color: 'hsl(var(--farmatech-teal))'
    },
    saidas: {
      label: 'Saídas',
      color: 'hsl(var(--farmatech-orange))'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Movimentações - {periodoTexto}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data}>
            <XAxis dataKey="periodo" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="entradas" fill="var(--color-entradas)" name="Entradas" />
            <Bar dataKey="saidas" fill="var(--color-saidas)" name="Saídas" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MovimentacoesBarChart;
