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
  type Customer,
  type Invoice,
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

export type PerkConfig = {
  title: string;
  text: string;
};

export type PaymentConfig = {
  pixEnabled: boolean;
  pixKey: string;
  cardEnabled: boolean;
  gatewayKey: string;
};

export type SiteConfig = {
  promoBar: string;
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  perks: PerkConfig[];
  featuredTitle: string;
  featuredSubtitle: string;
  categoriesTitle: string;
  newTitle: string;
  newSubtitle: string;
  footerDescription: string;
};

const DEFAULT_SITE_CONFIG: SiteConfig = {
  promoBar: "Frete grátis acima de R$ 299",
  heroTag: "Semana Orion · até 35% OFF",
  heroTitle: "Tecnologia que combina com o seu ritmo.",
  heroSubtitle:
    "Curadoria de áudio, wearables e calçados com garantia estendida, entrega rastreada e parcelamento em até 10x sem juros.",
  perks: [
    { title: "Frete grátis", text: "Acima de R$ 299 para todo o Brasil" },
    { title: "30 dias", text: "Troca fácil e devolução sem custo" },
    { title: "10x sem juros", text: "Ou 12% off no Pix à vista" },
    { title: "Suporte real", text: "Atendimento humano todos os dias" },
  ],
  featuredTitle: "Destaques da semana",
  featuredSubtitle: "Os produtos mais desejados pelos nossos clientes",
  categoriesTitle: "Navegue por categoria",
  newTitle: "Lançamentos",
  newSubtitle: "Recém-chegados na loja, com estoque limitado",
  footerDescription:
    "Tecnologia e design para o dia a dia. Curadoria de produtos com garantia estendida e entrega para todo o Brasil.",
};

export type PlaceOrderInput = {
  name: string;
  email: string;
  doc: string;
  phone: string;
  cep: string;
  address: string;
  payment: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  doc: string;
  phone: string;
  cep: string;
  address: string;
};

const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  pixEnabled: true,
  pixKey: "CNPJ 12.345.678/0001-90",
  cardEnabled: true,
  gatewayKey: "pk_test_12345",
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
  placeOrder: (input: PlaceOrderInput) => Order;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  confirmPayment: (id: string) => void;
  confirmValue: (id: string) => void;
  adjustOrderTotal: (id: string, total: number, reason: string) => void;
  issueInvoice: (id: string) => void;
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  customers: Customer[];
  customer: Customer | null;
  registerCustomer: (input: RegisterInput) => { ok: boolean; error?: string };
  loginCustomer: (email: string, password: string) => { ok: boolean; error?: string };
  logoutCustomer: () => void;
  siteConfig: SiteConfig;
  updateSiteConfig: (config: SiteConfig) => void;
  paymentConfig: PaymentConfig;
  updatePaymentConfig: (config: PaymentConfig) => void;
};

const ShopContext = createContext<ShopState | null>(null);

const KEY = "orion-shop-v1";

type Persisted = {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  isAdmin: boolean;
  siteConfig: SiteConfig;
  paymentConfig: PaymentConfig;
  customers: Customer[];
  customerId: string | null;
};

