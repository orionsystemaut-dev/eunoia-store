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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8 relative">
        <div className="flex items-center gap-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" aria-label="Abrir menu">
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

            <Link to="/" className="flex items-center gap-3 font-display text-3xl font-medium tracking-wide group">
              {siteConfig.logoUrl ? (
                <img 
                  src={siteConfig.logoUrl} 
                  alt={siteConfig.storeName} 
                  className="h-8 w-auto object-contain mix-blend-multiply dark:mix-blend-screen drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                />
              ) : (
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500 group-hover:from-white group-hover:to-gray-300 transition-all duration-500" style={{ textShadow: '0 0 15px rgba(56, 189, 248, 0.5), 0 0 30px rgba(56, 189, 248, 0.3)' }}>
                  Órion
                  <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/0 via-cyan-400/30 to-cyan-500/0 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 rounded-full" />
                </span>
              )}
            </Link>
        </div>

        {/* Centered Search Bar */}
        <form onSubmit={submit} className="absolute left-1/2 -translate-x-1/2 hidden md:block w-72 lg:w-[28rem] transition-all focus-within:w-80 lg:focus-within:w-[32rem]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar..."
            className="h-11 rounded-full border-border/50 bg-secondary/50 backdrop-blur-sm pl-12 pr-4 hover:border-cyan-400/40 focus-visible:border-cyan-400/60 focus-visible:ring-1 focus-visible:ring-cyan-400/50 transition-all text-sm"
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

      <nav className="hidden border-t border-border/60 lg:block relative z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-12 px-8 text-sm relative">
          <Link
            to="/catalogo"
            search={{ q: "", categoria: "todas", ordem: "relevancia" }}
            className="font-medium text-muted-foreground transition-colors hover:text-brand py-3"
          >
            Todos os produtos
          </Link>
          
          <div className="group relative py-3 cursor-pointer">
            <span className="text-muted-foreground transition-colors group-hover:text-cyan-400 font-medium">Categorias</span>
            
            {/* Mega Menu Dropdown */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[500px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              <div className="absolute -top-4 left-0 w-full h-6 bg-transparent" /> {/* Invisible hover bridge */}
              <div className="rounded-2xl border border-white/10 bg-black/95 backdrop-blur-3xl p-6 shadow-[0_30px_80px_-15px_rgba(0,0,0,1)] overflow-hidden relative">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 grid grid-cols-2 gap-4">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      to="/catalogo"
                      search={{ q: "", categoria: c.slug, ordem: "relevancia" }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group/item"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 text-lg group-hover/item:bg-cyan-500/20 group-hover/item:text-cyan-400 transition-colors">
                        {c.emoji}
                      </div>
                      <span className="font-semibold text-gray-200 group-hover/item:text-white">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <Link
            to="/catalogo"
            search={{ q: "", categoria: "todas", ordem: "relevancia" }}
            className="text-muted-foreground transition-colors hover:text-brand py-3"
          >
            Ofertas
          </Link>
          
          <span className="absolute right-8 text-xs font-medium text-brand">
            {siteConfig.promoBar}
          </span>
        </div>
      </nav>
    </header>
  );
}
