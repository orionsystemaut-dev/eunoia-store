import { ORDER_STATUSES, type OrderStatus } from "@/lib/shop-data";

export const statusTone: Record<OrderStatus, string> = {
  "Aguardando Pagamento": "bg-warning/15 text-warning-foreground border-warning/40",
  "Pagamento Confirmado": "bg-success/10 text-success border-success/40",
  "Em Separação": "bg-accent text-accent-foreground border-border",
  Enviado: "bg-brand/15 text-brand border-brand/40",
  Entregue: "bg-success/15 text-success border-success/40",
};

export const statusIndex = (status: OrderStatus) => ORDER_STATUSES.indexOf(status);

export const STEP_HINTS: Record<OrderStatus, string> = {
  "Aguardando Pagamento": "Estamos aguardando a confirmação do seu pagamento.",
  "Pagamento Confirmado": "Pagamento aprovado! Nota fiscal em emissão.",
  "Em Separação": "Seu pedido está sendo embalado no centro de distribuição.",
  Enviado: "Pedido despachado — acompanhe o rastreio pelo e-mail.",
  Entregue: "Pedido entregue. Bom proveito!",
};
