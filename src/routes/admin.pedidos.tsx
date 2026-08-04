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
  
  const [showNfId, setShowNfId] = useState<string | null>(null);
  const selectedOrder = orders.find(o => o.id === showNfId);

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
                              <Button variant="ghost" size="icon" title="Ver Nota Fiscal" onClick={() => setShowNfId(o.id)}>
                                <FileText className="h-4 w-4 text-muted-foreground" />
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
                <p className="text-muted-foreground mt-2">Número da Nota: NFe-{selectedOrder.id.replace('#', '')}</p>
              </div>
              <div className="border-b border-border pb-4">
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Subtotal</span>
                  <span>{brl(selectedOrder.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Frete</span>
                  <span>{brl(selectedOrder.shipping ?? 0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Desconto</span>
                  <span>- {brl(selectedOrder.discount ?? 0)}</span>
                </div>
                {selectedOrder.couponCode && (
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Cupom</span>
                    <span>{selectedOrder.couponCode}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-3 mb-2 pt-3 border-t border-border">
                  <span>TOTAL PAGO</span>
                  <span>{brl(selectedOrder.total ?? 0)}</span>
                </div>
                <p className="text-muted-foreground text-xs text-right mt-2 uppercase">Pagamento: {selectedOrder.payment ?? "N/A"}</p>
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
