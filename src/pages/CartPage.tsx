import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck, Zap, DollarSign, Award } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useLocation } from '@/contexts/LocationContext';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { ShippingOption, SellerShippingResult } from '@/types';

// Ícone por tipo de recomendação — comunica visualmente a vantagem de cada opção
const RECOMMENDATION_LABELS: Record<string, { label: string; icon: typeof Zap }> = {
  cheapest: { label: 'Mais barato', icon: DollarSign },
  fastest: { label: 'Mais rápido', icon: Zap },
  'best-value': { label: 'Melhor custo-benefício', icon: Award },
};

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { location } = useLocation();
  // Estado de frete por vendedor — cada vendedor tem suas opções de transportadora
  const [sellerShipping, setSellerShipping] = useState<SellerShippingResult[]>([]);
  // Mapa de transportadora selecionada por vendedor (sellerId → carrierId)
  const [selectedCarriers, setSelectedCarriers] = useState<Record<string, string>>({});

  // Agrupa items por vendedor — O(n) com reduce, recalcula apenas quando items mudam
  const sellerGroups = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach(item => {
      const key = item.product.seller;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [items]);

  // Busca opções de frete por vendedor quando localização ou items mudam
  useEffect(() => {
    if (!location || items.length === 0) {
      setSellerShipping([]);
      return;
    }

    // Extrai lista única de vendedores — Set garante deduplição
    const sellers = [...new Set(items.map(i => i.product.seller))].map(name => ({
      sellerId: name,
      sellerName: name,
    }));

    fetch('/api/shipping/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        sellers,
      }),
    })
      .then(r => r.json())
      .then((data: SellerShippingResult[]) => {
        setSellerShipping(data);
        // Auto-seleciona melhor custo-benefício por padrão para cada vendedor
        const defaults: Record<string, string> = {};
        data.forEach(s => {
          const bestValue = s.options.find(o => o.recommendation === 'best-value') || s.options[0];
          defaults[s.sellerId] = bestValue.carrier.id;
        });
        setSelectedCarriers(prev => ({ ...defaults, ...prev }));
      })
      .catch(() => setSellerShipping([]));
  }, [location, items]);

  // Calcula frete total somando a opção selecionada de cada vendedor
  const totalShipping = useMemo(() => {
    return sellerShipping.reduce((sum, s) => {
      const carrierId = selectedCarriers[s.sellerId];
      const option = s.options.find(o => o.carrier.id === carrierId);
      return sum + (option?.cost || 0);
    }, 0);
  }, [sellerShipping, selectedCarriers]);

  // Prazo máximo entre todos os vendedores — a entrega total depende do mais lento
  const maxDays = useMemo(() => {
    return sellerShipping.reduce((max, s) => {
      const carrierId = selectedCarriers[s.sellerId];
      const option = s.options.find(o => o.carrier.id === carrierId);
      return Math.max(max, option?.days || 0);
    }, 0);
  }, [sellerShipping, selectedCarriers]);

  const handleCheckout = async () => {
    try {
      await Promise.all(
        items.map(item =>
          fetch(`/api/products/${item.product.id}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: item.quantity }),
          })
        )
      );
      clearCart();
      toast.success('Compra finalizada com sucesso! Estoque atualizado.');
    } catch {
      toast.error('Erro ao finalizar compra. Tente novamente.');
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-6">Adicione produtos ao carrinho para continuar comprando</p>
          <Link to="/produtos">
            <Button size="lg">Explorar Produtos <ArrowRight className="w-5 h-5 ml-2" /></Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Carrinho de Compras</h1>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">Limpar Carrinho</Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items agrupados por vendedor — simula marketplace multi-loja */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(sellerGroups).map(([sellerName, sellerItems]) => {
              const sellerShip = sellerShipping.find(s => s.sellerId === sellerName);
              const selectedId = selectedCarriers[sellerName];

              return (
                <div key={sellerName} className="bg-card rounded-xl shadow-card overflow-hidden">
                  {/* Header do vendedor — identifica visualmente cada loja */}
                  <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Vendedor: {sellerName}</span>
                    </div>
                    {sellerShip && (
                      <span className="text-xs text-muted-foreground">
                        Enviado de {sellerShip.nearestCenter.city} - {sellerShip.nearestCenter.state}
                      </span>
                    )}
                  </div>

                  {/* Produtos deste vendedor */}
                  <div className="divide-y divide-border/50">
                    {sellerItems.map(({ product, quantity }) => (
                      <div key={product.id} className="flex gap-4 p-4">
                        <Link to={`/produto/${product.id}`} className="flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/produto/${product.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1 text-sm">
                            {product.name}
                          </Link>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity - 1)}>
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity + 1)} disabled={quantity >= product.stock}>
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-primary text-sm">{formatCurrency(product.price * quantity)}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeItem(product.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Seleção de transportadora por vendedor */}
                  {sellerShip && sellerShip.options.length > 0 && (
                    <div className="px-4 py-3 border-t border-border bg-muted/30 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Escolha a entrega</p>
                      <div className="grid gap-2">
                        {sellerShip.options.map(option => {
                          const isSelected = selectedId === option.carrier.id;
                          const rec = option.recommendation ? RECOMMENDATION_LABELS[option.recommendation] : null;
                          return (
                            <button
                              key={option.carrier.id}
                              onClick={() => setSelectedCarriers(prev => ({ ...prev, [sellerName]: option.carrier.id }))}
                              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all text-sm ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-muted-foreground/40'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Truck className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="font-medium">{option.carrier.name}</span>
                                {rec && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                                    <rec.icon className="w-3 h-3" />
                                    {rec.label}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="font-semibold">{formatCurrency(option.cost)}</span>
                                <span className="text-xs text-muted-foreground ml-2">{option.days} dias</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumo do pedido — sticky para visibilidade durante scroll */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-card sticky top-24">
              <h2 className="text-lg font-bold mb-4">Resumo do Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                {/* Frete detalhado por vendedor — transparência total dos custos */}
                {sellerShipping.length > 0 && (
                  <div className="space-y-1">
                    {sellerShipping.map(s => {
                      const carrierId = selectedCarriers[s.sellerId];
                      const option = s.options.find(o => o.carrier.id === carrierId);
                      return (
                        <div key={s.sellerId} className="flex justify-between text-xs text-muted-foreground">
                          <span>Frete {s.sellerName} ({option?.carrier.name})</span>
                          <span>{option ? formatCurrency(option.cost) : '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete total</span>
                  {location ? (
                    <span className="font-medium">{formatCurrency(totalShipping)}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Informe o CEP</span>
                  )}
                </div>

                {location && maxDays > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <p>📦 Entrega completa em até <span className="font-semibold text-foreground">{maxDays} dias úteis</span></p>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl text-primary">{formatCurrency(total + totalShipping)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Finalizar Compra <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Ao continuar, você concorda com nossos termos de uso
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
