import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { FileText, Printer, Trash, RefreshCcw, XCircle } from "lucide-react";

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { brl, ORDER_STATUSES, type OrderStatus } from "@/lib/shop-data";
import { statusTone } from "@/lib/order-flow";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({
    meta: [
      { title: "Gestão de pedidos — Painel Orion Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder, restoreOrder, permanentlyDeleteOrder } = useShop();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "Todos">("Todos");
  const [activeTab, setActiveTab] = useState<"ativos" | "lixeira">("ativos");
  
  const activeOrders = orders.filter(o => !o.isDeleted);
  
  const filteredOrders = orders.filter((o) => {
    const isTrash = Boolean(o.isDeleted);
    if (activeTab === "ativos" && isTrash) return false;
    if (activeTab === "lixeira" && !isTrash) return false;
    
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminShell title="Pedidos">
      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        {ORDER_STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s}</p>
            <p className="mt-1 font-display text-2xl font-bold">
              {activeOrders.filter((o) => o.status === s).length}
            </p>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ativos" | "lixeira")}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="ativos">Pedidos Ativos</TabsTrigger>
            <TabsTrigger value="lixeira">Lixeira</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[200px] bg-card"
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[180px] bg-card">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os Status</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
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
                    <td className="px-4 py-3 font-semibold">{brl(o.total)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`hidden lg:inline-flex ${statusTone[o.status]}`}>
                          {o.status}
                        </Badge>
                        {activeTab === "ativos" && (
                          <Select
                            value={o.status}
                            onValueChange={(v) => {
                              updateOrderStatus(o.id, v as OrderStatus);
                              toast.success(`Pedido ${o.id} atualizado para "${v}"`);
                            }}
                          >
                            <SelectTrigger className="h-8 w-[150px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {activeTab === "ativos" ? (
                          <>
                            {o.status !== "Aguardando Pagamento" && (
                              <Button variant="ghost" size="icon" title="Ver Nota Fiscal" asChild>
                                <Link to="/nf/$id" params={{ id: o.id }} target="_blank">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                </Link>
                              </Button>
                            )}
                            <Link to="/admin/pedido/$id" params={{ id: o.id.replace("#", "") }}>
                              <Button variant="outline" size="sm">Gerenciar</Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Mover para Lixeira"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                deleteOrder(o.id);
                                toast.success(`Pedido ${o.id} movido para a lixeira.`);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => {
                                restoreOrder(o.id);
                                toast.success(`Pedido ${o.id} restaurado.`);
                              }}
                            >
                              <RefreshCcw className="h-3 w-3" /> Restaurar
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="gap-2"
                              onClick={() => {
                                if (window.confirm(`Tem certeza que deseja excluir permanentemente o pedido ${o.id}?`)) {
                                  permanentlyDeleteOrder(o.id);
                                  toast.success(`Pedido ${o.id} excluído permanentemente.`);
                                }
                              }}
                            >
                              <XCircle className="h-3 w-3" /> Excluir Definitivamente
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Tabs>
    </AdminShell>
  );
}
