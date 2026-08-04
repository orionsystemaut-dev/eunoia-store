import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, QrCode } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/pagamentos")({
  head: () => ({
    meta: [
      { title: "Pagamentos — Painel Orion Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPagamentos,
});

function AdminPagamentos() {
  const { paymentConfig, updatePaymentConfig } = useShop();
  
  const [pixEnabled, setPixEnabled] = useState(paymentConfig.pixEnabled);
  const [pixKey, setPixKey] = useState(paymentConfig.pixKey);
  
  const [cardEnabled, setCardEnabled] = useState(paymentConfig.cardEnabled);
  const [gatewayKey, setGatewayKey] = useState(paymentConfig.gatewayKey);

  const handleSave = () => {
    updatePaymentConfig({
      pixEnabled,
      pixKey,
      cardEnabled,
      gatewayKey,
    });
    toast.success("Configurações de pagamento salvas com sucesso!");
  };

  return (
    <AdminShell title="Métodos de Pagamento">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">PIX</h2>
                <p className="text-sm text-muted-foreground">Pagamento instantâneo via chave PIX</p>
              </div>
            </div>
            <Switch checked={pixEnabled} onCheckedChange={setPixEnabled} />
          </div>
          {pixEnabled && (
            <div className="mt-5 space-y-3 border-t border-border pt-5">
              <div className="space-y-1">
                <Label>Chave PIX</Label>
                <Input value={pixKey} onChange={e => setPixKey(e.target.value)} />
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Cartão de Crédito / Débito</h2>
                <p className="text-sm text-muted-foreground">Gateway de pagamento (ex: Stripe, Pagar.me)</p>
              </div>
            </div>
            <Switch checked={cardEnabled} onCheckedChange={setCardEnabled} />
          </div>
          {cardEnabled && (
            <div className="mt-5 space-y-3 border-t border-border pt-5">
              <div className="space-y-1">
                <Label>Chave da API (Public Key)</Label>
                <Input value={gatewayKey} onChange={e => setGatewayKey(e.target.value)} />
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar Configurações</Button>
        </div>
      </div>
    </AdminShell>
  );
}
