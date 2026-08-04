import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FolderGit2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brl, PRODUCT_IMAGES, type Product } from "@/lib/shop-data";
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
  image: "",
  gallery: [] as string[],
  category: "",
  description: "",
};

function AdminProducts() {
  const { products, saveProduct, deleteProduct, categories, saveCategory, deleteCategory } = useShop();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeCategory, setActiveCategory] = useState<string>("todas");

  // Category Manager State
  const [catOpen, setCatOpen] = useState(false);
  const [catForm, setCatForm] = useState({ slug: "", name: "", emoji: "" });

  const openNew = () => {
    setForm({ ...emptyForm, category: categories[0]?.slug ?? "" });
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      image: p.image,
      gallery: p.gallery || (p.image ? [p.image] : []),
      category: p.category,
      description: p.description,
    });
    setOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    Promise.all(files.map(f => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(f);
    }))).then(base64Arr => {
      setForm(prev => ({ ...prev, gallery: [...prev.gallery, ...base64Arr] }));
    });
  };

  const removeGalleryItem = (index: number) => {
    setForm(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
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
      image: form.gallery[0] || form.image || (PRODUCT_IMAGES[0] ?? ""),
      gallery: form.gallery,
      category: form.category,
      description: form.description.trim() || "Produto da curadoria Orion.",
      variants: existing?.variants ?? ["Único"],
      rating: existing?.rating ?? 4.5,
      isNew: existing?.isNew ?? !form.id,
    });

    toast.success(form.id ? "Produto atualizado" : "Produto cadastrado");
    setOpen(false);
  };

  const saveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    const slug = catForm.slug.trim() || catForm.name.trim().toLowerCase().replace(/\s+/g, "-");
    saveCategory({ slug, name: catForm.name.trim(), emoji: catForm.emoji });
    setCatForm({ slug: "", name: "", emoji: "" });
    toast.success("Categoria salva!");
  };

  const removeCat = (slug: string) => {
    if (products.some(p => p.category === slug)) {
      toast.error("Existem produtos nesta categoria. Remova-os primeiro.");
      return;
    }
    deleteCategory(slug);
    toast.success("Categoria removida");
  };

  return (
    <AdminShell title="Produtos">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
        <p className="min-w-0 text-sm text-muted-foreground">
          {products.length} produtos no catálogo
        </p>
        <Button variant="outline" onClick={() => setCatOpen(true)} className="shrink-0 gap-2">
          <FolderGit2 className="h-4 w-4" /> Categorias
        </Button>
        <Button onClick={openNew} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mt-5">
        <TabsList className="mb-4 flex-wrap h-auto">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          {categories.map(c => (
            <TabsTrigger key={c.slug} value={c.slug}>{c.name}</TabsTrigger>
          ))}
        </TabsList>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
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
              {products
                .filter(p => activeCategory === "todas" || p.category === activeCategory)
                .map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image?.startsWith("data:video") ? (
                        <video src={p.image} className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover" muted />
                      ) : (
                        <img src={p.image} alt={p.name} loading="lazy" width={800} height={800} className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover" />
                      )}
                      <span className="min-w-0 truncate font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {categories.find((c) => c.slug === p.category)?.name ?? p.category}
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
              {products.filter(p => activeCategory === "todas" || p.category === activeCategory).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum produto nesta categoria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Tabs>

      {/* Product Modal */}
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
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Galeria de Mídia (Imagens/Vídeos)</Label>
              <div className="mt-2 grid grid-cols-4 gap-3">
                {form.gallery.map((media, i) => (
                  <div key={i} className="relative group overflow-hidden rounded-xl border border-border bg-muted aspect-square">
                    {media.startsWith("data:video") ? (
                      <video src={media} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={media} alt="" className="w-full h-full object-cover" />
                    )}
                    <button 
                      type="button" 
                      onClick={() => removeGalleryItem(i)} 
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                <label className="border-2 border-dashed border-border rounded-xl aspect-square flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Upload</span>
                  <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleFileUpload} />
                </label>
              </div>
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

      {/* Category Modal */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Gerenciar Categorias</DialogTitle>
          </DialogHeader>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-semibold">Adicionar nova</p>
              <form onSubmit={saveCat} className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input 
                    value={catForm.name} 
                    onChange={e => setCatForm({ ...catForm, name: e.target.value })} 
                    placeholder="Ex: Games" 
                    className="mt-1" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Emoji</Label>
                    <Input 
                      value={catForm.emoji} 
                      onChange={e => setCatForm({ ...catForm, emoji: e.target.value })} 
                      placeholder="Ex: 🎮" 
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label>Slug (Opcional)</Label>
                    <Input 
                      value={catForm.slug} 
                      onChange={e => setCatForm({ ...catForm, slug: e.target.value })} 
                      placeholder="games" 
                      className="mt-1" 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </div>
            <div>
              <p className="mb-4 text-sm font-semibold">Categorias cadastradas</p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {categories.map(c => (
                  <div key={c.slug} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.emoji}</span>
                      <span className="font-medium">{c.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeCat(c.slug)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
