import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Ticket } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useShop } from "@/lib/shop-store";
import { brl, type Coupon } from "@/lib/shop-data";

export const Route = createFileRoute("/admin/cupons")({
  head: () => ({
    meta: [{ title: "Gestão de Cupons — Painel Orion Store" }],
  }),
  component: AdminCupons,
});

function AdminCupons() {
  const { coupons, saveCoupon, deleteCoupon } = useShop();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon>({
    code: "",
    discount: 0,
    type: "percent",
    isActive: true,
  });

  const openNew = () => {
    setEditingCoupon({
      code: "",
      discount: 0,
      type: "percent",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingCoupon.code) {
      toast.error("O código do cupom é obrigatório");
      return;
    }
    if (editingCoupon.discount <= 0) {
      toast.error("O valor de desconto deve ser maior que 0");
      return;
    }
    if (editingCoupon.type === "percent" && editingCoupon.discount > 100) {
      toast.error("Desconto em porcentagem não pode ser maior que 100");
      return;
    }
    
    saveCoupon({
      ...editingCoupon,
      code: editingCoupon.code.toUpperCase().replace(/\s+/g, ""),
    });
    
    toast.success("Cupom salvo com sucesso!");
    setIsModalOpen(false);
  };

  const handleDelete = (code: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cupom ${code}?`)) {
      deleteCoupon(code);
      toast.success("Cupom excluído com sucesso.");
    }
  };

  return (
    <AdminShell title="Cupons">
      <div className="flex justify-end mb-6">
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Cupom
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum cupom cadastrado.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.code} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-semibold text-brand">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {c.type === "percent" ? `${c.discount}%` : brl(c.discount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${c.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {c.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(c.code)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-brand" /> 
              {editingCoupon.code ? 'Editar Cupom' : 'Novo Cupom'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Código do Cupom</Label>
              <Input
                placeholder="Ex: PROMO20"
                value={editingCoupon.code}
                onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Desconto</Label>
                <Select
                  value={editingCoupon.type}
                  onValueChange={(v: "percent" | "fixed") => setEditingCoupon({ ...editingCoupon, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Porcentagem (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  min="0"
                  step={editingCoupon.type === 'percent' ? '1' : '0.01'}
                  value={editingCoupon.discount || ""}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, discount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="active-coupon"
                checked={editingCoupon.isActive}
                onCheckedChange={(checked) => setEditingCoupon({ ...editingCoupon, isActive: checked })}
              />
              <Label htmlFor="active-coupon">Cupom Ativo</Label>
            </div>
            
            <Button className="mt-4" onClick={handleSave}>
              Salvar Cupom
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
