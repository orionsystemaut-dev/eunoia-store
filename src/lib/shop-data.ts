

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
  couponCode?: string | undefined;
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
  { slug: "smartphones", name: "Smartphones", emoji: "📱" },
  { slug: "audio", name: "Áudio", emoji: "🎧" },
  { slug: "wearables", name: "Wearables", emoji: "⌚" },
  { slug: "drones", name: "Drones", emoji: "🚁" },
  { slug: "perifericos", name: "Periféricos", emoji: "⌨️" },
];

export const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop"
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "p-001",
    name: "Apple iPhone 15 Pro Max",
    price: 10999.0,
    oldPrice: 11999.0,
    stock: 12,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop"
    ],
    category: "smartphones",
    description: "Titânio forjado, chip A17 Pro e sistema de câmera Pro avançado. O iPhone mais poderoso já criado.",
    variants: ["Titânio Natural", "Titânio Azul", "Titânio Preto"],
    rating: 4.9,
    isNew: true,
    featured: true,
  },
  {
    id: "p-002",
    name: "Samsung Galaxy S24 Ultra",
    price: 9999.0,
    oldPrice: 10499.0,
    stock: 8,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop"
    ],
    category: "smartphones",
    description: "Galaxy AI integrado, carcaça de titânio e tela plana com o vidro mais resistente do mercado.",
    variants: ["Titânio Cinza", "Titânio Preto"],
    rating: 4.8,
    isNew: true,
    featured: true,
  },
  {
    id: "p-003",
    name: "DJI Mini 4 Pro",
    price: 7599.0,
    stock: 5,
    image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=800&auto=format&fit=crop",
    category: "drones",
    description: "Drone compacto de menos de 249g, detecção de obstáculos omnidirecional e vídeo HDR em 4K/60fps.",
    variants: ["Padrão", "Fly More Combo"],
    rating: 4.9,
    featured: true,
  },
  {
    id: "p-004",
    name: "Sony WH-1000XM5",
    price: 2499.0,
    oldPrice: 2899.0,
    stock: 18,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
    category: "audio",
    description: "O melhor cancelamento de ruído do mercado, processador V1 integrado e áudio Hi-Res sem fio.",
    variants: ["Preto", "Prata"],
    rating: 4.8,
    featured: true,
  },
  {
    id: "p-005",
    name: "Garmin Fenix 7X Pro",
    price: 6899.0,
    stock: 4,
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop",
    category: "wearables",
    description: "Relógio multiesporte com lente de carregamento solar, lanterna LED e mapeamento avançado.",
    variants: ["Sapphire Solar 51mm"],
    rating: 4.9,
    featured: true,
  },
  {
    id: "p-006",
    name: "Logitech MX Master 3S",
    price: 749.0,
    stock: 30,
    image: "https://images.unsplash.com/photo-1527814050087-37938154791f?q=80&w=800&auto=format&fit=crop",
    category: "perifericos",
    description: "Mouse ergonômico sem fio com sensor 8K DPI e cliques silenciosos para máxima produtividade.",
    variants: ["Grafite", "Pale Grey"],
    rating: 4.7,
  },
  {
    id: "p-007",
    name: "JBL Tour One M2",
    price: 1899.0,
    oldPrice: 2199.0,
    stock: 22,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop",
    category: "audio",
    description: "Som lendário da JBL, cancelamento de ruído adaptativo true e até 50 horas de reprodução.",
    variants: ["Preto", "Champanhe"],
    rating: 4.6,
  }
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
