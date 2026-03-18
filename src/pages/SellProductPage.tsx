import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, Layers, Image, Store, Hash, FileText, ArrowLeft, LogIn } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { categories } from '@/data/mockData';

const categoryOptions = categories.filter(c => (c.subcategories?.length ?? 0) > 0);

export default function SellProductPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    stock: '',
    image: '',
    sellerName: '',
  });

  const selectedCategory = categoryOptions.find(c => c.slug === form.category);
  const subcategoryOptions = selectedCategory?.subcategories ?? [];

  const updateField = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'category' ? { subcategory: '' } : {}),
    }));
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
              <LogIn className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Acesso restrito</h1>
            <p className="text-muted-foreground">
              Você precisa estar logado para vender produtos no MarketBR.
            </p>
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
              <LogIn className="w-4 h-4" />
              Fazer login ou cadastrar
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.category || !form.subcategory || !form.price || !form.stock || !form.image) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (isNaN(price) || price <= 0) { toast.error('Preço inválido.'); return; }
    if (isNaN(stock) || stock < 1) { toast.error('Quantidade inválida.'); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          subcategory: form.subcategory,
          price,
          stock,
          image: form.image.trim(),
          seller: form.sellerName.trim() || user?.name || 'Vendedor',
          sellerId: user?.id,
        }),
      });
      if (!res.ok) throw new Error('Falha ao cadastrar produto');
      toast.success('Produto cadastrado com sucesso!');
      navigate('/produtos');
    } catch {
      toast.error('Erro ao cadastrar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/50">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Vender Produto</h1>
              <p className="text-muted-foreground mt-1">
                Preencha os dados do produto que deseja vender
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome do produto */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do produto *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="Ex: Smartphone Ultra 5G" className="pl-10" value={form.name} onChange={e => updateField('name', e.target.value)} required maxLength={120} />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea id="description" placeholder="Descreva o produto detalhadamente..." className="pl-10 min-h-[100px]" value={form.description} onChange={e => updateField('description', e.target.value)} required maxLength={1000} />
                </div>
              </div>

              {/* Categoria e Subcategoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={form.category} onValueChange={v => updateField('category', v)}>
                    <SelectTrigger>
                      <Layers className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(c => (
                        <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategoria *</Label>
                  <Select value={form.subcategory} onValueChange={v => updateField('subcategory', v)} disabled={!form.category}>
                    <SelectTrigger>
                      <SelectValue placeholder={form.category ? 'Selecione' : 'Escolha a categoria primeiro'} />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoryOptions.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preço e Estoque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="price" type="number" step="0.01" min="0.01" placeholder="0,00" className="pl-10" value={form.price} onChange={e => updateField('price', e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Quantidade em estoque *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="stock" type="number" min="1" placeholder="1" className="pl-10" value={form.stock} onChange={e => updateField('stock', e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* Imagem */}
              <div className="space-y-2">
                <Label htmlFor="image">URL da imagem *</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="image" type="url" placeholder="https://exemplo.com/imagem.jpg" className="pl-10" value={form.image} onChange={e => updateField('image', e.target.value)} required />
                </div>
                {form.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border w-32 h-32">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              {/* Nome da loja */}
              <div className="space-y-2">
                <Label htmlFor="sellerName">Nome da loja / vendedor</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="sellerName" placeholder={user?.name || 'Sua loja'} className="pl-10" value={form.sellerName} onChange={e => updateField('sellerName', e.target.value)} maxLength={60} />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Produto'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
