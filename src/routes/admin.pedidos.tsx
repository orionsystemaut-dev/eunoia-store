import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { FileText, Printer } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "Todos">("Todos");
  
  const [showNfId, setShowNfId] = useState<string | null>(null);
  const selectedOrder = orders.find(o => o.id === showNfId);

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
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
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
                    {o.status !== "Aguardando Pagamento" && (
                      <Button variant="ghost" size="icon" title="Ver Nota Fiscal" onClick={() => setShowNfId(o.id)}>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!showNfId} onOpenChange={(open) => !open && setShowNfId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand" /> 
              Nota Fiscal do Pedido
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 pt-4 text-sm">
              <div className="border-b border-border pb-4">
                <p className="font-bold">ORION STORE LTDA</p>
                <p className="text-muted-foreground">CNPJ: 12.345.678/0001-90</p>
                <p className="text-muted-foreground mt-2">Data: {selectedOrder.date}</p>
                <p className="text-muted-foreground">Pedido: {selectedOrder.id}</p>
              </div>
              <div className="border-b border-border pb-4">
                <p className="font-bold mb-2">CLIENTE</p>
                <p>{selectedOrder.customer}</p>
              </div>
              <div className="border-b border-border pb-4">
                <div className="flex justify-between font-bold mb-2">
                  <span>TOTAL PAGO</span>
                  <span>{brl(selectedOrder.total)}</span>
                </div>
              </div>
              <Button className="w-full gap-2" variant="outline" onClick={() => {toast.success("Impressão iniciada!"); setShowNfId(null);}}>
                <Printer className="h-4 w-4" /> Imprimir Comprovante
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
