import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl, ORDER_STATUSES, type OrderStatus } from "@/lib/shop-data";
import { statusTone } from "@/lib/order-flow";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({
    meta: [
      { title: "Gestão de pedidos — Painel Orion Store" },
      {
        name: "description",
        content:
          "Acompanhe e atualize o status dos pedidos da Orion Store: aguardando pagamento, em separação, enviado e entregue.",
      },
      { property: "og:title", content: "Gestão de pedidos — Painel Orion Store" },
      { property: "og:description", content: "Controle de status dos pedidos da loja Orion." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const { orders, updateOrderStatus } = useShop();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "Todos">("Todos");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminShell title="Pedidos">
      <div className="grid gap-3 sm:grid-cols-4">
        {ORDER_STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s}</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {orders.filter((o) => o.status === s).length}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar por código (ex: #10432)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-card"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[190px] bg-card">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os Status</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Itens</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Fluxo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id}>
                <td className="px-4 py-3 font-medium">
                  <Link
                    to="/admin/pedido/$id"
                    params={{ id: o.id.replace("#", "") }}
                    className="text-brand hover:underline"
                  >
                    {o.id}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.customer}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                <td className="px-4 py-3">{o.items}</td>
                <td className="px-4 py-3 font-semibold">{brl(o.total)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`hidden lg:inline-flex ${statusTone[o.status]}`}>
                      {o.status}
                    </Badge>
                    <Select
                      value={o.status}
                      onValueChange={(v) => {
                        updateOrderStatus(o.id, v as OrderStatus);
                        toast.success(`Pedido ${o.id} atualizado para "${v}"`);
                      }}
                    >
                      <SelectTrigger className="w-[190px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link to="/admin/pedido/$id" params={{ id: o.id.replace("#", "") }}>
                    <Button variant="outline" size="sm">
                      Gerenciar
                    </Button>
                  </Link>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
