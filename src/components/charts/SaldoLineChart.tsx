
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface SaldoLineChartProps {
  data: Array<{
    periodo: string;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
}

const SaldoLineChart: React.FC<SaldoLineChartProps> = ({ data }) => {
  const chartConfig = {
    saldo: {
      label: 'Saldo',
      color: 'hsl(var(--farmatech-blue))'
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Tendência do Saldo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <LineChart data={data}>
            <XAxis dataKey="periodo" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="var(--color-saldo)" 
              strokeWidth={3}
              dot={{ fill: "var(--color-saldo)", strokeWidth: 2, r: 4 }}
              name="Saldo"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SaldoLineChart;
