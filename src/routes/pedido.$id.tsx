import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, FileText, Package, Printer } from "lucide-react";

import { StoreShell } from "@/components/shop/StoreShell";
import { Button } from "@/components/ui/button";
import { brl, ORDER_STATUSES } from "@/lib/shop-data";
import { STEP_HINTS } from "@/lib/order-flow";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/pedido/$id")({
  head: () => ({
    meta: [
      { title: "Acompanhar pedido — Orion Store" },
      {
        name: "description",
        content:
          "Acompanhe passo a passo o status do seu pedido na Orion Store e baixe a nota fiscal eletrônica assim que emitida.",
      },
      { property: "og:title", content: "Acompanhar pedido — Orion Store" },
      { property: "og:description", content: "Status do pedido e nota fiscal eletrônica." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderTracking,
});

function OrderTracking() {
  const { id } = Route.useParams();
  const { orders } = useShop();
  const order = orders.find((o) => o.id.replace("#", "") === id);

  if (!order) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Pedido não encontrado</h1>
          <Link to="/conta" className="mt-4 inline-block">
            <Button>Ver meus pedidos</Button>
          </Link>
        </div>
      </StoreShell>
    );
  }

  const current = ORDER_STATUSES.indexOf(order.status);

  return (
    <StoreShell>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <p className="text-sm text-muted-foreground">Pedido</p>
        <h1 className="font-display text-3xl font-bold">{order.id}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{STEP_HINTS[order.status]}</p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Passo a passo</h2>
          <ol className="mt-5 space-y-4">
            {ORDER_STATUSES.map((s, i) => {
              const done = i <= current;
              return (
                <li key={s} className="flex gap-3">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                      done ? "border-success bg-success/15 text-success" : "border-border text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${done ? "" : "text-muted-foreground"}`}>{s}</p>
                    <p className="text-xs text-muted-foreground">{STEP_HINTS[s]}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Package className="h-4 w-4" /> Itens
            </h2>
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
            <div className="mt-3 space-y-1 text-sm text-muted-foreground border-t border-border pt-3">
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
              <p className="flex justify-between pt-1 font-display text-base font-bold text-foreground">
                <span>Total Pago</span> <span>{brl(order.total)}</span>
              </p>
              <p className="text-right text-xs uppercase pt-1">
                Pagamento: {order.payment ?? "Indefinido"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <FileText className="h-4 w-4" /> Nota fiscal
            </h2>
            {order.invoice ? (
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  NF-e <strong>{order.invoice.number}</strong> · série {order.invoice.series}
                </p>
                <p className="text-muted-foreground">
                  Emitida em {new Date(order.invoice.issuedAt).toLocaleString("pt-BR")}
                </p>
                <p className="break-all text-xs text-muted-foreground">
                  Chave de acesso: {order.invoice.key}
                </p>
                <p className="text-muted-foreground">Tributos aprox.: {brl(order.invoice.taxes)}</p>
                <Button variant="outline" className="mt-2 gap-2" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" /> Imprimir / salvar PDF
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                A nota fiscal será emitida pelo gestor após a confirmação do pagamento e do valor do
                pedido. Você receberá por e-mail em {order.email || "seu e-mail cadastrado"}.
              </p>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Histórico</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {(order.history ?? []).map((h, i) => (
              <li key={i}>
                {new Date(h.at).toLocaleString("pt-BR")} — {h.label}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex gap-3">
          <Link to="/">
            <Button variant="outline">Voltar à loja</Button>
          </Link>
          <Link to="/conta">
            <Button>Minha conta</Button>
          </Link>
        </div>
      </div>
    </StoreShell>
  );
}
