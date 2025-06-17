// src/components/MovimentacoesFiltros.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Medicamento } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface MovimentacoesFiltrosProps {
  medicamentos: Medicamento[];
  filterStartDate: string;
  setFilterStartDate: (date: string) => void;
  filterEndDate: string;
  setFilterEndDate: (date: string) => void;
  filterMedicamentoId: number | '';
  setFilterMedicamentoId: (id: number | '') => void;
  filterTipo: 'entrada' | 'saida' | '';
  setFilterTipo: (tipo: 'entrada' | 'saida' | '') => void;
  filterMonth: number | '';
  setFilterMonth: (month: number | '') => void;
  filterYear: number;
  setFilterYear: (year: number) => void;
}

const MovimentacoesFiltros: React.FC<MovimentacoesFiltrosProps> = ({
  medicamentos,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  filterMedicamentoId,
  setFilterMedicamentoId,
  filterTipo,
  setFilterTipo,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
}) => {
  const months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // 2 anos atrás, ano atual, 2 anos à frente

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          Filtros de Análise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthFilter">Mês</Label>
            <Select
              // Define o valor do Select: se filterMonth for vazio, usa 'all-months', senão converte o número
              value={filterMonth === '' ? 'all-months' : String(filterMonth)} 
              onValueChange={(value) => setFilterMonth(value === 'all-months' ? '' : parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os meses" />
              </SelectTrigger>
              <SelectContent>
                {/* Corrigido: Agora o SelectItem para 'Todos os meses' tem um valor único e não vazio */}
                <SelectItem value="all-months">Todos os meses</SelectItem>
                {months.map(month => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearFilter">Ano</Label>
            <Select
              // Não precisa de 'all-years' pois não há um SelectItem com value="" para anos
              value={String(filterYear)} 
              onValueChange={(value) => setFilterYear(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os anos" />
              </SelectTrigger>
              <SelectContent>
                {/* Aqui os SelectItems sempre terão valores numéricos como strings */}
                {years.map(year => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicamentoFilter">Medicamento</Label>
            <Select
              // Define o valor do Select: se filterMedicamentoId for vazio, usa 'all-medicamentos', senão converte o número
              value={filterMedicamentoId === '' ? 'all-medicamentos' : String(filterMedicamentoId)}
              onValueChange={(value) => setFilterMedicamentoId(value === 'all-medicamentos' ? '' : parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os medicamentos" />
              </SelectTrigger>
              <SelectContent>
                {/* Corrigido: Agora o SelectItem para 'Todos os medicamentos' tem um valor único e não vazio */}
                <SelectItem value="all-medicamentos">Todos os medicamentos</SelectItem>
                {medicamentos.map(med => (
                  <SelectItem key={med.id} value={String(med.id)}>
                    {med.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoMovimentacaoFilter">Tipo</Label>
            <Select
              // Define o valor do Select: se filterTipo for vazio, usa 'all-tipos', senão usa o valor do tipo
              value={filterTipo === '' ? 'all-tipos' : filterTipo}
              onValueChange={(value) => setFilterTipo(value === 'all-tipos' ? '' : value as 'entrada' | 'saida' | '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                {/* Corrigido: Agora o SelectItem para 'Todos os tipos' tem um valor único e não vazio */}
                <SelectItem value="all-tipos">Todos os tipos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovimentacoesFiltros;
