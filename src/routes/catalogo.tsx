import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { StoreShell } from "@/components/shop/StoreShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl, CATEGORIES } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";

type CatalogSearch = { q: string; categoria: string; ordem: string };

export const Route = createFileRoute("/catalogo")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    categoria: typeof search["categoria"] === "string" ? search["categoria"] : "todas",
    ordem: typeof search["ordem"] === "string" ? search["ordem"] : "relevancia",
  }),

  head: () => ({
    meta: [
      { title: "Catálogo de produtos — Orion Store" },
      {
        name: "description",
        content:
          "Filtre por categoria, faixa de preço e ordenação para encontrar headphones, smartwatches, tênis e acessórios na Orion Store.",
      },
      { property: "og:title", content: "Catálogo de produtos — Orion Store" },
      {
        property: "og:description",
        content: "Todos os produtos Orion com filtros de preço, categoria e ordenação.",
      },
    ],
  }),
  component: Catalog,
});

function Catalog() {
  const { products } = useShop();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [maxPrice, setMaxPrice] = useState(2000);
  const [term, setTerm] = useState(search.q);
  const [showFilters, setShowFilters] = useState(false);

  const list = useMemo(() => {
    const filtered = products.filter(
      (p) =>
        (search.categoria === "todas" || p.category === search.categoria) &&
        p.price <= maxPrice &&
        p.name.toLowerCase().includes(term.trim().toLowerCase()),
    );
    const sorted = [...filtered];
    if (search.ordem === "menor-preco") sorted.sort((a, b) => a.price - b.price);
    if (search.ordem === "maior-preco") sorted.sort((a, b) => b.price - a.price);
    if (search.ordem === "avaliacao") sorted.sort((a, b) => b.rating - a.rating);
    if (search.ordem === "novidades")
      sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
    return sorted;
  }, [products, search.categoria, search.ordem, maxPrice, term]);

  const setParam = (patch: Partial<CatalogSearch>) =>
    navigate({ search: (prev: CatalogSearch) => ({ ...prev, ...patch }) });


  return (
    <StoreShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-brand">
            Início
          </Link>{" "}
          / Catálogo
        </nav>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h1 className="min-w-0 font-display text-2xl font-bold sm:text-3xl">
            {search.categoria === "todas"
              ? "Todos os produtos"
              : (CATEGORIES.find((c) => c.slug === search.categoria)?.name ?? "Catálogo")}
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 lg:hidden"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </Button>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className={`${showFilters ? "block" : "hidden"} space-y-6 lg:block`}>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Buscar</p>
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Nome do produto"
                className="mt-3"
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Categoria</p>
              <div className="mt-3 space-y-1">
                {[{ slug: "todas", name: "Todas" }, ...CATEGORIES].map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setParam({ categoria: c.slug })}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      search.categoria === c.slug
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Preço máximo</p>
              <Slider
                className="mt-5"
                value={[maxPrice]}
                min={100}
                max={2000}
                step={50}
                onValueChange={(v) => setMaxPrice(v[0] ?? 2000)}
              />
              <p className="mt-3 text-sm text-muted-foreground">até {brl(maxPrice)}</p>
            </div>
          </aside>

          <div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <p className="min-w-0 text-sm text-muted-foreground">
                {list.length} produto{list.length === 1 ? "" : "s"} encontrado
                {list.length === 1 ? "" : "s"}
              </p>
              <Select value={search.ordem} onValueChange={(v) => setParam({ ordem: v })}>
                <SelectTrigger className="w-[180px] shrink-0">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevancia">Relevância</SelectItem>
                  <SelectItem value="menor-preco">Menor preço</SelectItem>
                  <SelectItem value="maior-preco">Maior preço</SelectItem>
                  <SelectItem value="avaliacao">Melhor avaliados</SelectItem>
                  <SelectItem value="novidades">Novidades</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {list.length === 0 ? (
              <p className="mt-16 text-center text-sm text-muted-foreground">
                Nenhum produto encontrado com esses filtros.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-3">
                {list.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
