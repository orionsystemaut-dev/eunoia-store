import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { LayoutDashboard, LogOut, Package, ReceiptText, Store, CreditCard, MonitorPlay, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop-store";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
  { to: "/admin/editor", label: "Editor do Site", icon: MonitorPlay },
] as const;

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const { isAdmin, logout } = useShop();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/admin", replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface text-sm text-muted-foreground">
        Redirecionando para o login...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <aside className="flex shrink-0 flex-col gap-1 border-b border-border bg-card px-4 py-4 lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="flex items-center gap-2 pb-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
            O
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold">Orion Admin</p>
            <p className="truncate text-xs text-muted-foreground">Gestor: ORION</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden gap-2 pt-6 lg:flex lg:flex-col">
          <Link to="/">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Store className="h-4 w-4" /> Ver loja
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2"
            onClick={() => {
              logout();
              navigate({ to: "/admin", replace: true });
            }}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-4 lg:px-8">
          <h1 className="min-w-0 truncate font-display text-xl font-bold lg:text-2xl">{title}</h1>
          <div className="flex shrink-0 gap-2 lg:hidden">
            <Link to="/">
              <Button variant="outline" size="sm">
                Loja
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate({ to: "/admin", replace: true });
              }}
            >
              Sair
            </Button>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
