import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useShop } from "@/lib/shop-store";

export function Header() {
  const { cartCount, setCartOpen, isAdmin, customer, siteConfig, categories } = useShop();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/catalogo", search: { q, categoria: "todas", ordem: "relevancia" } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:gap-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <p className="font-display text-lg font-semibold">Categorias</p>
              <nav className="mt-4 flex flex-col gap-1">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    to="/catalogo"
                    search={{ q: "", categoria: c.slug, ordem: "relevancia" }}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                  >
                    {c.emoji} {c.name}
                  </Link>
                ))}
                <Link
                  to="/catalogo"
                  search={{ q: "", categoria: "todas", ordem: "relevancia" }}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                >
                  Ver tudo
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
              O
            </span>
            <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
              Orion<span className="text-brand">.</span>
            </span>
          </Link>
        </div>

        <form onSubmit={submit} className="relative hidden min-w-0 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produtos, marcas e categorias"
            className="h-11 rounded-full border-border bg-secondary pl-10"
            aria-label="Buscar produtos"
          />
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link to="/conta">
            <Button variant="ghost" size="sm" className="gap-2">
              <UserRound className="h-4 w-4" />
              <span className="hidden max-w-[120px] truncate sm:inline">
                {customer ? customer.name.split(" ")[0] : "Minha conta"}
              </span>
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Painel
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Abrir carrinho"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-semibold text-brand-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <nav className="hidden border-t border-border/60 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-8 py-2.5 text-sm">
          <Link
            to="/catalogo"
            search={{ q: "", categoria: "todas", ordem: "relevancia" }}
            className="font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            Todos os produtos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/catalogo"
              search={{ q: "", categoria: c.slug, ordem: "relevancia" }}
              className="text-muted-foreground transition-colors hover:text-brand"
            >
              {c.name}
            </Link>
          ))}
          <span className="ml-auto text-xs font-medium text-brand">
            {siteConfig.promoBar}
          </span>
        </div>
      </nav>
    </header>
  );
}
