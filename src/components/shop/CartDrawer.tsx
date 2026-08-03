import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { brl } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, cartTotal, updateQty, removeFromCart } = useShop();
  const freeShipping = cartTotal >= 299;

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display">
            <ShoppingBag className="h-5 w-5" /> Seu carrinho
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            <Link to="/catalogo" search={{ q: "", categoria: "todas", ordem: "relevancia" }}>
              <Button onClick={() => setCartOpen(false)}>Explorar produtos</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variant}`} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    width={800}
                    height={800}
                    className="h-20 w-20 shrink-0 rounded-xl border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Variação: {item.variant}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          aria-label="Diminuir"
                          className="grid h-7 w-7 place-items-center"
                          onClick={() => updateQty(item.productId, item.variant, item.qty - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.qty}</span>
                        <button
                          aria-label="Aumentar"
                          className="grid h-7 w-7 place-items-center"
                          onClick={() => updateQty(item.productId, item.variant, item.qty + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="ml-auto text-sm font-semibold">
                        {brl(item.price * item.qty)}
                      </span>
                      <button
                        aria-label="Remover item"
                        onClick={() => removeFromCart(item.productId, item.variant)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border px-5 py-4">
              <p className="text-xs text-muted-foreground">
                {freeShipping
                  ? "🎉 Você ganhou frete grátis!"
                  : `Faltam ${brl(299 - cartTotal)} para frete grátis`}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl font-bold">{brl(cartTotal)}</span>
              </div>
              <Link to="/checkout" className="block">
                <Button className="w-full" size="lg" onClick={() => setCartOpen(false)}>
                  Finalizar compra
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
