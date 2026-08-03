import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Login do gestor — Painel Orion Store" },
      {
        name: "description",
        content:
          "Acesso restrito ao painel administrativo da Orion Store: gestão de produtos, pedidos e métricas de vendas.",
      },
      { property: "og:title", content: "Login do gestor — Painel Orion Store" },
      {
        property: "og:description",
        content: "Área restrita para administração da loja Orion.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { login, isAdmin } = useShop();
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate({ to: "/admin/dashboard", replace: true });
  }, [isAdmin, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(user, pass)) {
      navigate({ to: "/admin/dashboard" });
    } else {
      setError(true);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
            O
          </span>
          <span className="font-display text-lg font-bold">
            Orion<span className="text-brand">.</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-brand">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Acesso restrito</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold">Área do gestor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com suas credenciais administrativas para acessar o painel.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                value={user}
                onChange={(e) => {
                  setUser(e.target.value);
                  setError(false);
                }}
                placeholder="Seu usuário"
                className="mt-1.5"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha</Label>
              <div className="relative mt-1.5">
                <Input
                  id="senha"
                  type={show ? "text" : "password"}
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                    setError(false);
                  }}
                  placeholder="Sua senha"
                  className="pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Login ou senha incorretos. Tente novamente.
              </p>
            )}

            <Button type="submit" size="lg" className="w-full">
              Entrar no painel
            </Button>
          </form>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Sessão protegida e monitorada
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 block text-center text-sm text-muted-foreground hover:text-brand"
        >
          ← Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