const now = () => new Date().toISOString();

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);
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
        if (parsed.paymentConfig) setPaymentConfig(parsed.paymentConfig);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.customerId) setCustomerId(parsed.customerId);
        if (parsed.siteConfig)
          setSiteConfig({
            ...DEFAULT_SITE_CONFIG,
            ...parsed.siteConfig,
            perks: parsed.siteConfig.perks?.length
              ? parsed.siteConfig.perks
              : DEFAULT_SITE_CONFIG.perks,
          });
        setIsAdmin(Boolean(parsed.isAdmin));
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      KEY,
      JSON.stringify({ products, orders, cart, isAdmin, siteConfig, paymentConfig, customers, customerId }),
    );
  }, [products, orders, cart, isAdmin, siteConfig, paymentConfig, customers, customerId, hydrated]);

  const addToCart = useCallback((product: Product, variant: string, qty: number) => {
    setCart((prev) => {
      const found = prev.find((i) => i.productId === product.id && i.variant === variant);
      if (found) {
        return prev.map((i) => (i === found ? { ...i, qty: Math.min(i.qty + qty, 99) } : i));
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
    (input: PlaceOrderInput) => {
      const order: Order = {
        id: `#${10437 + orders.length}`,
        customer: input.name || "Cliente Loja",
        date: new Date().toISOString().slice(0, 10),
        total: input.total,
        items: cartCount,
        status: "Aguardando Pagamento",
        email: input.email,
        doc: input.doc,
        phone: input.phone,
        cep: input.cep,
        address: input.address,
        payment: input.payment,
        subtotal: input.subtotal,
        shipping: input.shipping,
        discount: input.discount,
        lines: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          variant: i.variant,
          qty: i.qty,
          price: i.price,
        })),
        paymentConfirmed: false,
        valueConfirmed: false,
        invoice: null,
        history: [{ at: now(), label: "Pedido recebido pela loja" }],
      };
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    },
    [orders.length, cart, cartCount],
  );

  const pushEvent = useCallback((id: string, label: string, patch: Partial<Order> = {}) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, ...patch, history: [...(o.history ?? []), { at: now(), label }] }
          : o,
      ),
    );
  }, []);

  const value = useMemo<ShopState>(() => {
    const customer = customers.find((c) => c.id === customerId) ?? null;
    return {
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
      updateOrderStatus: (id, status) => pushEvent(id, `Status alterado para "${status}"`, { status }),
      confirmPayment: (id) =>
        pushEvent(id, "Pagamento confirmado pelo gestor", {
          paymentConfirmed: true,
          status: "Pagamento Confirmado",
        }),
      confirmValue: (id) => pushEvent(id, "Valor do pedido conferido e aprovado", { valueConfirmed: true }),
      adjustOrderTotal: (id, total, reason) =>
        pushEvent(id, `Valor ajustado para R$ ${total.toFixed(2)} — ${reason || "sem observação"}`, {
          total,
          valueConfirmed: true,
        }),
      issueInvoice: (id) => {
        const order = orders.find((o) => o.id === id);
        if (!order) return;
        const seq = String(1000 + orders.filter((o) => o.invoice).length + 1);
        const invoice: Invoice = {
          number: seq,
          series: "001",
          issuedAt: now(),
          key: Array.from({ length: 44 }, (_, i) => ((id.charCodeAt(i % id.length) + i * 7) % 10)).join(""),
          taxes: Number((order.total * 0.12).toFixed(2)),
        };
        pushEvent(id, `Nota fiscal ${seq} emitida`, { invoice });
      },
      isAdmin,
      login: (user, pass) => {
        const ok = user.trim().toUpperCase() === "ORION" && pass === "ORION2027";
        if (ok) setIsAdmin(true);
        return ok;
      },
      logout: () => setIsAdmin(false),
      customers,
      customer,
      registerCustomer: (input) => {
        const email = input.email.trim().toLowerCase();
        if (customers.some((c) => c.email === email))
          return { ok: false, error: "Já existe uma conta com este e-mail." };
        const created: Customer = {
          ...input,
          email,
          id: `c-${Date.now()}`,
          createdAt: now(),
        };
        setCustomers((prev) => [...prev, created]);
        setCustomerId(created.id);
        return { ok: true };
      },
      loginCustomer: (email, password) => {
        const found = customers.find(
          (c) => c.email === email.trim().toLowerCase() && c.password === password,
        );
        if (!found) return { ok: false, error: "E-mail ou senha inválidos." };
        setCustomerId(found.id);
        return { ok: true };
      },
      logoutCustomer: () => setCustomerId(null),
      siteConfig,
      updateSiteConfig: setSiteConfig,
      paymentConfig,
      updatePaymentConfig: setPaymentConfig,
    };
  }, [
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
    pushEvent,
    isAdmin,
    customers,
    customerId,
    siteConfig,
    paymentConfig,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
