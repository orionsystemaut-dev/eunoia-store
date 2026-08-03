import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";

import { StoreShell } from "@/components/shop/StoreShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { brl } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout seguro — Orion Store" },
      {
        name: "description",
        content:
          "Finalize seu pedido na Orion Store com entrega rastreada e pagamento via Pix, boleto ou cartão em até 10x sem juros.",
      },
      { property: "og:title", content: "Checkout seguro — Orion Store" },
      {
        property: "og:description",
        content: "Revise seu pedido e finalize a compra com pagamento seguro.",
      },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { cart, cartTotal, placeOrder } = useShop();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("pix");
  const [done, setDone] = useState<string | null>(null);

  const shipping = cartTotal >= 299 || cartTotal === 0 ? 0 : 24.9;
  const discount = payment === "pix" ? cartTotal * 0.12 : 0;
  const total = cartTotal + shipping - discount;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !cep || !address) {
      toast.error("Preencha todos os dados de entrega.");
      return;
    }
    const order = placeOrder(name);
    setDone(order.id);
  };

  if (done) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h1 className="mt-5 font-display text-3xl font-bold">Pedido confirmado!</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Seu pedido <strong className="text-foreground">{done}</strong> foi registrado e está
            aguardando pagamento. Enviamos os detalhes para o seu e-mail.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/">
              <Button>Voltar à loja</Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline">Ver no painel</Button>
            </Link>
          </div>
        </div>
      </StoreShell>
    );
  }

  if (cart.length === 0) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Seu carrinho está vazio</h1>
          <Link
            to="/catalogo"
            search={{ q: "", categoria: "todas", ordem: "relevancia" }}
            className="mt-4 inline-block"
          >
            <Button onClick={() => navigate({ to: "/catalogo", search: { q: "", categoria: "todas", ordem: "relevancia" } })}>
              Explorar produtos
            </Button>
          </Link>
        </div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <h1 className="font-display text-3xl font-bold">Finalizar compra</h1>
        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Dados de entrega</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    className="mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="endereco">Endereço completo</Label>
                  <Input
                    id="endereco"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, complemento, cidade/UF"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Pagamento</h2>
              <RadioGroup value={payment} onValueChange={setPayment} className="mt-4 space-y-3">
                {[
                  { id: "pix", label: "Pix — 12% de desconto" },
                  { id: "cartao", label: "Cartão de crédito — até 10x sem juros" },
                  { id: "boleto", label: "Boleto bancário" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-sm has-[:checked]:border-brand"
                  >
                    <RadioGroupItem value={opt.id} id={opt.id} />
                    {opt.label}
                  </label>
                ))}
              </RadioGroup>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-lg font-semibold">Resumo do pedido</h2>
            <ul className="mt-4 space-y-3">
              {cart.map((i) => (
                <li key={`${i.productId}-${i.variant}`} className="flex gap-3 text-sm">
                  <img
                    src={i.image}
                    alt={i.name}
                    loading="lazy"
                    width={800}
                    height={800}
                    className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.variant} · {i.qty}x
                    </p>
                  </div>
                  <span className="font-medium">{brl(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={brl(cartTotal)} />
              <Row label="Frete" value={shipping === 0 ? "Grátis" : brl(shipping)} />
              {discount > 0 && <Row label="Desconto Pix" value={`- ${brl(discount)}`} />}
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-bold">{brl(total)}</span>
              </div>
            </div>
            <Button type="submit" size="lg" className="mt-5 w-full">
              Confirmar pedido
            </Button>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Ambiente criptografado
            </p>
          </aside>
        </form>
      </div>
    </StoreShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
