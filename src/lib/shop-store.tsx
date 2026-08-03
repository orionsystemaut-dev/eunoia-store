import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  SEED_ORDERS,
  SEED_PRODUCTS,
  type Order,
  type OrderStatus,
  type Product,
} from "./shop-data";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  variant: string;
  qty: number;
};

export type SiteConfig = {
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
};

const DEFAULT_SITE_CONFIG: SiteConfig = {
  heroTag: "Semana Orion · até 35% OFF",
  heroTitle: "Tecnologia que combina com o seu ritmo.",
  heroSubtitle: "Curadoria de áudio, wearables e calçados com garantia estendida, entrega rastreada e parcelamento em até 10x sem juros.",
};

type ShopState = {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, variant: string, qty: number) => void;
  updateQty: (productId: string, variant: string, qty: number) => void;
  removeFromCart: (productId: string, variant: string) => void;
  clearCart: () => void;
  placeOrder: (customer: string) => Order;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  siteConfig: SiteConfig;
  updateSiteConfig: (config: SiteConfig) => void;
};

const ShopContext = createContext<ShopState | null>(null);

const KEY = "orion-shop-v1";

type Persisted = { products: Product[]; orders: Order[]; cart: CartItem[]; isAdmin: boolean; siteConfig: SiteConfig };

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        if (parsed.products?.length) setProducts(parsed.products);
        if (parsed.orders?.length) setOrders(parsed.orders);
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.siteConfig) setSiteConfig(parsed.siteConfig);
        setIsAdmin(Boolean(parsed.isAdmin));
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ products, orders, cart, isAdmin, siteConfig }));
  }, [products, orders, cart, isAdmin, siteConfig, hydrated]);

  const addToCart = useCallback((product: Product, variant: string, qty: number) => {
    setCart((prev) => {
      const found = prev.find((i) => i.productId === product.id && i.variant === variant);
      if (found) {
        return prev.map((i) =>
          i === found ? { ...i, qty: Math.min(i.qty + qty, 99) } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          variant,
          qty,
        },
      ];
    });
    setCartOpen(true);
  }, []);

  const updateQty = useCallback((productId: string, variant: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.productId === productId && i.variant === variant))
        : prev.map((i) =>
            i.productId === productId && i.variant === variant ? { ...i, qty } : i,
          ),
    );
  }, []);

  const removeFromCart = useCallback((productId: string, variant: string) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const placeOrder = useCallback(
    (customer: string) => {
      const order: Order = {
        id: `#${10437 + orders.length}`,
        customer: customer || "Cliente Loja",
        date: new Date().toISOString().slice(0, 10),
        total: cartTotal,
        items: cartCount,
        status: "Aguardando Pagamento",
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    },
    [orders.length, cartTotal, cartCount],
  );

  const value = useMemo<ShopState>(
    () => ({
      products,
      orders,
      cart,
      cartCount,
      cartTotal,
      cartOpen,
      setCartOpen,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart: () => setCart([]),
      placeOrder,
      saveProduct: (product) =>
        setProducts((prev) =>
          prev.some((p) => p.id === product.id)
            ? prev.map((p) => (p.id === product.id ? product : p))
            : [product, ...prev],
        ),
      deleteProduct: (id) => setProducts((prev) => prev.filter((p) => p.id !== id)),
      updateOrderStatus: (id, status) =>
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))),
      isAdmin,
      login: (user, pass) => {
        const ok = user.trim().toUpperCase() === "ORION" && pass === "ORION2027";
        if (ok) setIsAdmin(true);
        return ok;
      },
      logout: () => setIsAdmin(false),
      siteConfig,
      updateSiteConfig: setSiteConfig,
    }),
    [
      products,
      orders,
      cart,
      cartCount,
      cartTotal,
      cartOpen,
      addToCart,
      updateQty,
      removeFromCart,
      placeOrder,
      isAdmin,
      siteConfig,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
