import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import type { Coupon, Invoice, Order, OrderEvent, OrderLine, OrderStatus, Product } from "./shop-data";

const SEED_IMAGES: Record<string, string> = {
  "/assets/p1.jpg": p1,
  "/assets/p2.jpg": p2,
  "/assets/p3.jpg": p3,
};

export const resolveImage = (src?: string | null) =>
  (src && (SEED_IMAGES[src] ?? src)) || p1;

const num = (v: unknown, fallback = 0) => (v === null || v === undefined ? fallback : Number(v));

export function rowToProduct(row: Record<string, unknown>): Product {
  const gallery = Array.isArray(row["gallery"]) ? (row["gallery"] as string[]) : [];
  const product: Product = {
    id: String(row["id"]),
    name: String(row["name"] ?? ""),
    price: num(row["price"]),
    stock: num(row["stock"]),
    image: resolveImage(row["image"] as string),
    category: String(row["category"] ?? ""),
    description: String(row["description"] ?? ""),
    variants: Array.isArray(row["variants"]) ? (row["variants"] as string[]) : [],
    rating: num(row["rating"]),
    isNew: Boolean(row["is_new"]),
    featured: Boolean(row["featured"]),
  };
  if (row["old_price"] !== null && row["old_price"] !== undefined) product.oldPrice = num(row["old_price"]);
  if (gallery.length) product.gallery = gallery.map(resolveImage);
  return product;
}

export function productToRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    old_price: p.oldPrice ?? null,
    stock: p.stock,
    image: p.image,
    gallery: p.gallery ?? [],
    category: p.category,
    description: p.description,
    variants: p.variants,
    rating: p.rating,
    is_new: Boolean(p.isNew),
    featured: Boolean(p.featured),
  };
}

export function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row["id"]),
    customer: String(row["customer"] ?? ""),
    date: String(row["date"] ?? "").slice(0, 10),
    total: num(row["total"]),
    items: num(row["items"]),
    status: String(row["status"] ?? "Aguardando Pagamento") as OrderStatus,
    email: (row["email"] as string) ?? "",
    doc: (row["doc"] as string) ?? "",
    phone: (row["phone"] as string) ?? "",
    cep: (row["cep"] as string) ?? "",
    address: (row["address"] as string) ?? "",
    payment: (row["payment"] as string) ?? "",
    subtotal: num(row["subtotal"]),
    shipping: num(row["shipping"]),
    discount: num(row["discount"]),
    couponCode: (row["coupon_code"] as string) ?? undefined,
    lines: (Array.isArray(row["lines"]) ? row["lines"] : []) as OrderLine[],
    paymentConfirmed: Boolean(row["payment_confirmed"]),
    valueConfirmed: Boolean(row["value_confirmed"]),
    invoice: (row["invoice"] as Invoice | null) ?? null,
    history: (Array.isArray(row["history"]) ? row["history"] : []) as OrderEvent[],
    isDeleted: Boolean(row["is_deleted"]),
  };
}

export function rowToCoupon(row: Record<string, unknown>): Coupon {
  return {
    code: String(row["code"]),
    discount: num(row["discount"]),
    type: (String(row["type"] ?? "percent") as Coupon["type"]),
    isActive: Boolean(row["is_active"]),
  };
}
