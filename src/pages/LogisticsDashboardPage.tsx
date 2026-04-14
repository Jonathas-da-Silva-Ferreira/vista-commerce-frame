import { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, DollarSign, MapPin, TrendingUp, Truck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Dados simulados de pedidos — em produção viriam de GET /api/logistics/dashboard.
// Gerados deterministicamente para manter consistência entre reloads.
const mockOrders = [
  { id: '1', region: 'Sudeste', cost: 9.90, days: 2, carrier: 'Padrão', date: '2026-04-01' },
  { id: '2', region: 'Sul', cost: 0, days: 2, carrier: 'Econômico', date: '2026-04-02' },
  { id: '3', region: 'Nordeste', cost: 34.90, days: 8, carrier: 'Expresso', date: '2026-04-03' },
  { id: '4', region: 'Norte', cost: 34.90, days: 8, carrier: 'Padrão', date: '2026-04-04' },
  { id: '5', region: 'Centro-Oeste', cost: 19.90, days: 5, carrier: 'Padrão', date: '2026-04-05' },
  { id: '6', region: 'Sudeste', cost: 0, days: 3, carrier: 'Econômico', date: '2026-04-06' },
  { id: '7', region: 'Sul', cost: 9.90, days: 2, carrier: 'Padrão', date: '2026-04-07' },
  { id: '8', region: 'Nordeste', cost: 19.90, days: 5, carrier: 'Padrão', date: '2026-04-08' },
  { id: '9', region: 'Sudeste', cost: 9.90, days: 2, carrier: 'Expresso', date: '2026-04-09' },
  { id: '10', region: 'Norte', cost: 34.90, days: 8, carrier: 'Econômico', date: '2026-04-10' },
  { id: '11', region: 'Sudeste', cost: 19.90, days: 5, carrier: 'Padrão', date: '2026-04-11' },
  { id: '12', region: 'Sul', cost: 0, days: 2, carrier: 'Econômico', date: '2026-04-12' },
  { id: '13', region: 'Centro-Oeste', cost: 9.90, days: 3, carrier: 'Padrão', date: '2026-04-13' },
  { id: '14', region: 'Nordeste', cost: 34.90, days: 8, carrier: 'Expresso', date: '2026-04-14' },
  { id: '15', region: 'Sudeste', cost: 0, days: 2, carrier: 'Econômico', date: '2026-04-14' },
];

// Cores por região para gráfico de pizza — seguem paleta do design system
const REGION_COLORS: Record<string, string> = {
  Sudeste: 'hsl(220, 70%, 50%)',
  Sul: 'hsl(150, 60%, 45%)',
  Nordeste: 'hsl(30, 80%, 55%)',
  Norte: 'hsl(340, 65%, 50%)',
  'Centro-Oeste': 'hsl(270, 50%, 55%)',
};

export default function LogisticsDashboardPage() {
  // Métricas calculadas via useMemo — evita recálculo a cada re-render
  const metrics = useMemo(() => {
    const totalOrders = mockOrders.length;
    const avgDays = mockOrders.reduce((s, o) => s + o.days, 0) / totalOrders;
    const avgCost = mockOrders.reduce((s, o) => s + o.cost, 0) / totalOrders;
    const freeShippingCount = mockOrders.filter(o => o.cost === 0).length;

    // Contagem por região para gráfico de pizza
    const regionMap: Record<string, number> = {};
    mockOrders.forEach(o => { regionMap[o.region] = (regionMap[o.region] || 0) + 1; });
    const regionData = Object.entries(regionMap).map(([name, value]) => ({ name, value }));

    // Contagem por transportadora para gráfico de barras
    const carrierMap: Record<string, number> = {};
    mockOrders.forEach(o => { carrierMap[o.carrier] = (carrierMap[o.carrier] || 0) + 1; });
    const carrierData = Object.entries(carrierMap).map(([name, value]) => ({ name, value }));

    return { totalOrders, avgDays: avgDays.toFixed(1), avgCost: avgCost.toFixed(2), freeShippingCount, regionData, carrierData };
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Logístico</h1>
          <p className="text-muted-foreground text-sm">Visão geral de entregas e custos de frete</p>
        </div>

        {/* KPI Cards — métricas principais em grid responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Pedidos enviados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.avgDays}</p>
                  <p className="text-xs text-muted-foreground">Prazo médio (dias)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">R$ {metrics.avgCost}</p>
                  <p className="text-xs text-muted-foreground">Custo médio frete</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Truck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.freeShippingCount}</p>
                  <p className="text-xs text-muted-foreground">Fretes grátis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos lado a lado — pizza para regiões, barras para transportadoras */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Vendas por Região
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={metrics.regionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {metrics.regionData.map((entry) => (
                      <Cell key={entry.name} fill={REGION_COLORS[entry.name] || 'hsl(0,0%,60%)'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Uso por Transportadora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={metrics.carrierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de pedidos recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimos Envios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Pedido</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Região</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Transportadora</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Prazo</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Frete</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.slice(0, 10).map(o => (
                    <tr key={o.id} className="border-b border-border/50">
                      <td className="py-2 font-medium">#{o.id.padStart(4, '0')}</td>
                      <td className="py-2">{o.region}</td>
                      <td className="py-2">{o.carrier}</td>
                      <td className="py-2">{o.days} dias</td>
                      <td className="py-2 text-right">{o.cost === 0 ? <span className="text-green-500 font-medium">Grátis</span> : `R$ ${o.cost.toFixed(2)}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
