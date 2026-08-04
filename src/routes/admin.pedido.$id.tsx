import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, FileText, Wallet } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/admin/pedido/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe do pedido — Painel Orion Store" },
      { name: "description", content: "Confirmação de pagamento, conferência de valor e emissão de nota fiscal." },
      { property: "og:title", content: "Detalhe do pedido — Painel Orion Store" },
      { property: "og:description", content: "Fluxo de conclusão de compra no painel do gestor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrderDetail,
});

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { orders, confirmPayment, confirmValue, adjustOrderTotal, issueInvoice, updateOrderStatus } =
    useShop();
  const order = orders.find((o) => o.id.replace("#", "") === id);
  const [newTotal, setNewTotal] = useState(order ? String(order.total.toFixed(2)) : "");
  const [reason, setReason] = useState("");

  if (!order) {
    return (
      <AdminShell title="Pedido">
        <p className="text-sm text-muted-foreground">Pedido não encontrado.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/admin/pedidos" })}>
          Voltar
        </Button>
      </AdminShell>
    );
  }

  const canInvoice = order.paymentConfirmed && order.valueConfirmed && !order.invoice;

  return (
    <AdminShell title={`Pedido ${order.id}`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">Fluxo de conclusão</h2>
              <Badge variant="outline" className={statusTone[order.status]}>
                {order.status}
              </Badge>
            </div>
            <ol className="mt-5 space-y-3 text-sm">
              <Step done label="1. Pedido recebido" hint={`Criado em ${order.date}`} />
              <Step
                done={!!order.paymentConfirmed}
                label="2. Confirmação de pagamento"
                hint={`Forma: ${order.payment?.toUpperCase() ?? "—"}`}
                action={
                  !order.paymentConfirmed && (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        confirmPayment(order.id);
                        toast.success("Pagamento confirmado.");
                      }}
                    >
                      <Wallet className="h-4 w-4" /> Confirmar pagamento
                    </Button>
                  )
                }
              />
              <Step
                done={!!order.valueConfirmed}
                label="3. Confirmação de valor"
                hint={`Total atual: ${brl(order.total)}`}
                action={
                  !order.valueConfirmed && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        confirmValue(order.id);
                        toast.success("Valor conferido.");
                      }}
                    >
                      <BadgeCheck className="h-4 w-4" /> Confirmar valor
                    </Button>
                  )
                }
              />
              <Step
                done={!!order.invoice}
                label="4. Emissão da nota fiscal"
                hint={
                  order.invoice
                    ? `NF-e ${order.invoice.number} · série ${order.invoice.series}`
                    : "Disponível após confirmar pagamento e valor"
                }
                action={
                  canInvoice && (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        issueInvoice(order.id);
                        toast.success("Nota fiscal emitida e enviada ao cliente.");
                      }}
                    >
                      <FileText className="h-4 w-4" /> Emitir NF-e
                    </Button>
                  )
                }
              />
              <Step
                done={order.status === "Entregue"}
                label="5. Separação, envio e entrega"
                hint="Atualize o status conforme a logística avança"
                action={
                  <Select
                    value={order.status}
                    onValueChange={(v) => {
                      updateOrderStatus(order.id, v as OrderStatus);
                      toast.success(`Status: ${v}`);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
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
                }
              />
            </ol>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Ajustar valor cobrado</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-end">
              <div>
                <Label>Novo total (R$)</Label>
                <Input value={newTotal} onChange={(e) => setNewTotal(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Motivo</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex.: frete recalculado"
                  className="mt-1.5"
                />
              </div>
              <Button
                onClick={() => {
                  const parsed = Number(newTotal.replace(",", "."));
                  if (!Number.isFinite(parsed) || parsed <= 0) {
                    toast.error("Informe um valor válido.");
                    return;
                  }
                  adjustOrderTotal(order.id, parsed, reason);
                  toast.success("Valor atualizado e confirmado.");
                }}
              >
                Aplicar
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Histórico</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {(order.history ?? []).map((h, i) => (
                <li key={i}>
                  {new Date(h.at).toLocaleString("pt-BR")} — {h.label}
                </li>
              ))}
              {!order.history?.length && <li>Sem eventos registrados.</li>}
            </ul>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Cliente</h2>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{order.customer}</p>
            <p className="text-muted-foreground">{order.email ?? "—"}</p>
            <p className="text-muted-foreground">CPF: {order.doc ?? "—"}</p>
            <p className="text-muted-foreground">Tel: {order.phone ?? "—"}</p>
            <p className="text-muted-foreground">
              {order.address ?? "—"} {order.cep ? `· CEP ${order.cep}` : ""}
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold">Itens</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground border-b border-border pb-3">
              {(order.lines ?? []).map((l) => (
                <li key={`${l.productId}-${l.variant}`} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {l.qty}x {l.name}
                  </span>
                  <span>{brl(l.price * l.qty)}</span>
                </li>
              ))}
              {!order.lines?.length && <li>{order.items} item(s)</li>}
            </ul>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground border-b border-border pb-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{brl(order.subtotal ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{brl(order.shipping ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Desconto</span>
                <span>- {brl(order.discount ?? 0)}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between">
                  <span>Cupom</span>
                  <span>{order.couponCode}</span>
                </div>
              )}
            </div>
            <p className="mt-3 flex justify-between font-display text-lg font-bold">
              <span>Total Pago</span> <span>{brl(order.total)}</span>
            </p>
            <p className="text-muted-foreground text-xs text-right mt-1 uppercase">
              Pagamento: {order.payment ?? "Indefinido"}
            </p>
          </div>
          <Link to="/admin/pedidos">
            <Button variant="outline" className="w-full">
              Voltar aos pedidos
            </Button>
          </Link>
        </aside>
      </div>
    </AdminShell>
  );
}

function Step({
  done,
  label,
  hint,
  action,
}: {
  done?: boolean;
  label: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
      <div className="min-w-0">
        <p className={`font-medium ${done ? "text-success" : ""}`}>{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {action}
    </li>
  );
}
