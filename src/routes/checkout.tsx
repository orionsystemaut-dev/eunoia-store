import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Lock } from "lucide-react";
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
          "Finalize seu pedido na Orion Store em 4 passos: identificação, entrega, pagamento e confirmação, com nota fiscal eletrônica.",
      },
      { property: "og:title", content: "Checkout seguro — Orion Store" },
      {
        property: "og:description",
        content: "Revise seu pedido e finalize a compra com pagamento seguro e nota fiscal.",
      },
    ],
  }),
  component: Checkout,
});

const STEPS = ["Identificação", "Entrega", "Pagamento", "Revisão"];

function Checkout() {
  const { cart, cartTotal, placeOrder, customer, registerCustomer, loginCustomer } = useShop();
  const navigate = useNavigate();

  const [step, setStep] = useState(customer ? 1 : 0);
  const [mode, setMode] = useState<"cadastro" | "login">("cadastro");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [doc, setDoc] = useState(customer?.doc ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [cep, setCep] = useState(customer?.cep ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [payment, setPayment] = useState("pix");

  const shipping = cartTotal >= 299 || cartTotal === 0 ? 0 : 24.9;
  const discount = payment === "pix" ? cartTotal * 0.12 : 0;
  const total = cartTotal + shipping - discount;

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
            <Button>Explorar produtos</Button>
          </Link>
        </div>
      </StoreShell>
    );
  }

  const handleIdentity = () => {
    if (customer) return setStep(1);
    if (mode === "login") {
      const res = loginCustomer(email, password);
      if (!res.ok) return toast.error(res.error);
      toast.success("Bem-vindo de volta!");
      return setStep(1);
    }
    if (!name || !email || !password || !doc || !phone)
      return toast.error("Preencha nome, e-mail, senha, CPF e telefone.");
    if (password.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres.");
    const res = registerCustomer({ name, email, password, doc, phone, cep, address });
    if (!res.ok) return toast.error(res.error);
    toast.success("Cadastro criado com sucesso!");
    setStep(1);
  };

  const finish = () => {
    const order = placeOrder({
      name: customer?.name ?? name,
      email: customer?.email ?? email,
      doc: customer?.doc ?? doc,
      phone: customer?.phone ?? phone,
      cep,
      address,
      payment,
      subtotal: cartTotal,
      shipping,
      discount,
      total,
    });
    toast.success(`Pedido ${order.id} criado!`);
    navigate({ to: "/pedido/$id", params: { id: order.id.replace("#", "") } });
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <h1 className="font-display text-3xl font-bold">Finalizar compra</h1>

        <ol className="mt-6 grid grid-cols-4 gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="min-w-0">
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                  i === step
                    ? "border-brand bg-brand/10 text-brand"
                    : i < step
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold">
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="truncate font-medium">{label}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {step === 0 && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold">Identificação</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode(mode === "cadastro" ? "login" : "cadastro")}
                  >
                    {mode === "cadastro" ? "Já tenho conta" : "Criar cadastro"}
                  </Button>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {mode === "cadastro" && (
                    <div className="sm:col-span-2">
                      <Label htmlFor="nome">Nome completo</Label>
                      <Input id="nome" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="senha">Senha</Label>
                    <Input id="senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
                  </div>
                  {mode === "cadastro" && (
                    <>
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input id="cpf" value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="000.000.000-00" className="mt-1.5" />
                      </div>
                      <div>
                        <Label htmlFor="tel">Telefone</Label>
                        <Input id="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="mt-1.5" />
                      </div>
                    </>
                  )}
                </div>
                <Button className="mt-5 w-full" onClick={handleIdentity}>
                  Continuar
                </Button>
              </section>
            )}

            {step === 1 && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold">Dados de entrega</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="tel2">Telefone</Label>
                    <Input id="tel2" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="endereco">Endereço completo</Label>
                    <Input id="endereco" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, complemento, cidade/UF" className="mt-1.5" />
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    Voltar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() =>
                      cep && address ? setStep(2) : toast.error("Informe CEP e endereço.")
                    }
                  >
                    Continuar
                  </Button>
                </div>
              </section>
            )}

            {step === 2 && (
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
                <div className="mt-5 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    Revisar pedido
                  </Button>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold">Revisão e confirmação</h2>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <Detail label="Cliente" value={customer?.name ?? name} />
                  <Detail label="E-mail" value={customer?.email ?? email} />
                  <Detail label="CPF" value={customer?.doc ?? doc} />
                  <Detail label="Telefone" value={phone} />
                  <Detail label="Entrega" value={`${address} — CEP ${cep}`} />
                  <Detail label="Pagamento" value={payment.toUpperCase()} />
                </dl>
                <p className="rounded-xl border border-border bg-surface p-3 text-xs text-muted-foreground">
                  Após a confirmação, o gestor valida o pagamento e o valor do pedido e emite a nota
                  fiscal eletrônica, que fica disponível na página de acompanhamento.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Voltar
                  </Button>
                  <Button className="flex-1" size="lg" onClick={finish}>
                    Confirmar compra · {brl(total)}
                  </Button>
                </div>
              </section>
            )}
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
              <div className="flex items-center justify-between pt-2 font-display text-lg font-bold">
                <span>Total</span>
                <span>{brl(total)}</span>
              </div>
            </div>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Ambiente criptografado
            </p>
          </aside>
        </div>
      </div>
    </StoreShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words font-medium">{value || "—"}</dd>
    </div>
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
