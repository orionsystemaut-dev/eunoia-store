import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgePercent, Headphones, RefreshCcw, Truck } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { StoreShell } from "@/components/shop/StoreShell";
import { Button } from "@/components/ui/button";
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
  const { products, siteConfig, categories } = useShop();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const news = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <StoreShell>
      <section className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden border-b border-border bg-black">
        {/* Animated Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        >
          <source src="/showcase.mp4" type="video/mp4" />
        </video>

        {/* Gradient Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Glassmorphism Content Box */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-3xl border border-white/20 bg-black/20 p-8 backdrop-blur-md shadow-2xl sm:p-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {siteConfig.heroTag || "Lançamento Oficial"}
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] text-white drop-shadow-md sm:text-5xl lg:text-7xl">
              {siteConfig.heroTitle}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-200 drop-shadow">
              {siteConfig.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/catalogo" search={{ q: "", categoria: "todas", ordem: "relevancia" }}>
                <Button size="lg" className="h-14 gap-2 rounded-full bg-white px-8 text-base text-black shadow-lg hover:scale-105 hover:bg-gray-100 transition-all">
                  Comprar agora <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/catalogo" search={{ q: "", categoria: "audio", ordem: "menor-preco" }}>
                <Button size="lg" variant="outline" className="h-14 rounded-full border-white/40 bg-black/30 px-8 text-base text-white backdrop-blur-sm shadow-lg hover:scale-105 hover:bg-black/50 transition-all">
                  Ver ofertas
                </Button>
              </Link>
            </div>
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
          {categories.map((c) => (
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
