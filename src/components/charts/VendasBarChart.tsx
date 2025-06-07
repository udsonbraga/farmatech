
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DollarSign } from 'lucide-react';

interface VendasBarChartProps {
  data: Array<{
    periodo: string;
    vendas: number;
    quantidade: number;
  }>;
  periodoTexto: string;
}

const VendasBarChart: React.FC<VendasBarChartProps> = ({ data, periodoTexto }) => {
  const chartConfig = {
    vendas: {
      label: 'Vendas (R$)',
      color: 'hsl(var(--farmatech-blue))'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Vendas - {periodoTexto}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data}>
            <XAxis dataKey="periodo" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="vendas" fill="var(--color-vendas)" name="Vendas (R$)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default VendasBarChart;
