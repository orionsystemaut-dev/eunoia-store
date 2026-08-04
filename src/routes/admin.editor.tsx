import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  
  const [config, setConfig] = useState<SiteConfig>({
    ...siteConfig,
    storeName: siteConfig.storeName || "Orion",
    footerLinks: siteConfig.footerLinks || [],
  });
  const [activeTab, setActiveTab] = useState("global");

  const handleSave = () => {
    updateSiteConfig(config);
    toast.success("Site atualizado com sucesso!");
  };

  const handlePerkChange = (index: number, field: "title" | "text", value: string) => {
    const newPerks = [...config.perks];
    const current = newPerks[index] ?? { title: "", text: "" };
    newPerks[index] = { ...current, [field]: value };
    setConfig({ ...config, perks: newPerks });
  };

  const addFooterLink = () => {
    setConfig({
      ...config,
      footerLinks: [...config.footerLinks, { id: `fl-${Date.now()}`, label: "Novo Link", actionType: "link", url: "" }]
    });
  };

  const updateFooterLink = (index: number, field: string, value: string) => {
    const links = [...config.footerLinks];
    links[index] = { ...links[index], [field]: value } as any;
    setConfig({ ...config, footerLinks: links });
  };

  const removeFooterLink = (index: number) => {
    const links = [...config.footerLinks];
    links.splice(index, 1);
    setConfig({ ...config, footerLinks: links });
  };

  return (
    <AdminShell title="Editor do Site">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-auto flex-wrap">
              <TabsTrigger value="global" className="py-2">Geral & Rodapé</TabsTrigger>
              <TabsTrigger value="hero" className="py-2">Hero</TabsTrigger>
              <TabsTrigger value="sections" className="py-2">Seções</TabsTrigger>
              <TabsTrigger value="perks" className="py-2">Benefícios</TabsTrigger>
            </TabsList>

            <TabsContent value="global" className="space-y-6 mt-4 bg-card border border-border p-6 rounded-2xl">
              <div className="space-y-2">
                <Label>Nome da Loja</Label>
                <Input value={config.storeName} onChange={e => setConfig({...config, storeName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Barra Promocional (Topo)</Label>
                <Input value={config.promoBar} onChange={e => setConfig({...config, promoBar: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Descrição da Loja (Rodapé)</Label>
                <Textarea 
                  value={config.footerDescription} 
                  onChange={e => setConfig({...config, footerDescription: e.target.value})}
                  className="h-20 resize-none"
                />
              </div>
              
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-brand">Links do Rodapé</h3>
                  <Button variant="outline" size="sm" onClick={addFooterLink} className="gap-2">
                    <Plus className="h-4 w-4" /> Adicionar Link
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {config.footerLinks.map((link, i) => (
                    <div key={link.id} className="relative rounded-xl border border-border p-4 bg-muted/30">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFooterLink(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="grid gap-4 pr-8">
                        <div className="space-y-2">
                          <Label>Texto do Link</Label>
                          <Input value={link.label} onChange={e => updateFooterLink(i, "label", e.target.value)} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Ação ao clicar</Label>
                          <Select value={link.actionType} onValueChange={(v) => updateFooterLink(i, "actionType", v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="link">Abrir uma URL</SelectItem>
                              <SelectItem value="modal">Abrir janela de texto (Modal)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {link.actionType === "link" ? (
                          <div className="space-y-2">
                            <Label>URL de Destino</Label>
                            <Input placeholder="/termos ou https://..." value={link.url || ""} onChange={e => updateFooterLink(i, "url", e.target.value)} />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Conteúdo do Modal (Texto que aparecerá)</Label>
                            <Textarea 
                              className="min-h-[100px]" 
                              value={link.modalContent || ""} 
                              onChange={e => updateFooterLink(i, "modalContent", e.target.value)} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {config.footerLinks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum link configurado no rodapé.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hero" className="space-y-4 mt-4 bg-card border border-border p-6 rounded-2xl">
              <div className="space-y-2">
                <Label>Tag (ex: Semana Orion)</Label>
                <Input value={config.heroTag} onChange={e => setConfig({...config, heroTag: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Título Principal</Label>
                <Input value={config.heroTitle} onChange={e => setConfig({...config, heroTitle: e.target.value})} />
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
          </Tabs>

          <Button onClick={handleSave} className="w-full gap-2" size="lg">
            <Save className="h-5 w-5" /> Publicar Alterações
          </Button>
        </div>

        <div className="rounded-3xl border border-border bg-surface overflow-hidden hidden lg:flex flex-col relative h-[600px] sticky top-6">
          <div className="bg-muted p-2 flex gap-1 items-center justify-center border-b border-border text-xs text-muted-foreground font-mono">
            Preview em tempo real
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center overflow-y-auto">
            {activeTab === "hero" && (
              <>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {config.heroTag}
                </span>
                <h1 className="mt-5 font-display text-2xl font-bold leading-tight">
                  {config.heroTitle}
                </h1>
                <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                  {config.heroSubtitle}
                </p>
              </>
            )}

            {activeTab === "sections" && (
              <div className="space-y-8 w-full text-left">
                <div>
                  <h2 className="font-display text-xl font-bold">{config.featuredTitle}</h2>
                  <p className="text-sm text-muted-foreground">{config.featuredSubtitle}</p>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{config.categoriesTitle}</h2>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{config.newTitle}</h2>
                  <p className="text-sm text-muted-foreground">{config.newSubtitle}</p>
                </div>
              </div>
            )}

            {activeTab === "perks" && (
              <div className="w-full grid grid-cols-2 gap-4 text-left">
                {config.perks.map((p, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-3">
                    <p className="text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "global" && (
              <div className="w-full space-y-12 flex flex-col justify-between h-full">
                <div className="border border-brand text-brand p-2 rounded-lg text-xs font-medium text-center">
                  Promo Bar: {config.promoBar}
                </div>
                <div className="border border-border p-4 rounded-lg bg-card text-left mt-auto">
                  <p className="font-display text-xl font-bold">{config.storeName}<span className="text-brand">.</span></p>
                  <p className="text-xs text-muted-foreground mt-2">{config.footerDescription}</p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-semibold mb-2">Links simulados no Rodapé:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {config.footerLinks.map(l => (
                        <li key={l.id}>• {l.label} ({l.actionType === 'modal' ? 'Janela Modal' : 'Link Web'})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
