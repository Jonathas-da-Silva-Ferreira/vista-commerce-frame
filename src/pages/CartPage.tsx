import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useLocation } from '@/contexts/LocationContext';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { location } = useLocation();
  // Frete como estado local ao invés de derivar do contexto —
  // o cálculo depende da combinação específica de items + região,
  // e cada página pode ter necessidades diferentes de frete
  const [shippingCost, setShippingCost] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState<number | null>(null);
  const [nearestCenterName, setNearestCenterName] = useState<string | null>(null);

  // Recalcula frete sempre que localização ou items mudam —
  // envia lista de productIds para o backend calcular frete individual por produto
  useEffect(() => {
    if (!location || items.length === 0) {
      setShippingCost(0);
      setDeliveryDays(null);
      setNearestCenterName(null);
      return;
    }
    fetch('/api/shipping/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        items: items.map(i => ({ productId: i.product.id })),
      }),
    })
      .then(r => r.json())
      .then(data => {
        setShippingCost(data.shippingCost ?? 0);
        setDeliveryDays(data.deliveryDays ?? null);
        setNearestCenterName(data.nearestCenter ? `${data.nearestCenter.city} - ${data.nearestCenter.state}` : null);
      })
      .catch(() => {
        setShippingCost(0);
        setDeliveryDays(null);
        setNearestCenterName(null);
      });
  }, [location, items]);

  const handleCheckout = async () => {
    try {
      // Decrementa estoque de todos os itens em paralelo via Promise.all —
      // mais rápido que sequencial e aceitável porque cada PATCH afeta um produto diferente
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

  // Early return para carrinho vazio — renderiza CTA antes de montar layout completo,
  // evitando flash de conteúdo vazio
  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-6">
            Adicione produtos ao carrinho para continuar comprando
          </p>
          <Link to="/produtos">
            <Button size="lg">
              Explorar Produtos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
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
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
            Limpar Carrinho
          </Button>
        </div>

        {/* Grid 2/3 + 1/3: items ocupam mais espaço, resumo fica fixo na lateral */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-4 bg-card rounded-xl p-4 shadow-card"
              >
                <Link to={`/produto/${product.id}`} className="flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/produto/${product.id}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vendido por {product.seller}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {/* updateQuantity com quantity-1 remove automaticamente se chegar a 0 —
                          lógica centralizada no reducer */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      {/* Limite máximo = estoque disponível — previne overselling */}
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Preço total do item (unitário × quantidade) —
                          calculado inline pois é apenas visual, o total real vem do reducer */}
                      <span className="font-bold text-primary">
                        {formatCurrency(product.price * quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary — sticky para ficar visível durante scroll em carrinhos grandes */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-card sticky top-24">
              <h2 className="text-lg font-bold mb-4">Resumo do Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})
                  </span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  {/* Três estados possíveis: grátis, pago, ou sem CEP informado */}
                  {location ? (
                    shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">Grátis</span>
                    ) : (
                      <span className="font-medium">{formatCurrency(shippingCost)}</span>
                    )
                  ) : (
                    <span className="text-muted-foreground text-xs">Informe o CEP</span>
                  )}
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  {/* Soma subtotal + frete — se CEP não informado, shippingCost=0 */}
                  <span className="font-bold text-xl text-primary">{formatCurrency(total + shippingCost)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Finalizar Compra
                <ArrowRight className="w-5 h-5 ml-2" />
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
