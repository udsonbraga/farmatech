
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, Plus, Trash2 } from 'lucide-react';
import { Medicamento, VendaRegistro } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

interface RegistroVendasProps {
  onBack: () => void;
}

const RegistroVendas: React.FC<RegistroVendasProps> = ({ onBack }) => {
  const [medicamentos, setMedicamentos] = useLocalStorage<Medicamento[]>('medicamentos', []);
  const [vendas, setVendas] = useLocalStorage<VendaRegistro[]>('vendas', []);
  const [showForm, setShowForm] = useState(false);
  const [carrinho, setCarrinho] = useState<Array<{medicamentoId: string; quantidade: number; preco: number}>>([]);
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');

  const adicionarAoCarrinho = (medicamentoId: string, quantidade: number) => {
    const medicamento = medicamentos.find(med => med.id === medicamentoId);
    if (!medicamento) return;

    if (quantidade > medicamento.quantidade) {
      toast.error('Quantidade insuficiente em estoque!');
      return;
    }

    const itemExistente = carrinho.find(item => item.medicamentoId === medicamentoId);
    
    if (itemExistente) {
      setCarrinho(prev => prev.map(item => 
        item.medicamentoId === medicamentoId 
          ? { ...item, quantidade: item.quantidade + quantidade }
          : item
      ));
    } else {
      setCarrinho(prev => [...prev, {
        medicamentoId,
        quantidade,
        preco: medicamento.preco
      }]);
    }

    toast.success(`${medicamento.nome} adicionado ao carrinho!`);
  };

  const removerDoCarrinho = (medicamentoId: string) => {
    setCarrinho(prev => prev.filter(item => item.medicamentoId !== medicamentoId));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.quantidade * item.preco), 0);
  };

  const finalizarVenda = () => {
    if (carrinho.length === 0) {
      toast.error('Adicione itens ao carrinho!');
      return;
    }

    // Verificar estoque disponível
    for (const item of carrinho) {
      const medicamento = medicamentos.find(med => med.id === item.medicamentoId);
      if (!medicamento || item.quantidade > medicamento.quantidade) {
        toast.error(`Estoque insuficiente para ${medicamento?.nome || 'medicamento'}`);
        return;
      }
    }

    const venda: VendaRegistro = {
      id: Date.now().toString(),
      medicamentos: carrinho,
      total: calcularTotal(),
      data: new Date().toISOString(),
      formaPagamento
    };

    // Atualizar estoque
    setMedicamentos(prev => prev.map(med => {
      const itemVendido = carrinho.find(item => item.medicamentoId === med.id);
      if (itemVendido) {
        return { ...med, quantidade: med.quantidade - itemVendido.quantidade };
      }
      return med;
    }));

    setVendas(prev => [venda, ...prev]);
    setCarrinho([]);
    setShowForm(false);
    
    toast.success(`Venda finalizada! Total: R$ ${calcularTotal().toFixed(2)}`);
  };

  const getMedicamentoNome = (medicamentoId: string) => {
    const medicamento = medicamentos.find(med => med.id === medicamentoId);
    return medicamento?.nome || 'Medicamento removido';
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
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Registro de Vendas</h1>
              <p className="text-white/80 text-sm">Controle de vendas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Histórico de Vendas</h2>
              <Button
                onClick={() => setShowForm(true)}
                className="farmatech-teal hover:farmatech-teal-light text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Venda
              </Button>
            </div>

            <div className="space-y-4">
              {vendas.map((venda) => (
                <Card key={venda.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Venda #{venda.id.slice(-6)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(venda.data).toLocaleDateString('pt-BR')} às {new Date(venda.data).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-farmatech-teal">R$ {venda.total.toFixed(2)}</div>
                        <Badge variant="secondary">{venda.formaPagamento}</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {venda.medicamentos.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{getMedicamentoNome(item.medicamentoId)} (x{item.quantidade})</span>
                          <span>R$ {(item.quantidade * item.preco).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {vendas.length === 0 && (
                <Card className="border-2 border-dashed border-muted-foreground/20">
                  <CardContent className="p-12 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Nenhuma venda registrada
                    </h3>
                    <p className="text-muted-foreground">
                      Registre sua primeira venda.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seleção de Produtos */}
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Produtos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {medicamentos.map((medicamento) => (
                  <div key={medicamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{medicamento.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {medicamento.quantidade} | R$ {medicamento.preco.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        const quantidade = prompt('Quantidade:');
                        if (quantidade && parseInt(quantidade) > 0) {
                          adicionarAoCarrinho(medicamento.id, parseInt(quantidade));
                        }
                      }}
                      disabled={medicamento.quantidade === 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Carrinho */}
            <Card>
              <CardHeader>
                <CardTitle>Carrinho de Vendas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {carrinho.map((item) => (
                  <div key={item.medicamentoId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{getMedicamentoNome(item.medicamentoId)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.quantidade}x R$ {item.preco.toFixed(2)} = R$ {(item.quantidade * item.preco).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removerDoCarrinho(item.medicamentoId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {carrinho.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Carrinho vazio
                  </p>
                )}

                {carrinho.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span>R$ {calcularTotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                      <select
                        id="formaPagamento"
                        value={formaPagamento}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                        className="w-full p-2 border border-input rounded-md"
                      >
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao_debito">Cartão de Débito</option>
                        <option value="cartao_credito">Cartão de Crédito</option>
                        <option value="pix">PIX</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={finalizarVenda}
                        className="flex-1 farmatech-teal hover:farmatech-teal-light text-white"
                      >
                        Finalizar Venda
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
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
