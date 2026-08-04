import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Lock, QrCode, CreditCard, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

import { StoreShell } from "@/components/shop/StoreShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brl, type Order } from "@/lib/shop-data";
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
  const { cart, cartTotal, placeOrder, paymentConfig, updateOrderStatus } = useShop();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  
  const initialPayment = paymentConfig.pixEnabled ? "pix" : paymentConfig.cardEnabled ? "cartao" : "boleto";
  const [payment, setPayment] = useState(initialPayment);
  
  const [step, setStep] = useState<"checkout" | "payment" | "done">("checkout");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showNf, setShowNf] = useState(false);

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
    setCurrentOrder(order);
    setStep("payment");
  };

  const handleSimulatePayment = () => {
    if (currentOrder) {
      updateOrderStatus(currentOrder.id, "Em Separação");
      setStep("done");
    }
  };

  if (step === "payment" && currentOrder) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Pagamento</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Pedido {currentOrder.id} gerado com sucesso. Efetue o pagamento para continuar.
          </p>

          {payment === "pix" && (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6">
              <QrCode className="mx-auto h-24 w-24 text-brand mb-4" />
              <p className="text-sm font-medium">Escaneie o QR Code ou use a chave PIX abaixo:</p>
              <div className="mt-4 bg-muted p-3 rounded-lg text-sm font-mono border border-border">
                {paymentConfig.pixKey}
              </div>
              <Button className="mt-6 w-full" onClick={handleSimulatePayment}>
                Simular Pagamento Realizado
              </Button>
            </div>
          )}

          {payment === "cartao" && (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6">
              <CreditCard className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Insira os dados do seu cartão (Simulação via API: {paymentConfig.gatewayKey.substring(0,8)}...)</p>
              <Input placeholder="Número do Cartão" className="mt-4" />
              <div className="flex gap-4 mt-4">
                <Input placeholder="MM/AA" />
                <Input placeholder="CVC" />
              </div>
              <Button className="mt-6 w-full" onClick={handleSimulatePayment}>
                Pagar {brl(total)}
              </Button>
            </div>
          )}
          
          {payment === "boleto" && (
            <div className="mt-8 rounded-2xl border border-border bg-card p-6">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Boleto gerado com sucesso.</p>
              <Button className="mt-6 w-full" onClick={handleSimulatePayment}>
                Simular Pagamento do Boleto
              </Button>
            </div>
          )}
        </div>
      </StoreShell>
    );
  }

  if (step === "done" && currentOrder) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
          <h1 className="mt-5 font-display text-3xl font-bold">Pagamento Aprovado!</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Seu pedido <strong className="text-foreground">{currentOrder.id}</strong> foi confirmado e já está em separação.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowNf(true)} className="gap-2">
              <FileText className="h-4 w-4" /> Ver Nota Fiscal
            </Button>
            <Link to="/">
              <Button>Continuar Comprando</Button>
            </Link>
          </div>

          <Dialog open={showNf} onOpenChange={setShowNf}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand" /> 
                  Nota Fiscal Eletrônica
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4 text-sm">
                <div className="border-b border-border pb-4">
                  <p className="font-bold">ORION STORE LTDA</p>
                  <p className="text-muted-foreground">CNPJ: 12.345.678/0001-90</p>
                  <p className="text-muted-foreground mt-2">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                  <p className="text-muted-foreground">Pedido: {currentOrder.id}</p>
                </div>
                <div className="border-b border-border pb-4">
                  <p className="font-bold mb-2">CLIENTE</p>
                  <p>{name}</p>
                  <p className="text-muted-foreground">{email}</p>
                  <p className="text-muted-foreground">{address} - CEP: {cep}</p>
                </div>
                <div className="border-b border-border pb-4">
                  <div className="flex justify-between font-bold mb-2">
                    <span>TOTAL PAGO</span>
                    <span>{brl(total)}</span>
                  </div>
                  <p className="text-muted-foreground text-xs text-right">Forma de pagamento: {payment.toUpperCase()}</p>
                </div>
                <Button className="w-full gap-2" variant="outline" onClick={() => {toast.success("Impressão iniciada!"); setShowNf(false);}}>
                  <Printer className="h-4 w-4" /> Imprimir Comprovante
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                {paymentConfig.pixEnabled && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-sm has-[:checked]:border-brand">
                    <RadioGroupItem value="pix" id="pix" />
                    Pix — 12% de desconto
                  </label>
                )}
                {paymentConfig.cardEnabled && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-sm has-[:checked]:border-brand">
                    <RadioGroupItem value="cartao" id="cartao" />
                    Cartão de crédito — até 10x sem juros
                  </label>
                )}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-sm has-[:checked]:border-brand">
                  <RadioGroupItem value="boleto" id="boleto" />
                  Boleto bancário
                </label>
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
