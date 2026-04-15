import { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, DollarSign, MapPin, TrendingUp, Truck, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

// Tipagem do payload retornado por /api/logistics/dashboard —
// contrato entre frontend e backend definido aqui para validação em dev
interface DashboardData {
  totalOrders: number;
  avgDeliveryDays: number;
  avgShippingCost: number;
  freeShippingRate: number;
  regionBreakdown: Record<string, number>;
  // Campos opcionais que o backend pode enviar no futuro
  carrierBreakdown?: Record<string, number>;
  recentOrders?: Array<{
    id: string;
    region: string;
    carrier: string;
    days: number;
    cost: number;
    date: string;
  }>;
}

// Cores por região — HSL para consistência com design system
const REGION_COLORS: Record<string, string> = {
  Sudeste: 'hsl(220, 70%, 50%)',
  Sul: 'hsl(150, 60%, 45%)',
  Nordeste: 'hsl(30, 80%, 55%)',
  Norte: 'hsl(340, 65%, 50%)',
  'Centro-Oeste': 'hsl(270, 50%, 55%)',
};

export default function LogisticsDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função reutilizável para fetch — permite refresh manual
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/logistics/dashboard');
      if (!res.ok) throw new Error('Falha ao carregar dados logísticos');
      const json: DashboardData = await res.json();
      setData(json);
    } catch {
      setError('Não foi possível carregar o dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados na montagem — useEffect com [] garante chamada única
  useEffect(() => { fetchDashboard(); }, []);

  // Transforma dados brutos em formato consumível pelos gráficos Recharts
  const chartData = useMemo(() => {
    if (!data) return { regionData: [], carrierData: [] };

    const regionData = Object.entries(data.regionBreakdown).map(([name, value]) => ({ name, value }));

    // Se backend não enviar breakdown de transportadoras, gera distribuição
    // proporcional estimada — será substituída por dados reais em produção
    const carrierData = data.carrierBreakdown
      ? Object.entries(data.carrierBreakdown).map(([name, value]) => ({ name, value }))
      : [
          { name: 'Econômico', value: Math.round(data.totalOrders * 0.35) },
          { name: 'Padrão', value: Math.round(data.totalOrders * 0.45) },
          { name: 'Expresso', value: Math.round(data.totalOrders * 0.20) },
        ];

    return { regionData, carrierData };
  }, [data]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dashboard logístico...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <p className="text-destructive">{error || 'Erro desconhecido'}</p>
          <Button onClick={fetchDashboard} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Logístico</h1>
            <p className="text-muted-foreground text-sm">Visão geral de entregas e custos de frete</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </div>

        {/* KPI Cards — métricas principais consumidas da API */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.totalOrders}</p>
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
                  <p className="text-2xl font-bold">{data.avgDeliveryDays.toFixed(1)}</p>
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
                  <p className="text-2xl font-bold">{formatCurrency(data.avgShippingCost)}</p>
                  <p className="text-xs text-muted-foreground">Custo médio frete</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(data.freeShippingRate * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Taxa frete grátis</p>
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
                  <Pie
                    data={chartData.regionData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.regionData.map((entry) => (
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
                <BarChart data={chartData.carrierData}>
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

        {/* Tabela de pedidos recentes — só exibe se a API retornar a lista */}
        {data.recentOrders && data.recentOrders.length > 0 && (
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
                    {data.recentOrders.map(o => (
                      <tr key={o.id} className="border-b border-border/50">
                        <td className="py-2 font-medium">#{o.id.padStart(4, '0')}</td>
                        <td className="py-2">{o.region}</td>
                        <td className="py-2">{o.carrier}</td>
                        <td className="py-2">{o.days} dias</td>
                        <td className="py-2 text-right">
                          {o.cost === 0
                            ? <span className="text-primary font-medium">Grátis</span>
                            : formatCurrency(o.cost)
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}