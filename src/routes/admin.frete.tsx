import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Truck } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/frete")({
  head: () => ({
    meta: [
      { title: "Frete e Entrega — Painel Orion Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminFrete,
});

function AdminFrete() {
  const { shippingConfig, updateShippingConfig } = useShop();
  
  const [fixedRate, setFixedRate] = useState(shippingConfig.fixedRate.toString());
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(shippingConfig.freeShippingThreshold.toString());

  const handleSave = () => {
    const parsedRate = parseFloat(fixedRate.replace(",", "."));
    const parsedThreshold = parseFloat(freeShippingThreshold.replace(",", "."));

    if (isNaN(parsedRate) || isNaN(parsedThreshold)) {
      toast.error("Valores inválidos. Use apenas números e vírgula/ponto.");
      return;
    }

    updateShippingConfig({
      fixedRate: parsedRate,
      freeShippingThreshold: parsedThreshold,
    });
    toast.success("Configurações de frete salvas com sucesso!");
  };

  return (
    <AdminShell title="Frete e Entrega">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">Configurações de Frete</h2>
              <p className="text-sm text-muted-foreground">Regras globais de entrega da loja</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Valor do Frete Fixo (R$)</Label>
              <Input 
                value={fixedRate} 
                onChange={e => setFixedRate(e.target.value)} 
                placeholder="Ex: 24.90"
              />
              <p className="text-xs text-muted-foreground">Custo padrão cobrado por entrega.</p>
            </div>
            
            <div className="space-y-1 mt-4">
              <Label>Valor Mínimo para Frete Grátis (R$)</Label>
              <Input 
                value={freeShippingThreshold} 
                onChange={e => setFreeShippingThreshold(e.target.value)} 
                placeholder="Ex: 299.00"
              />
              <p className="text-xs text-muted-foreground">Pedidos com subtotal igual ou maior que este valor terão frete isento.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </div>
    </AdminShell>
  );
}
