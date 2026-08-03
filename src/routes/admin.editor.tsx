import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShop } from "@/lib/shop-store";
import type { SiteConfig } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/editor")({
  head: () => ({
    meta: [{ title: "Editor do Site — Painel Orion Store" }],
  }),
  component: AdminEditor,
});

function AdminEditor() {
  const { siteConfig, updateSiteConfig } = useShop();
  
  const [config, setConfig] = useState<SiteConfig>(siteConfig);

  const handleSave = () => {
    updateSiteConfig(config);
    toast.success("Site atualizado com sucesso!");
  };

  const handlePerkChange = (index: number, field: "title" | "text", value: string) => {
    const newPerks = [...config.perks];
    newPerks[index] = { ...newPerks[index], [field]: value };
    setConfig({ ...config, perks: newPerks });
  };

  return (
    <AdminShell title="Editor do Site">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Tabs defaultValue="hero" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="sections">Seções</TabsTrigger>
              <TabsTrigger value="perks">Benefícios</TabsTrigger>
              <TabsTrigger value="global">Global</TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-4 mt-4 bg-card border border-border p-6 rounded-2xl">
              <div className="space-y-2">
                <Label>Tag (ex: Semana Orion)</Label>
                <Input 
                  value={config.heroTag} 
                  onChange={e => setConfig({...config, heroTag: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Título Principal</Label>
                <Input 
                  value={config.heroTitle} 
                  onChange={e => setConfig({...config, heroTitle: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Subtítulo / Descrição</Label>
                <Textarea 
                  value={config.heroSubtitle} 
                  onChange={e => setConfig({...config, heroSubtitle: e.target.value})} 
                  className="h-24 resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="sections" className="space-y-6 mt-4 bg-card border border-border p-6 rounded-2xl">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-brand">Destaques</h3>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={config.featuredTitle} onChange={e => setConfig({...config, featuredTitle: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input value={config.featuredSubtitle} onChange={e => setConfig({...config, featuredSubtitle: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-brand">Categorias</h3>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={config.categoriesTitle} onChange={e => setConfig({...config, categoriesTitle: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-brand">Lançamentos</h3>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input value={config.newTitle} onChange={e => setConfig({...config, newTitle: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input value={config.newSubtitle} onChange={e => setConfig({...config, newSubtitle: e.target.value})} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="perks" className="space-y-6 mt-4 bg-card border border-border p-6 rounded-2xl">
              {config.perks.map((perk, i) => (
                <div key={i} className="space-y-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-sm text-brand">Benefício {i + 1}</h3>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={perk.title} onChange={e => handlePerkChange(i, "title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input value={perk.text} onChange={e => handlePerkChange(i, "text", e.target.value)} />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="global" className="space-y-4 mt-4 bg-card border border-border p-6 rounded-2xl">
              <div className="space-y-2">
                <Label>Barra Promocional (Cabeçalho)</Label>
                <Input value={config.promoBar} onChange={e => setConfig({...config, promoBar: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Descrição da Loja (Rodapé)</Label>
                <Textarea 
                  value={config.footerDescription} 
                  onChange={e => setConfig({...config, footerDescription: e.target.value})}
                  className="h-24 resize-none"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSave} className="w-full gap-2" size="lg">
            <Save className="h-5 w-5" /> Publicar Alterações
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-surface overflow-hidden hidden lg:flex flex-col relative h-[600px] sticky top-6">
          <div className="bg-muted p-2 flex gap-1 items-center justify-center border-b border-border text-xs text-muted-foreground font-mono">
            Preview do Hero (Em tempo real)
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              {config.heroTag}
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold leading-tight">
              {config.heroTitle}
            </h1>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              {config.heroSubtitle}
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
