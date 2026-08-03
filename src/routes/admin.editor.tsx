import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/admin/editor")({
  head: () => ({
    meta: [{ title: "Editor do Site — Painel Orion Store" }],
  }),
  component: AdminEditor,
});

function AdminEditor() {
  const { siteConfig, updateSiteConfig } = useShop();
  
  const [config, setConfig] = useState(siteConfig);

  const handleSave = () => {
    updateSiteConfig(config);
    toast.success("Site atualizado com sucesso!");
  };

  return (
    <AdminShell title="Editor do Site">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold">Configuração Principal (Hero)</h2>
            
            <div className="space-y-2">
              <Label>Tag (ex: Semana Orion · até 35% OFF)</Label>
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
            
            <Button onClick={handleSave} className="w-full gap-2">
              <Save className="h-4 w-4" /> Publicar Alterações
            </Button>
          </section>
        </div>

        <div className="rounded-3xl border border-border bg-surface overflow-hidden hidden lg:flex flex-col relative h-[500px]">
          <div className="bg-muted p-2 flex gap-1 items-center justify-center border-b border-border text-xs text-muted-foreground font-mono">
            Preview em tempo real
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
