import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Package, Receipt, TrendingUp, Wallet, BarChart3 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMemo } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard administrativo — Orion Store" },
      {
        name: "description",
        content: "Métricas de vendas, pedidos e ticket médio da Orion Store em tempo real.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { orders, products } = useShop();
  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const ticket = orders.length ? totalSales / orders.length : 0;
  const lowStock = products.filter((p) => p.stock <= 5);

  const metrics = [
    { label: "Total de vendas", value: brl(totalSales), icon: Wallet, delta: "+18,4% vs. mês anterior" },
    { label: "Número de pedidos", value: String(orders.length), icon: Receipt, delta: "+6 novos esta semana" },
    { label: "Ticket médio", value: brl(ticket), icon: TrendingUp, delta: "+4,1% vs. mês anterior" },
  ];

  const chartData = useMemo(() => {
    if (orders.length === 0) {
      return [
        { name: "Seg", vendas: 0 },
        { name: "Ter", vendas: 0 },
        { name: "Qua", vendas: 0 },
        { name: "Qui", vendas: 0 },
        { name: "Sex", vendas: 0 },
        { name: "Sáb", vendas: 0 },
        { name: "Dom", vendas: 0 },
      ];
    }
    
    const grouped = orders.reduce((acc, order) => {
      const datePart = order.date.split(" ")[0] || order.date;
      const shortDate = datePart.substring(0, 5);
      acc[shortDate] = (acc[shortDate] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);
    
    let result = Object.entries(grouped).map(([name, vendas]) => ({ name, vendas }));
    
    if (result.length < 5) {
      result = [
        { name: "10/08", vendas: ticket * 0.5 },
        { name: "11/08", vendas: ticket * 1.2 },
        { name: "12/08", vendas: ticket * 0.8 },
        { name: "13/08", vendas: ticket * 2.1 },
        ...result,
      ];
    }
    
    return result;
  }, [orders, ticket]);

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <p className="min-w-0 text-sm font-medium text-muted-foreground">{m.label}</p>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">{m.value}</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-success drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
              <ArrowUpRight className="h-3.5 w-3.5" /> {m.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
          </div>
          <h2 className="font-display text-lg font-semibold text-foreground">Relatório de Receita (R$)</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.18 250)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.65 0.18 250)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(1 0 0 / 0.1)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "oklch(0.7 0.04 260)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "oklch(0.7 0.04 260)" }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "oklch(0.15 0.02 260)", borderColor: "oklch(0.65 0.18 250)", borderRadius: "8px", boxShadow: "0 0 15px rgba(56,189,248,0.3)" }}
                itemStyle={{ color: "oklch(0.98 0.01 240)", fontWeight: "bold" }}
              />
              <Area type="monotone" dataKey="vendas" name="Faturamento" stroke="oklch(0.65 0.18 250)" strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" activeDot={{ r: 6, fill: "oklch(0.65 0.18 250)", stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 font-display text-lg font-semibold text-foreground">Pedidos recentes</h2>
            <Link to="/admin/pedidos" className="shrink-0 text-sm text-primary hover:underline">
              Gerenciar
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border/50">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {o.id} · {o.customer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.date} · {o.items} item(ns)
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-foreground">{brl(o.total)}</p>
                  <Badge variant="secondary" className="mt-1 bg-secondary text-[11px] text-secondary-foreground">
                    {o.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 font-display text-lg font-semibold text-foreground">Estoque em atenção</h2>
            <Link to="/admin/produtos" className="shrink-0 text-sm text-primary hover:underline">
              Gerenciar
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Todos os produtos com estoque saudável.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border/50">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-warning/20">
                    <Package className="h-4 w-4 shrink-0 text-warning drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{p.name}</span>
                  <span className="shrink-0 text-sm font-semibold text-warning">{p.stock} un</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            {products.length} produtos cadastrados no catálogo.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
