import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl, ORDER_STATUSES, type OrderStatus } from "@/lib/shop-data";
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

const statusTone: Record<OrderStatus, string> = {
  "Aguardando Pagamento": "bg-warning/15 text-warning-foreground border-warning/40",
  "Em Separação": "bg-accent text-accent-foreground border-border",
  Enviado: "bg-brand/15 text-brand border-brand/40",
  Entregue: "bg-success/15 text-success border-success/40",
};

function AdminOrders() {
  const { orders, updateOrderStatus } = useShop();

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
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium">{o.id}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
