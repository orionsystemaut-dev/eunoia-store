import { Link } from "@tanstack/react-router";
import { CreditCard, Lock, ShieldCheck, Truck } from "lucide-react";


import { useShop } from "@/lib/shop-store";

export function Footer() {
  const { siteConfig, categories } = useShop();
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-xl font-bold">
            Orion<span className="text-brand">.</span>
          </p>
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
            <li>Central de atendimento</li>
            <li>Trocas e devoluções</li>
            <li>Prazos de entrega</li>
            <li>Política de privacidade</li>
            <li>
              <Link to="/admin" className="hover:text-brand">
                Área do gestor
              </Link>
            </li>
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
        © {new Date().getFullYear()} Orion Store · CNPJ 00.000.000/0001-00 · Todos os direitos
        reservados
      </div>
    </footer>
  );
}
