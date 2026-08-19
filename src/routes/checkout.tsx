import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, CheckCircle2, Lock, QrCode, CreditCard, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

import { StoreShell } from "@/components/shop/StoreShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { brl, generatePixPayload, type Order, type Coupon } from "@/lib/shop-data";
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
  const { 
    cart, 
    cartTotal, 
    placeOrder, 
    paymentConfig, 
    updateOrderStatus, 
    customer, 
    registerCustomer, 
    loginCustomer, 
    coupons,
    shippingConfig 
  } = useShop();
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
  
  const initialPayment = paymentConfig.pixEnabled ? "pix" : paymentConfig.cardEnabled ? "cartao" : "boleto";
  const [payment, setPayment] = useState(initialPayment);
  
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showNf, setShowNf] = useState(false);
  
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const shipping = cartTotal >= shippingConfig.freeShippingThreshold || cartTotal === 0 ? 0 : shippingConfig.fixedRate;
  
  const pixDiscount = payment === "pix" ? cartTotal * 0.12 : 0;
  
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      couponDiscount = cartTotal * (appliedCoupon.discount / 100);
    } else {
      couponDiscount = appliedCoupon.discount;
    }
  }
  
  const discount = pixDiscount + couponDiscount;
  const total = Math.max(0, cartTotal + shipping - discount);

  const handleApplyCoupon = () => {
    if (!couponInput) return;
    const found = coupons.find(c => c.code === couponInput.toUpperCase() && c.isActive);
    if (found) {
      setAppliedCoupon(found);
      toast.success("Cupom aplicado!");
    } else {
      toast.error("Cupom inválido ou expirado.");
    }
  };

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setAddress(`${data.logradouro}, `);
            toast.success(`Endereço encontrado: ${data.localidade}/${data.uf}`);
          }
        })
        .catch(console.error);
    }
  }, [cep]);

  const handleSimulatePayment = () => {
    if (currentOrder) {
      updateOrderStatus(currentOrder.id, "Em Separação");
      setStep(5);
    }
  };

  if (step === 4 && currentOrder) {
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
              <div className="mt-4 flex flex-col items-center gap-4 border border-border bg-card p-6 rounded-2xl">
                <div className="bg-white p-2 rounded-xl">
                  <QRCodeSVG 
                    value={generatePixPayload(paymentConfig.pixKey, total, "Orion Store", "Sao Paulo")} 
                    size={200} 
                  />
                </div>
                <div className="w-full text-center">
                  <p className="text-xs text-muted-foreground mb-1">Chave PIX</p>
                  <p className="text-sm font-mono font-medium">{paymentConfig.pixKey}</p>
                </div>
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

  if (step === 5 && currentOrder) {
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
                  <p className="text-muted-foreground mt-2">Número da Nota: NFe-{currentOrder.id.replace('#', '')}</p>
                </div>
                <div className="border-b border-border pb-4">
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Subtotal</span>
                    <span>{brl(currentOrder.subtotal ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Frete</span>
                    <span>{brl(currentOrder.shipping ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground mb-1">
                    <span>Desconto</span>
                    <span>- {brl(currentOrder.discount ?? 0)}</span>
                  </div>
                  {currentOrder.couponCode && (
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Cupom</span>
                      <span>{currentOrder.couponCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold mt-3 mb-2 pt-3 border-t border-border">
                    <span>TOTAL PAGO</span>
                    <span>{brl(currentOrder.total)}</span>
                  </div>
                  <p className="text-muted-foreground text-xs text-right mt-2 uppercase">Pagamento: {currentOrder.payment}</p>
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
            <Button>Explorar produtos</Button>
          </Link>
        </div>
      </StoreShell>
    );
  }

  const handleIdentity = async (): Promise<void> => {
    if (customer) {
      setStep(1);
      return;
    }
    if (mode === "login") {
      const res = await loginCustomer(email, password);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Bem-vindo de volta!");
      setStep(1);
      return;
    }
    if (!name || !email || !password || !doc || !phone) {
      toast.error("Preencha nome, e-mail, senha, CPF e telefone.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    const res = await registerCustomer({ name, email, password, doc, phone, cep, address });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Cadastro criado com sucesso!");
    setStep(1);
  };

  const finish = async () => {
    const order = await placeOrder({
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
      couponCode: appliedCoupon?.code,
    });
    if (!order) {
      toast.error("Não foi possível registrar o pedido. Entre na sua conta e tente novamente.");
      return;
    }
    toast.success(`Pedido ${order.id} criado!`);
    setCurrentOrder(order);
    setStep(4);
  };


  return (
    <StoreShell>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-extrabold text-foreground drop-shadow-md">Finalizar Compra</h1>
          <div className="mt-8 flex items-center justify-between relative">
            {/* Progress line background */}
            <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-border/50 rounded-full z-0"></div>
            {/* Active progress line */}
            <div 
              className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-cyan-400 rounded-full z-0 transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.8)]" 
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            ></div>
            
            {STEPS.map((s, i) => {
              const active = i === step;
              const passed = i < step;
              return (
                <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                  <div 
                    className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition-all duration-300 ${
                      active ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.8)] scale-110" :
                      passed ? "bg-cyan-900 text-cyan-400 border border-cyan-500/50" :
                      "bg-card border border-border/50 text-muted-foreground"
                    }`}
                  >
                    {passed ? <Check className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold ${active ? "text-cyan-400" : passed ? "text-cyan-600" : "text-muted-foreground"}`}>{s}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
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
              <section className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <h2 className="font-display text-lg font-semibold text-foreground">Dados de entrega</h2>
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

                <div className="mt-6 pt-6 border-t border-border/50">
                  <h3 className="text-sm font-semibold mb-3">Opções de Frete (Integrações)</h3>
                  <div className="space-y-3">
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-cyan-400/50 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-900/20 has-[:checked]:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="frete" defaultChecked className="h-4 w-4 text-cyan-500 accent-cyan-500" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Loggi Express</p>
                          <p className="text-xs text-muted-foreground">Entrega em 1 a 2 dias úteis</p>
                        </div>
                      </div>
                      <span className="font-bold text-success">{shippingCost === 0 ? "Grátis" : "R$ 15,90"}</span>
                    </label>
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-cyan-400/50 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-900/20 has-[:checked]:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="frete" className="h-4 w-4 text-cyan-500 accent-cyan-500" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Correios Sedex</p>
                          <p className="text-xs text-muted-foreground">Entrega em até 5 dias úteis</p>
                        </div>
                      </div>
                      <span className="font-bold text-foreground">{shippingCost === 0 ? "R$ 9,90" : "R$ 24,90"}</span>
                    </label>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 bg-cyan-500 text-white hover:bg-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                    onClick={() =>
                      cep && address ? setStep(2) : void toast.error("Informe CEP e endereço.")
                    }
                  >
                    Continuar para Pagamento
                  </Button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                <h2 className="font-display text-lg font-semibold text-foreground">Método de Pagamento</h2>
                <RadioGroup value={payment} onValueChange={setPayment} className="mt-4 space-y-3">
                  {paymentConfig.pixEnabled && (
                    <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-cyan-400/50 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-900/20 has-[:checked]:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                      <RadioGroupItem value="pix" id="pix" className="text-cyan-500" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-emerald-400" /> Pix Instantâneo
                        </p>
                        <p className="text-xs text-emerald-500 font-medium">12% de desconto no valor total</p>
                      </div>
                    </label>
                  )}
                  {paymentConfig.cardEnabled && (
                    <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-cyan-400/50 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-900/20 has-[:checked]:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                      <RadioGroupItem value="cartao" id="cartao" className="text-cyan-500" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-cyan-400" /> Cartão de Crédito
                        </p>
                        <p className="text-xs text-muted-foreground">Em até 10x sem juros</p>
                      </div>
                    </label>
                  )}
                  <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-cyan-400/50 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-900/20 has-[:checked]:shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                    <RadioGroupItem value="boleto" id="boleto" className="text-cyan-500" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" /> Boleto Bancário
                      </p>
                      <p className="text-xs text-muted-foreground">Vencimento em 3 dias úteis</p>
                    </div>
                  </label>
                </RadioGroup>
                
                {payment === "cartao" && (
                  <div className="mt-4 p-4 rounded-xl bg-background/50 border border-border/50 space-y-3">
                    <Input placeholder="Número do Cartão" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="MM/AA" />
                      <Input placeholder="CVC" />
                    </div>
                    <Input placeholder="Nome impresso no cartão" />
                  </div>
                )}

                <div className="mt-5 flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button className="flex-1 bg-cyan-500 text-white hover:bg-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]" onClick={() => setStep(3)}>
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
                  Após a confirmação, você fará o pagamento na próxima tela e o gestor validará o pedido e emitirá a nota fiscal.
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
              <div className="flex gap-2">
                <Input 
                  placeholder="Cupom de desconto" 
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  disabled={!!appliedCoupon}
                />
                <Button 
                  variant={appliedCoupon ? "destructive" : "secondary"}
                  onClick={() => appliedCoupon ? setAppliedCoupon(null) : handleApplyCoupon()}
                >
                  {appliedCoupon ? "Remover" : "Aplicar"}
                </Button>
              </div>
              
              <div className="pt-2 space-y-2">
                <Row label="Subtotal" value={brl(cartTotal)} />
                <Row label="Frete" value={shipping === 0 ? "Grátis" : brl(shipping)} />
                {pixDiscount > 0 && <Row label="Desconto Pix (12%)" value={`- ${brl(pixDiscount)}`} />}
                {appliedCoupon && <Row label={`Cupom (${appliedCoupon.code})`} value={`- ${brl(couponDiscount)}`} />}
                <div className="flex items-center justify-between pt-2 font-display text-lg font-bold">
                  <span>Total</span>
                  <span>{brl(total)}</span>
                </div>
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
