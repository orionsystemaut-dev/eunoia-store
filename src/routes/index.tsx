import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgePercent, Headphones, RefreshCcw, Truck } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { StoreShell } from "@/components/shop/StoreShell";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";
import { CATEGORIES } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orion Store — Tecnologia, wearables e calçados com frete grátis" },
      {
        name: "description",
        content:
          "Loja online Orion: headphones, smartwatches, tênis e acessórios com preços especiais, parcelamento em 10x e entrega rastreada para todo o Brasil.",
      },
      { property: "og:title", content: "Orion Store — Tecnologia e design para o dia a dia" },
      {
        property: "og:description",
        content: "Ofertas em áudio, wearables, calçados e acessórios. Frete grátis acima de R$ 299.",
      },
    ],
  }),
  component: Home,
});


function Home() {
  const { products, siteConfig } = useShop();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const news = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <StoreShell>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              {siteConfig.heroTag}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              {siteConfig.heroTitle}
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              {siteConfig.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/catalogo" search={{ q: "", categoria: "todas", ordem: "relevancia" }}>
                <Button size="lg" className="gap-2">
                  Comprar agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/catalogo" search={{ q: "", categoria: "audio", ordem: "menor-preco" }}>
                <Button size="lg" variant="outline">
                  Ver ofertas
                </Button>
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-lift)]">
            <img
              src={heroImg}
              alt="Headphone, tênis e smartwatch da coleção Orion sobre fundo bege"
              width={1600}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {siteConfig.perks.map((p, i) => {
          const Icon = [Truck, RefreshCcw, BadgePercent, Headphones][i];
          return (
            <div
              key={p.title + i}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              {Icon && <Icon className="h-5 w-5 shrink-0 text-brand" />}
              <div className="min-w-0">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.text}</p>
              </div>
            </div>
          );
        })}
      </section>

      <Section
        title={siteConfig.featuredTitle}
        subtitle={siteConfig.featuredSubtitle}
        items={featured}
      />

      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{siteConfig.categoriesTitle}</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/catalogo"
              search={{ q: "", categoria: c.slug, ordem: "relevancia" }}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-[var(--shadow-card)]"
            >
              <span className="text-3xl">{c.emoji}</span>
              <p className="mt-4 font-display text-lg font-semibold">{c.name}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-brand">
                Explorar <ArrowRight className="h-3 w-3" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <Section
        title={siteConfig.newTitle}
        subtitle={siteConfig.newSubtitle}
        items={news}
      />
    </StoreShell>
  );
}

function Section({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: ReturnType<typeof useShop>["products"];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          to="/catalogo"
          search={{ q: "", categoria: "todas", ordem: "relevancia" }}
          className="shrink-0 text-sm font-medium text-brand hover:underline"
        >
          Ver todos
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
