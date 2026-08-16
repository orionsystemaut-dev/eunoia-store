import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  stock: number;
  image: string;
  gallery?: string[];
  category: string;
  description: string;
  variants: string[];
  rating: number;
  isNew?: boolean;
  featured?: boolean;
};

export type OrderStatus =
  | "Aguardando Pagamento"
  | "Pagamento Confirmado"
  | "Em Separação"
  | "Enviado"
  | "Entregue";

export const ORDER_STATUSES: OrderStatus[] = [
  "Aguardando Pagamento",
  "Pagamento Confirmado",
  "Em Separação",
  "Enviado",
  "Entregue",
];

export type OrderLine = {
  productId: string;
  name: string;
  variant: string;
  qty: number;
  price: number;
};

export type Invoice = {
  number: string;
  series: string;
  issuedAt: string;
  key: string;
  taxes: number;
};

export type OrderEvent = { at: string; label: string };

export type Customer = {
  id: string;
  name: string;
  email: string;
  password: string;
  doc: string;
  phone: string;
  cep: string;
  address: string;
  createdAt: string;
};

export type Order = {
  id: string;
  customer: string;
  date: string;
  total: number;
  items: number;
  status: OrderStatus;
  email?: string;
  doc?: string;
  phone?: string;
  cep?: string;
  address?: string;
  payment?: string;
  subtotal?: number;
  shipping?: number;
  discount?: number;
  lines?: OrderLine[];
  paymentConfirmed?: boolean;
  valueConfirmed?: boolean;
  invoice?: Invoice | null;
  history?: OrderEvent[];
  isDeleted?: boolean;
  couponCode?: string;
};

export type Coupon = {
  code: string;
  discount: number;
  type: "percent" | "fixed";
  isActive: boolean;
};

export type FooterLink = {
  id: string;
  label: string;
  actionType: "link" | "modal";
  url?: string;
  modalContent?: string;
};

export type Category = {
  slug: string;
  name: string;
  emoji?: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { slug: "audio", name: "Áudio", emoji: "🎧" },
  { slug: "wearables", name: "Wearables", emoji: "⌚" },
  { slug: "calcados", name: "Calçados", emoji: "👟" },
  { slug: "acessorios", name: "Acessórios", emoji: "🎒" },
];

export const PRODUCT_IMAGES = [p1, p2, p3];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p-001",
    name: "Headphone Orion Studio ANC",
    price: 1299.9,
    oldPrice: 1699.9,
    stock: 24,
    image: p1,
    gallery: [p1, p3, p2],
    category: "audio",
    description:
      "Cancelamento ativo de ruído híbrido, 40h de bateria e drivers de 40mm com áudio hi-res certificado.",
    variants: ["Preto", "Grafite", "Areia"],
    rating: 4.9,
    featured: true,
  },
  {
    id: "p-002",
    name: "Smartwatch Orion Pulse 2",
    price: 899.0,
    oldPrice: 1099.0,
    stock: 15,
    image: p2,
    gallery: [p2, p1, p3],
    category: "wearables",
    description:
      "Tela AMOLED 1.9”, GPS integrado, monitor cardíaco contínuo e resistência à água 5ATM.",
    variants: ["42mm", "46mm"],
    rating: 4.7,
    isNew: true,
    featured: true,
  },
  {
    id: "p-003",
    name: "Tênis Orion Cloud Runner",
    price: 549.9,
    stock: 38,
    image: p3,
    gallery: [p3, p1, p2],
    category: "calcados",
    description: "Entressola em espuma de alta resposta e cabedal em malha respirável ultraleve.",
    variants: ["38", "39", "40", "41", "42", "43"],
    rating: 4.8,
    isNew: true,
    featured: true,
  },
  {
    id: "p-004",
    name: "Fone In-Ear Orion Air Mini",
    price: 399.9,
    oldPrice: 499.9,
    stock: 52,
    image: p1,
    category: "audio",
    description: "True wireless com estojo de carga rápida e modo transparência.",
    variants: ["Branco", "Preto"],
    rating: 4.5,
    featured: true,
  },
  {
    id: "p-005",
    name: "Pulseira Fitness Orion Band",
    price: 249.0,
    stock: 60,
    image: p2,
    category: "wearables",
    description: "Monitoramento de sono, 14 dias de bateria e mais de 60 modos esportivos.",
    variants: ["P", "M", "G"],
    rating: 4.3,
  },
  {
    id: "p-006",
    name: "Tênis Orion Street Low",
    price: 429.9,
    oldPrice: 529.9,
    stock: 0,
    image: p3,
    category: "calcados",
    description: "Silhueta clássica em couro premium com solado emborrachado antiderrapante.",
    variants: ["38", "39", "40", "41", "42"],
    rating: 4.6,
  },
  {
    id: "p-007",
    name: "Mochila Orion Daily 22L",
    price: 319.9,
    stock: 27,
    image: p1,
    category: "acessorios",
    description: "Compartimento acolchoado para notebook 16”, tecido impermeável e porta USB.",
    variants: ["Cinza", "Preto"],
    rating: 4.4,
    isNew: true,
  },
  {
    id: "p-008",
    name: "Carregador Orion GaN 65W",
    price: 189.9,
    stock: 90,
    image: p2,
    category: "acessorios",
    description: "Três portas, tecnologia GaN compacta e carregamento inteligente multiplataforma.",
    variants: ["Único"],
    rating: 4.7,
  },
];

export const SEED_ORDERS: Order[] = [
  {
    id: "#10432",
    customer: "Marina Alves",
    date: "2026-07-28",
    total: 1699.8,
    items: 2,
    status: "Entregue",
  },
  {
    id: "#10433",
    customer: "Rafael Souza",
    date: "2026-07-30",
    total: 549.9,
    items: 1,
    status: "Enviado",
  },
  {
    id: "#10434",
    customer: "Camila Ferreira",
    date: "2026-08-01",
    total: 2198.9,
    items: 3,
    status: "Em Separação",
  },
  {
    id: "#10435",
    customer: "João Pedro Lima",
    date: "2026-08-02",
    total: 399.9,
    items: 1,
    status: "Aguardando Pagamento",
  },
  {
    id: "#10436",
    customer: "Beatriz Nunes",
    date: "2026-08-03",
    total: 1148.9,
    items: 2,
    status: "Aguardando Pagamento",
  },
];

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// PIX Payload Generator (BR Code format)
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) > 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixPayload(
  pixKey: string,
  amount: number,
  merchantName: string = "Orion Store",
  merchantCity: string = "Sao Paulo"
): string {
  const formatLength = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, "0");
    return `${id}${len}${value}`;
  };

  const gui = formatLength("00", "br.gov.bcb.pix");
  const key = formatLength("01", pixKey);
  const accountInfo = formatLength("26", gui + key);
  
  const amtStr = amount.toFixed(2);
  const mName = merchantName.substring(0, 25).replace(/[^\x20-\x7E]/g, '');
  const mCity = merchantCity.substring(0, 15).replace(/[^\x20-\x7E]/g, '');

  let payload = 
    "000201" +
    "010211" +
    accountInfo +
    "52040000" +
    "5303986" +
    (amount > 0 ? formatLength("54", amtStr) : "") +
    "5802BR" +
    formatLength("59", mName) +
    formatLength("60", mCity) +
    formatLength("62", formatLength("05", "***"));

  payload += "6304";
  return payload + crc16(payload);
}
