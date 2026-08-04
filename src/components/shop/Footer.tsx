import { Link } from "@tanstack/react-router";
import { CreditCard, Lock, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";

import { useShop } from "@/lib/shop-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Footer() {
  const { siteConfig, categories } = useShop();
  
  const [modalContent, setModalContent] = useState<{title: string, content: string} | null>(null);

  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            {siteConfig.logoUrl ? (
              <img src={siteConfig.logoUrl} alt={siteConfig.storeName} className="h-8 w-auto object-contain grayscale opacity-70" />
            ) : (
              <>
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-sm font-bold text-primary-foreground">
                  {siteConfig.storeName.charAt(0)}
                </div>
                <span className="font-display text-xl font-bold tracking-tight">
                  {siteConfig.storeName}<span className="text-brand">.</span>
                </span>
              </>
            )}
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {siteConfig.footerDescription}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Categorias</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/catalogo"
                  search={{ q: "", categoria: c.slug, ordem: "relevancia" }}
                  className="hover:text-brand"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Ajuda</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {siteConfig.footerLinks?.map(link => (
              <li key={link.id}>
                {link.actionType === "link" ? (
                  <Link to={link.url || "/"} className="hover:text-brand">
                    {link.label}
                  </Link>
                ) : (
                  <button 
                    onClick={() => setModalContent({ title: link.label, content: link.modalContent || "" })}
                    className="hover:text-brand text-left"
                  >
                    {link.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Compra segura</p>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" /> Site protegido SSL
            </li>
            <li className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-success" /> Dados criptografados
            </li>
            <li className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-success" /> Pix, boleto e cartão
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-success" /> Entrega rastreada
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.storeName} · CNPJ 00.000.000/0001-00 · Todos os direitos
        reservados
      </div>

      <Dialog open={!!modalContent} onOpenChange={(v) => !v && setModalContent(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="pt-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {modalContent?.content}
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
