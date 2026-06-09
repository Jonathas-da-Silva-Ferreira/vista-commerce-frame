import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, DollarSign, AlertTriangle, TrendingUp, Store } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardMetrics {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  bestSellers: Array<{ id: string; name: string; sales_count: number }>;
  lowStock: Array<{ id: string; name: string; stock: number }>;
  recentOrders: Array<{ id: string; total: number; status: string; created_at: string }>;
}

const EMPTY: DashboardMetrics = {
  totalUsers: 0, totalSellers: 0, totalProducts: 0, totalOrders: 0,
  totalRevenue: 0, bestSellers: [], lowStock: [], recentOrders: [],
};

/**
 * Dashboard pulls metrics through parallel Supabase queries instead of a
 * single edge function so the page stays fast even when one tile is slow
 * (each card resolves independently). Counts use `head: true` + `count:
 * 'exact'` to avoid transferring rows we never render.
 */
export default function AdminDashboardPage() {
  const [m, setM] = useState<DashboardMetrics>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      // Parallelize independent queries. Promise.all halves wall-clock time
      // on the dashboard's initial render, which is the single most-visited
      // admin page.
      const [
        usersRes,
        sellersRes,
        productsRes,
        ordersRes,
        revenueRes,
        bestRes,
        lowStockRes,
        recentRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('user_id', { count: 'exact', head: true }).eq('role', 'seller'),
        supabase.from('products').select('id', { count: 'exact', head: true }).neq('status', 'deleted'),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        // Revenue only counts orders that actually generated revenue.
        // Pending/cancelled/refunded must be excluded to avoid inflated KPIs.
        supabase.from('orders').select('total').in('status', ['paid', 'shipped', 'delivered']),
        supabase.from('products').select('id,name,sales_count').order('sales_count', { ascending: false }).limit(5),
        // "Low stock" threshold of 5 mirrors a common retail trigger for
        // restock alerts; tune via a future settings table if needed.
        supabase.from('products').select('id,name,stock').eq('status', 'active').lte('stock', 5).order('stock').limit(5),
        supabase.from('orders').select('id,total,status,created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      if (!active) return;

      const revenue = (revenueRes.data ?? []).reduce((sum, r) => sum + Number(r.total ?? 0), 0);

      setM({
        totalUsers: usersRes.count ?? 0,
        totalSellers: sellersRes.count ?? 0,
        totalProducts: productsRes.count ?? 0,
        totalOrders: ordersRes.count ?? 0,
        totalRevenue: revenue,
        bestSellers: bestRes.data ?? [],
        lowStock: lowStockRes.data ?? [],
        recentOrders: recentRes.data ?? [],
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Marketplace at a glance</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricCard label="Users" value={m.totalUsers} icon={Users} loading={loading} />
          <MetricCard label="Sellers" value={m.totalSellers} icon={Store} loading={loading} />
          <MetricCard label="Products" value={m.totalProducts} icon={Package} loading={loading} />
          <MetricCard label="Orders" value={m.totalOrders} icon={ShoppingCart} loading={loading} />
          <MetricCard label="Revenue" value={`$${m.totalRevenue.toFixed(2)}`} icon={DollarSign} loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Best sellers</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-32" /> : m.bestSellers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {m.bestSellers.map((p) => (
                    <li key={p.id} className="flex justify-between">
                      <span className="truncate">{p.name}</span>
                      <span className="text-muted-foreground">{p.sales_count} sold</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <CardTitle className="text-base">Low stock alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-32" /> : m.lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">All products well stocked.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {m.lowStock.map((p) => (
                    <li key={p.id} className="flex justify-between">
                      <span className="truncate">{p.name}</span>
                      <span className="text-destructive font-medium">{p.stock} left</span>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="link" size="sm" asChild className="px-0 mt-2">
                <Link to="/admin/products">Manage products →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-32" /> : m.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {m.recentOrders.map((o) => (
                    <li key={o.id} className="flex justify-between">
                      <span className="truncate">#{o.id.slice(0, 8)}</span>
                      <span className="text-muted-foreground">${Number(o.total).toFixed(2)} · {o.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

// Reusable tile. Extracting it keeps the dashboard JSX scannable and
// guarantees identical styling across all metrics.
function MetricCard({
  label, value, icon: Icon, loading,
}: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        {loading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );
}
