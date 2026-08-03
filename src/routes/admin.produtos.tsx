import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl, CATEGORIES, PRODUCT_IMAGES, type Product } from "@/lib/shop-data";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({
    meta: [
      { title: "Gestão de produtos — Painel Orion Store" },
      {
        name: "description",
        content: "Cadastre, edite e exclua produtos do catálogo da Orion Store.",
      },
      { property: "og:title", content: "Gestão de produtos — Painel Orion Store" },
      { property: "og:description", content: "CRUD de produtos do catálogo Orion." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProducts,
});

const emptyForm = {
  id: "",
  name: "",
  price: "",
  stock: "",
  image: PRODUCT_IMAGES[0] ?? "",
  category: CATEGORIES[0]?.slug ?? "audio",
  description: "",
};

function AdminProducts() {
  const { products, saveProduct, deleteProduct } = useShop();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      image: p.image,
      category: p.category,
      description: p.description,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim() || Number.isNaN(price) || price <= 0 || Number.isNaN(stock)) {
      toast.error("Preencha nome, preço e estoque válidos.");
      return;
    }
    const existing = products.find((p) => p.id === form.id);
    saveProduct({
      ...(existing ?? {}),
      id: form.id || `p-${Date.now()}`,
      name: form.name.trim(),
      price,
      stock,
      image: form.image || (PRODUCT_IMAGES[0] ?? ""),
      category: form.category,
      description: form.description.trim() || "Produto da curadoria Orion.",
      variants: existing?.variants ?? ["Único"],
      rating: existing?.rating ?? 4.5,
      isNew: existing?.isNew ?? !form.id,
    });

    toast.success(form.id ? "Produto atualizado" : "Produto cadastrado");
    setOpen(false);
  };

  return (
    <AdminShell title="Produtos">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="min-w-0 text-sm text-muted-foreground">
          {products.length} produtos no catálogo
        </p>
        <Button onClick={openNew} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" /> Adicionar produto
        </Button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      width={800}
                      height={800}
                      className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover"
                    />
                    <span className="min-w-0 truncate font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {CATEGORIES.find((c) => c.slug === p.category)?.name ?? p.category}
                </td>
                <td className="px-4 py-3">{brl(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock <= 5 ? "font-semibold text-destructive" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir"
                      onClick={() => {
                        deleteProduct(p.id);
                        toast.success("Produto excluído");
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {form.id ? "Editar produto" : "Novo produto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="p-name">Nome</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="p-price">Preço (R$)</Label>
                <Input
                  id="p-price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="p-stock">Estoque</Label>
                <Input
                  id="p-stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Imagem</Label>
              <div className="mt-2 flex gap-3">
                {PRODUCT_IMAGES.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setForm({ ...form, image: img })}
                    className={`overflow-hidden rounded-xl border-2 ${
                      form.image === img ? "border-brand" : "border-border"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      width={800}
                      height={800}
                      className="h-16 w-16 object-cover"
                    />
                  </button>
                ))}
              </div>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="ou cole a URL da imagem"
                className="mt-3"
              />
            </div>
            <div>
              <Label htmlFor="p-desc">Descrição</Label>
              <Textarea
                id="p-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar produto</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
