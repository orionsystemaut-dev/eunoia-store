import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { StoreShell } from "@/components/shop/StoreShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brl } from "@/lib/shop-data";
import { statusTone } from "@/lib/order-flow";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Orion Store" },
      {
        name: "description",
        content:
          "Crie seu cadastro na Orion Store, acompanhe seus pedidos e acesse as notas fiscais das suas compras.",
      },
      { property: "og:title", content: "Minha conta — Orion Store" },
      { property: "og:description", content: "Cadastro, pedidos e notas fiscais da Orion Store." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const { customer, orders, registerCustomer, loginCustomer, logoutCustomer } = useShop();
  const [mode, setMode] = useState<"cadastro" | "login">("cadastro");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    doc: "",
    phone: "",
    cep: "",
    address: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (mode === "login") {
      const res = loginCustomer(form.email, form.password);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Login realizado!");
      return;
    }
    if (!form.name || !form.email || !form.password || !form.doc) {
      toast.error("Preencha nome, e-mail, senha e CPF.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    const res = registerCustomer(form);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Cadastro criado!");
  };

  if (!customer) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-md px-4 py-14">
          <h1 className="font-display text-3xl font-bold">
            {mode === "cadastro" ? "Criar cadastro" : "Entrar na conta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acompanhe seus pedidos passo a passo e receba suas notas fiscais.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
            {mode === "cadastro" && (
              <Field label="Nome completo" value={form.name} onChange={set("name")} />
            )}
            <Field label="E-mail" type="email" value={form.email} onChange={set("email")} />
            <Field label="Senha" type="password" value={form.password} onChange={set("password")} />
            {mode === "cadastro" && (
              <>
                <Field label="CPF" value={form.doc} onChange={set("doc")} />
                <Field label="Telefone" value={form.phone} onChange={set("phone")} />
                <Field label="CEP" value={form.cep} onChange={set("cep")} />
                <Field label="Endereço" value={form.address} onChange={set("address")} />
              </>
            )}
            <Button type="submit" className="w-full">
              {mode === "cadastro" ? "Criar conta" : "Entrar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setMode(mode === "cadastro" ? "login" : "cadastro")}
            >
              {mode === "cadastro" ? "Já tenho conta" : "Quero me cadastrar"}
            </Button>
          </form>
        </div>
      </StoreShell>
    );
  }

  const myOrders = orders.filter(
    (o) => o.email?.toLowerCase() === customer.email || o.customer === customer.name,
  );

  return (
    <StoreShell>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">Olá, {customer.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
          <Button variant="outline" onClick={logoutCustomer}>
            Sair
          </Button>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <Info label="CPF" value={customer.doc} />
          <Info label="Telefone" value={customer.phone} />
          <Info label="CEP" value={customer.cep} />
          <Info label="Endereço" value={customer.address} />
        </section>

        <h2 className="mt-10 font-display text-xl font-bold">Meus pedidos</h2>
        <div className="mt-4 space-y-3">
          {myOrders.length === 0 && (
            <p className="text-sm text-muted-foreground">Você ainda não tem pedidos.</p>
          )}
          {myOrders.map((o) => (
            <Link
              key={o.id}
              to="/pedido/$id"
              params={{ id: o.id.replace("#", "") }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 hover:border-brand/40"
            >
              <div>
                <p className="font-medium">{o.id}</p>
                <p className="text-xs text-muted-foreground">
                  {o.date} · {o.items} item(s) {o.invoice ? `· NF ${o.invoice.number}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={statusTone[o.status]}>
                  {o.status}
                </Badge>
                <span className="font-semibold">{brl(o.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </StoreShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={onChange} className="mt-1.5" />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
