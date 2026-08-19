import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, UserRound, KeyRound, Clock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { brl, type Customer } from "@/lib/shop-data";
import { statusTone } from "@/lib/order-flow";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/clientes")({
  head: () => ({
    meta: [
      { title: "Gestão de Clientes — Painel Orion Store" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const { customers, orders, resetCustomerPassword } = useShop();
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showMasked, setShowMasked] = useState(false);
  const [sending, setSending] = useState(false);

  const customerOrders = selected 
    ? orders.filter(o => o.email?.toLowerCase() === selected.email || o.customer === selected.name)
    : [];

  const handleReset = async () => {
    if (!selected) return;
    setSending(true);
    const res = await resetCustomerPassword(selected.id);
    setSending(false);
    if (!res.ok) {
      toast.error(res.error ?? "Não foi possível enviar o link.");
      return;
    }
    toast.success("Link de redefinição enviado para o e-mail do cliente.");
  };


  const maskDoc = (doc: string) => showMasked ? doc : `***.${doc.slice(4, 7)}.***-**`;
  const maskPhone = (phone: string) => showMasked ? phone : `(**) *****-${phone.slice(-4)}`;

  return (
    <AdminShell title="Clientes (LGPD)">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-border bg-brand/5 p-4 text-brand">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Ambiente Seguro e Criptografado</p>
            <p className="opacity-90">Os dados pessoais exibidos aqui estão criptografados de ponta a ponta no banco de dados.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {c.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <p>{c.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelected(c)}>
                    Ver Detalhes
                  </Button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) { setSelected(null); setShowMasked(false); }}}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between font-display text-xl pr-6">
              Detalhes do Cliente
              <Button variant="ghost" size="sm" onClick={() => setShowMasked(!showMasked)} className="gap-2 text-muted-foreground h-8">
                {showMasked ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showMasked ? "Ocultar Dados" : "Revelar Dados"}
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selected && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-border p-4 bg-muted/30">
                <Info label="Nome Completo" value={selected.name} />
                <Info label="E-mail" value={selected.email} />
                <Info label="CPF" value={maskDoc(selected.doc)} />
                <Info label="Telefone" value={maskPhone(selected.phone)} />
                <Info label="Endereço" value={selected.address} />
                <Info label="CEP" value={selected.cep} />
              </div>

              <div className="rounded-xl border border-border p-4 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Segurança da Conta
                  </h3>
                  <Button variant="secondary" size="sm" disabled={sending} onClick={handleReset}>
                    {sending ? "Enviando..." : "Enviar link de redefinição"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  As senhas ficam sob custódia do serviço de autenticação e nunca são visíveis.
                  Ao enviar o link, o cliente recebe um e-mail seguro para criar uma nova senha.
                </p>
              </div>


              <div>
                <h3 className="font-semibold mb-3">Histórico de Compras ({customerOrders.length})</h3>
                <div className="space-y-2">
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Este cliente ainda não realizou compras.</p>
                  ) : (
                    customerOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                        <div>
                          <p className="font-medium">{o.id}</p>
                          <p className="text-xs text-muted-foreground">{o.date} · {o.items} itens</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={statusTone[o.status]}>{o.status}</Badge>
                          <span className="font-semibold">{brl(o.total)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}
