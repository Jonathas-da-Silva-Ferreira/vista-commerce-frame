import { useEffect, useMemo, useState } from 'react';
import { Search, Eye, EyeOff, Trash2, RotateCcw, Pencil, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ProductStatus } from '@/types';

interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  status: ProductStatus;
  sales_count: number;
  seller_id: string;
  category_id: string | null;
  created_at: string;
}

/**
 * Admin Products view: full CRUD + soft-delete + restore + hide/show.
 * RLS already enforces admin-only mutations server-side, so the UI can
 * issue Supabase calls directly without an extra edge function layer.
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ProductStatus>('all');
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setProducts((data as AdminProduct[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  // Client-side filtering for sub-second feel on the typical "few hundred
  // products" admin workload. If catalogs grow >1k rows we should move
  // this to server-side filters with pagination.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.seller_id.toLowerCase().includes(q)
      );
    });
  }, [products, search, filter]);

  // Why we update state optimistically AFTER the request succeeds (not
  // before): if RLS rejects the operation we'd otherwise show a phantom
  // state until the next refresh. Honesty > optimism for admin tools.
  const setStatus = async (id: string, status: ProductStatus) => {
    const { error } = await supabase.from('products').update({ status }).eq('id', id);
    if (error) return toast.error(error.message);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    toast.success(
      status === 'hidden' ? 'Product hidden' :
      status === 'active' ? 'Product restored' :
      'Product deleted'
    );
  };

  const hardDelete = async (id: string) => {
    if (!confirm('Permanently delete this product? This cannot be undone.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Product permanently deleted');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from('products')
      .update({
        name: editing.name,
        description: editing.description,
        price: editing.price,
        stock: editing.stock,
        image_url: editing.image_url,
      })
      .eq('id', editing.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    setProducts((prev) => prev.map((p) => (p.id === editing.id ? editing : p)));
    setEditing(null);
    toast.success('Product updated');
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground text-sm">{filtered.length} of {products.length}</p>
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'hidden', 'deleted'] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID or seller ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Sales</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={6} className="p-3"><Skeleton className="h-8" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found.</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden">
                            {p.image_url && (
                              <img src={p.image_url} alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[260px]">{p.name}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[260px]">{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">${Number(p.price).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={p.stock <= 5 ? 'text-destructive font-medium' : ''}>{p.stock}</span>
                      </td>
                      <td className="p-3">{p.sales_count}</td>
                      <td className="p-3">
                        <Badge variant={p.status === 'active' ? 'default' : p.status === 'hidden' ? 'secondary' : 'destructive'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setEditing(p)} title="Edit">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {p.status === 'active' && (
                            <Button size="icon" variant="ghost" onClick={() => setStatus(p.id, 'hidden')} title="Hide">
                              <EyeOff className="w-4 h-4" />
                            </Button>
                          )}
                          {p.status !== 'active' && (
                            <Button size="icon" variant="ghost" onClick={() => setStatus(p.id, 'active')} title="Restore">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          )}
                          {p.status !== 'deleted' && (
                            <Button size="icon" variant="ghost" onClick={() => setStatus(p.id, 'deleted')} title="Soft delete">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive"
                            onClick={() => hardDelete(p.id)} title="Permanently delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
            <DialogDescription>Changes are saved immediately to the database.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editing.description ?? ''} rows={3}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price</Label>
                  <Input type="number" step="0.01" value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={editing.image_url ?? ''}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
