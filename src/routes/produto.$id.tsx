import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";

import { ProductCard } from "@/components/shop/ProductCard";
import { StoreShell } from "@/components/shop/StoreShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { brl } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/produto/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do produto — Orion Store" },
      {
        name: "description",
        content:
          "Veja galeria de imagens, variações disponíveis, simulação de frete por CEP e adicione o produto ao carrinho na Orion Store.",
      },
      { property: "og:title", content: "Detalhes do produto — Orion Store" },
      {
        property: "og:description",
        content: "Galeria, variações, simulação de frete e compra segura na Orion Store.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { products, addToCart } = useShop();
  const product = products.find((p) => p.id === id);

  const [imgIndex, setImgIndex] = useState(0);
  const [variant, setVariant] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [cep, setCep] = useState("");
  const [shipping, setShipping] = useState<{ label: string; price: number; eta: string }[] | null>(
    null,
  );

  if (!product) {
    return (
      <StoreShell>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Produto não encontrado</h1>
          <Link
            to="/catalogo"
            search={{ q: "", categoria: "todas", ordem: "relevancia" }}
            className="mt-4 inline-block text-sm text-brand hover:underline"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </StoreShell>
    );
  }

  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const selected = variant ?? product.variants[0] ?? "Único";
  const related = products.filter((p) => p.category === product.category && p.id !== product.id);

  const simulate = () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      toast.error("Informe um CEP válido com 8 dígitos.");
      return;
    }
    const base = (Number(digits.slice(-2)) % 30) + 9;
    setShipping([
      { label: "Econômica", price: product.price >= 299 ? 0 : base, eta: "6 a 9 dias úteis" },
      { label: "Padrão", price: base + 12.9, eta: "3 a 5 dias úteis" },
      { label: "Expressa", price: base + 29.9, eta: "1 dia útil" },
    ]);
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-brand">
            Início
          </Link>{" "}
          /{" "}
          <Link
            to="/catalogo"
            search={{ q: "", categoria: product.category, ordem: "relevancia" }}
            className="hover:text-brand"
          >
            Catálogo
          </Link>{" "}
          / <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-3xl border border-border bg-secondary">
              <img
                src={gallery[imgIndex]}
                alt={product.name}
                width={800}
                height={800}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-3 flex gap-3">
              {gallery.map((g, i) => (
                <button
                  key={`${g}-${i}`}
                  onClick={() => setImgIndex(i)}
                  className={`overflow-hidden rounded-xl border-2 transition-colors ${
                    i === imgIndex ? "border-brand" : "border-border"
                  }`}
                  aria-label={`Imagem ${i + 1}`}
                >
                  <img
                    src={g}
                    alt=""
                    loading="lazy"
                    width={800}
                    height={800}
                    className="h-20 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {product.rating.toFixed(1)} · {product.stock > 0 ? "Em estoque" : "Esgotado"}
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-6">
              {product.oldPrice && (
                <p className="text-sm text-muted-foreground line-through">{brl(product.oldPrice)}</p>
              )}
              <p className="font-display text-4xl font-bold">{brl(product.price)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                10x de {brl(product.price / 10)} sem juros · {brl(product.price * 0.88)} no Pix
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold">Variação</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVariant(v)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      selected === v
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-brand"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-border">
                <button
                  className="grid h-11 w-11 place-items-center"
                  aria-label="Diminuir quantidade"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button
                  className="grid h-11 w-11 place-items-center"
                  aria-label="Aumentar quantidade"
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1"
                disabled={product.stock <= 0}
                onClick={() => {
                  addToCart(product, selected, qty);
                  toast.success("Produto adicionado ao carrinho");
                }}
              >
                {product.stock > 0 ? "Adicionar ao carrinho" : "Produto indisponível"}
              </Button>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Truck className="h-4 w-4 text-brand" /> Simular frete e prazo
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  inputMode="numeric"
                  aria-label="CEP"
                />
                <Button variant="outline" onClick={simulate}>
                  Calcular
                </Button>
              </div>
              {shipping && (
                <ul className="mt-4 space-y-2 text-sm">
                  {shipping.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-center justify-between border-b border-border pb-2 last:border-0"
                    >
                      <span>
                        {s.label} · <span className="text-muted-foreground">{s.eta}</span>
                      </span>
                      <span className="font-semibold">
                        {s.price === 0 ? "Grátis" : brl(s.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" /> Compra 100% segura · 12 meses de
                garantia
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold">Você também pode gostar</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </StoreShell>
  );
}
