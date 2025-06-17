// src/components/RegistroVendas.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Medicamento, ItemVenda, VendaRegistro } from '@/types';
import { MedicamentoService } from '@/services/medicamentoService';
import { VendaService } from '@/services/vendaService';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';


interface RegistroVendasProps {
  onBack: () => void;
}

const RegistroVendas: React.FC<RegistroVendasProps> = ({ onBack }) => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [historicoVendas, setHistoricoVendas] = useState<VendaRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formaPagamento, setFormaPagamento] = useState<string>('dinheiro');
  const [showVendaForm, setShowVendaForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedMedicamentos, fetchedVendas] = await Promise.all([
          MedicamentoService.getMedicamentos(),
          VendaService.getVendas()
        ]);
        setMedicamentos(fetchedMedicamentos);
        setHistoricoVendas(fetchedVendas);
      } catch (err: any) {
        console.error('Erro ao carregar dados para vendas:', err);
        setError(err.message || 'Falha ao carregar dados.');
        toast.error('Erro', {
          description: err.message || 'Falha ao carregar dados para registro de vendas.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (medicamento: Medicamento) => {
    const itemExistente = carrinho.find(item => item.medicamento === medicamento.id);
    if (itemExistente) {
      if (medicamento.quantidade > itemExistente.quantidade) {
        setCarrinho(prev => prev.map(item =>
          item.medicamento === medicamento.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        ));
      } else {
        toast.warning(`Estoque insuficiente para ${medicamento.nome}.`);
      }
    } else {
      if (medicamento.quantidade > 0) {
        setCarrinho(prev => [
          ...prev,
          {
            medicamento: medicamento.id as number,
            medicamento_nome: medicamento.nome,
            quantidade: 1,
            preco_unitario: medicamento.preco,
          }
        ]);
      } else {
        toast.warning(`${medicamento.nome} está sem estoque.`);
      }
    }
  };

  const handleRemoveFromCart = (medicamentoId: number) => {
    setCarrinho(prev => prev.filter(item => item.medicamento !== medicamentoId));
  };

  const handleQuantityChange = (medicamentoId: number, newQuantity: number) => {
    setCarrinho(prev => prev.map(item => {
      if (item.medicamento === medicamentoId) {
        const med = medicamentos.find(m => m.id === medicamentoId);
        if (med && newQuantity > med.quantidade) {
          toast.warning(`Estoque insuficiente para ${med.nome}.`);
          return { ...item, quantidade: med.quantidade };
        }
        return { ...item, quantidade: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    }));
  };

  const calcularTotal = () => {
    // Garante que o total seja calculado com precisão e formatado para 2 casas decimais
    const total = carrinho.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
    return parseFloat(total.toFixed(2)); // Converte para float após toFixed(2)
  };

  const handleFinalizarVenda = async () => {
    if (carrinho.length === 0) {
      toast.error('O carrinho está vazio. Adicione produtos para finalizar a venda.');
      return;
    }
    setIsSubmitting(true);
    try {
        const vendaData = {
            itens: carrinho.map(item => ({
                medicamento: item.medicamento,
                quantidade: item.quantidade,
                preco_unitario: item.preco_unitario,
            })),
            total: calcularTotal(), // Usa a função calcularTotal que já formata
            formaPagamento: formaPagamento,
        };

        const novaVenda = await VendaService.addVenda(vendaData);
        toast.success(`Venda #${novaVenda.id} registrada com sucesso! Total: R$ ${novaVenda.total.toFixed(2)}`);
        
        setHistoricoVendas(prev => [novaVenda, ...prev]);
        setCarrinho([]);
        setFormaPagamento('dinheiro');
        setShowVendaForm(false);

        const updatedMedicamentos = await MedicamentoService.getMedicamentos();
        setMedicamentos(updatedMedicamentos);

    } catch (error: any) {
        console.error('Erro ao finalizar venda:', error);
        toast.error('Erro ao finalizar venda', {
            description: error.message || 'Verifique o estoque e tente novamente.'
        });
    } finally {
        setIsSubmitting(false);
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
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Registro de Vendas</h1>
              <p className="text-white/80 text-sm">Controle de vendas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {!showVendaForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Histórico de Vendas</h2>
              <Button
                onClick={() => setShowVendaForm(true)}
                className="farmatech-teal hover:farmatech-teal-light text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Venda
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground">Carregando histórico de vendas...</p>
              ) : error ? (
                <p className="text-center text-red-500">{error}</p>
              ) : historicoVendas.length === 0 ? (
                <Card className="border-2 border-dashed border-muted-foreground/20">
                  <CardContent className="p-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Nenhuma venda registrada
                    </h3>
                    <p className="text-muted-foreground">
                      Registre sua primeira venda.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                historicoVendas.map((venda) => (
                  <Card key={venda.id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6 flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">Venda #{venda.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(venda.data).toLocaleDateString('pt-BR')} às {new Date(venda.data).toLocaleTimeString('pt-BR')}
                        </p>
                        <div className="mt-2 text-sm text-foreground">
                          {venda.itens.map(item => {
                            const med = medicamentos.find(m => m.id === item.medicamento);
                            return (
                              <p key={item.medicamento}>
                                {item.medicamento_nome || med?.nome || 'Medicamento desconhecido'} (x{item.quantidade})
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-farmatech-blue">R$ {venda.total.toFixed(2)}</p>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {venda.formaPagamento.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selecionar Produtos */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Selecionar Produtos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <p className="text-center text-muted-foreground">Carregando produtos...</p>
                ) : error ? (
                  <p className="text-center text-red-500">{error}</p>
                ) : medicamentos.length === 0 ? (
                  <p className="text-center text-muted-foreground">Nenhum medicamento disponível para venda.</p>
                ) : (
                  medicamentos.map(med => (
                    <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{med.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {med.quantidade} | R$ {med.preco.toFixed(2)}
                        </p>
                      </div>
                      <Button 
                        size="icon" 
                        className="farmatech-blue" 
                        onClick={() => handleAddToCart(med)}
                        disabled={med.quantidade <= 0}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Carrinho de Vendas */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Carrinho de Vendas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {carrinho.length === 0 ? (
                  <p className="text-center text-muted-foreground">Carrinho vazio</p>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {carrinho.map(item => (
                        <div key={item.medicamento} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <h4 className="font-medium">{item.medicamento_nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.quantidade}x R$ {item.preco_unitario.toFixed(2)} = R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) => handleQuantityChange(item.medicamento, parseInt(e.target.value))}
                                className="w-20"
                                disabled={isSubmitting}
                            />
                            <Button variant="destructive" size="icon" onClick={() => handleRemoveFromCart(item.medicamento)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 mt-4 space-y-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>R$ {calcularTotal().toFixed(2)}</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                        <Select
                          value={formaPagamento}
                          onValueChange={setFormaPagamento}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a forma de pagamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                            <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                            <SelectItem value="pix">Pix</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => { setCarrinho([]); setFormaPagamento('dinheiro'); setShowVendaForm(false); }}
                          disabled={isSubmitting}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="button" 
                          className="farmatech-teal hover:farmatech-teal-light text-white" 
                          onClick={handleFinalizarVenda}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Finalizando...' : 'Finalizar Venda'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroVendas;
