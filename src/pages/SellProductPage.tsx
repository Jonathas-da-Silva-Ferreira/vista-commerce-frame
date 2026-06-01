import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, Layers, Image as ImageIcon, Store, Hash, FileText, ArrowLeft, LogIn, Truck } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { categories } from '@/data/mockData';
import { ProductImageUploader } from '@/components/ProductImageUploader';
import { ImagePreview } from '@/components/ImagePreview';

// Lightweight URL validation. We don't fetch the resource (CORS + latency),
// we just verify it parses as http(s) and looks like an image-bearing URL.
// Catches obvious typos without blocking valid CDN URLs that lack extensions.
const isLikelyImageUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return false;
    return true;
  } catch {
    return false;
  }
};

// Filter out "special" categories (Deals, Best Products) — they're not real
// taxonomy nodes, just dynamic listings, so sellers cannot publish into them.
const categoryOptions = categories.filter(c => (c.subcategories?.length ?? 0) > 0);

export default function SellProductPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // Tracks the submit lifecycle so we can both disable the button and avoid
  // accidental double-submits if the network is slow.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    stock: '',
    // Two parallel slots: a remotely-hosted URL and a locally-uploaded asset.
    // We keep them separate in form state so the seller can see/edit both,
    // then collapse them into a single `image` field at submit time using a
    // clear precedence rule (upload wins).
    image: '',
    uploadedImage: '',
    sellerName: '',
    // Defaults encode the commercial policy: free shipping in the densest
    // regions, modest fees elsewhere — sellers can override per row.
    shippingSouth: '0',
    shippingSoutheast: '0',
    shippingCenterWest: '0',
    shippingNorth: '25',
    shippingNortheast: '20',
  });

  // Derived list — never put this in state. Recomputing on every render is
  // cheap and removes a whole class of "stale subcategory list" bugs.
  const selectedCategory = categoryOptions.find(c => c.slug === form.category);
  const subcategoryOptions = selectedCategory?.subcategories ?? [];

  // Single setter that also resets `subcategory` when the parent category
  // changes — prevents persisting a subcategory that no longer belongs.
  const updateField = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'category' ? { subcategory: '' } : {}),
    }));
  };

  // Render-time auth guard — clearer than a redirect because the user keeps
  // visible context of the page they were trying to reach.
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
              <LogIn className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Restricted access</h1>
            <p className="text-muted-foreground">
              You need to be signed in to sell products on Nexora.
            </p>
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
              <LogIn className="w-4 h-4" />
              Sign in or register
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.category || !form.subcategory || !form.price || !form.stock || !form.image) {
      toast.error('Please fill out all required fields.');
      return;
    }

    // type="number" inputs still hand back strings in React; explicit parsing
    // is required before we trust the values for arithmetic or validation.
    const price = parseFloat(form.price);
    const stock = parseInt(form.stock, 10);
    if (isNaN(price) || price <= 0) { toast.error('Invalid price.'); return; }
    if (isNaN(stock) || stock < 1) { toast.error('Invalid quantity.'); return; }

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
          // Cascading fallback so every product always has a visible seller.
          seller: form.sellerName.trim() || user?.name || 'Seller',
          sellerId: user?.id,
          // Region-based shipping enables dynamic checkout pricing tied to
          // the buyer's resolved location.
          shipping: {
            south: parseFloat(form.shippingSouth) || 0,
            southeast: parseFloat(form.shippingSoutheast) || 0,
            centerWest: parseFloat(form.shippingCenterWest) || 0,
            north: parseFloat(form.shippingNorth) || 0,
            northeast: parseFloat(form.shippingNortheast) || 0,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to register product');
      toast.success('Product published successfully!');
      navigate('/products');
    } catch {
      toast.error('Could not publish the product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/50">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Sell a product</h1>
              <p className="text-muted-foreground mt-1">
                Fill out the details of the product you want to sell
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Product name *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {/* maxLength caps the value at a size that fits cleanly in
                      cards and listings without truncating mid-sentence. */}
                  <Input id="name" placeholder="e.g. Ultra 5G Smartphone" className="pl-10" value={form.name} onChange={e => updateField('name', e.target.value)} required maxLength={120} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea id="description" placeholder="Describe the product in detail..." className="pl-10 min-h-[100px]" value={form.description} onChange={e => updateField('description', e.target.value)} required maxLength={1000} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={v => updateField('category', v)}>
                    <SelectTrigger>
                      <Layers className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(c => (
                        <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategory *</Label>
                  {/* Disabled until a category is chosen — prevents the user
                      from picking an orphan subcategory. */}
                  <Select value={form.subcategory} onValueChange={v => updateField('subcategory', v)} disabled={!form.category}>
                    <SelectTrigger>
                      <SelectValue placeholder={form.category ? 'Select' : 'Pick a category first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoryOptions.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    {/* step=0.01 permits cents; min=0.01 blocks zero-price listings. */}
                    <Input id="price" type="number" step="0.01" min="0.01" placeholder="0.00" className="pl-10" value={form.price} onChange={e => updateField('price', e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Quantity in stock *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="stock" type="number" min="1" placeholder="1" className="pl-10" value={form.stock} onChange={e => updateField('stock', e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* URL input as a stop-gap — a real implementation would upload
                  to object storage and store the resulting URL here instead. */}
              <div className="space-y-2">
                <Label htmlFor="image">Image URL *</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="image" type="url" placeholder="https://example.com/image.jpg" className="pl-10" value={form.image} onChange={e => updateField('image', e.target.value)} required />
                </div>
                {form.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-border w-32 h-32">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellerName">Store / seller name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="sellerName" placeholder={user?.name || 'Your store'} className="pl-10" value={form.sellerName} onChange={e => updateField('sellerName', e.target.value)} maxLength={60} />
                </div>
              </div>

              {/* Per-region shipping lets sellers offer free shipping to nearby
                  regions while charging realistic rates to far ones. */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <Label className="text-base font-semibold">Shipping by region (USD)</Label>
                </div>
                <p className="text-xs text-muted-foreground">Set the shipping cost per region. Use 0 for free shipping.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'shippingSouth', label: 'South' },
                    { key: 'shippingSoutheast', label: 'Southeast' },
                    { key: 'shippingCenterWest', label: 'Center-West' },
                    { key: 'shippingNorth', label: 'North' },
                    { key: 'shippingNortheast', label: 'Northeast' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={key} className="text-xs">{label}</Label>
                      <Input
                        id={key}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-9"
                        value={form[key as keyof typeof form]}
                        onChange={e => updateField(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Publishing...' : 'Publish product'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
