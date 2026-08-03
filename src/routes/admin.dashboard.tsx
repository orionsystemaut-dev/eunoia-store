import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Package, Receipt, TrendingUp, Wallet } from "lucide-react";

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
      { property: "og:title", content: "Dashboard administrativo — Orion Store" },
      { property: "og:description", content: "Painel de métricas da loja Orion." },
      { name: "robots", content: "noindex" },
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

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <p className="min-w-0 text-sm text-muted-foreground">{m.label}</p>
              <m.icon className="h-5 w-5 shrink-0 text-brand" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{m.value}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-success">
              <ArrowUpRight className="h-3 w-3" /> {m.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 font-display text-lg font-semibold">Pedidos recentes</h2>
            <Link to="/admin/pedidos" className="shrink-0 text-sm text-brand hover:underline">
              Gerenciar
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {o.id} · {o.customer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {o.date} · {o.items} item(ns)
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">{brl(o.total)}</p>
                  <Badge variant="secondary" className="mt-1 text-[11px]">
                    {o.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="min-w-0 font-display text-lg font-semibold">Estoque em atenção</h2>
            <Link to="/admin/produtos" className="shrink-0 text-sm text-brand hover:underline">
              Gerenciar
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Todos os produtos com estoque saudável.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <Package className="h-4 w-4 shrink-0 text-warning" />
                  <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                  <span className="shrink-0 text-sm font-semibold">{p.stock} un.</span>
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
