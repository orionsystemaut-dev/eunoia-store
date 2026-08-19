import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brl, type Product } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useShop();
  const out = product.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] dark:hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none z-10" />
      <Link
        to="/produto/$id"
        params={{ id: product.id }}
        className="relative block overflow-hidden bg-secondary"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
              Lançamento
            </span>
          )}
          {product.oldPrice && (
            <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-brand-foreground">
              -{Math.round((1 - product.price / product.oldPrice) * 100)}%
            </span>
          )}
          {out && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              Esgotado
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          {product.rating.toFixed(1)}
        </div>
        <Link
          to="/produto/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-sm font-medium leading-snug hover:text-brand"
        >
          {product.name}
        </Link>
        <div className="mt-auto pt-2">
          {product.oldPrice && (
            <p className="text-xs text-muted-foreground line-through">{brl(product.oldPrice)}</p>
          )}
          <p className="font-display text-lg font-bold">{brl(product.price)}</p>
          <p className="text-xs text-muted-foreground">
            em até 10x de {brl(product.price / 10)} sem juros
          </p>
        </div>
        <Button
          className="mt-3 w-full"
          variant={out ? "secondary" : "default"}
          disabled={out}
          onClick={() => addToCart(product, product.variants[0] ?? "Único", 1)}
        >
          {out ? "Indisponível" : "Adicionar"}
        </Button>
      </div>
    </article>
  );
}
