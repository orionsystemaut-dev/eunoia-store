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
  DEFAULT_CATEGORIES,
  type Category,
  type Customer,
  type Invoice,
  type Order,
  type OrderStatus,
  type Product,
  type Coupon,
  type FooterLink,
} from "./shop-data";
import { encryptData, decryptData, hashPassword } from "./crypto";

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

export type ShippingConfig = {
  fixedRate: number;
  freeShippingThreshold: number;
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
  storeName: string;
  logoUrl?: string;
  footerLinks: FooterLink[];
};

const DEFAULT_SITE_CONFIG: SiteConfig = {
  logoUrl: "",
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
  featuredSubtitle: "Os produtos mais desejados com preços imperdíveis.",
  categoriesTitle: "Navegue por categoria",
  newTitle: "Lançamentos",
  newSubtitle: "Chegaram as novidades que você esperava.",
  footerDescription:
    "Inovação, design e a melhor curadoria de produtos direto para você.",
  storeName: "Orion",
  footerLinks: [
    { id: "fl-1", label: "Central de atendimento", actionType: "modal", modalContent: "Telefone: 0800 123 456\nHorário: 08h às 18h" },
    { id: "fl-2", label: "Trocas e devoluções", actionType: "modal", modalContent: "Você tem até 30 dias para solicitar devolução grátis em nosso site." },
    { id: "fl-3", label: "Prazos de entrega", actionType: "modal", modalContent: "Capitais: até 3 dias úteis.\nInterior: até 7 dias úteis." },
    { id: "fl-4", label: "Política de privacidade", actionType: "link", url: "/termos" },
    { id: "fl-5", label: "Área do gestor", actionType: "link", url: "/admin" },
  ],
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
  couponCode?: string;
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

const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  fixedRate: 24.90,
  freeShippingThreshold: 299.00,
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
  deleteOrder: (id: string) => void;
  restoreOrder: (id: string) => void;
  permanentlyDeleteOrder: (id: string) => void;
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
  shippingConfig: ShippingConfig;
  updateShippingConfig: (config: ShippingConfig) => void;
  categories: Category[];
  saveCategory: (category: Category) => void;
  deleteCategory: (slug: string) => void;
  resetCustomerPassword: (id: string, newPass: string) => void;
  coupons: Coupon[];
  saveCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
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
  shippingConfig: ShippingConfig;
  customers: Customer[];
  customerId: string | null;
  categories: Category[];
  coupons: Coupon[];
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
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>(DEFAULT_SHIPPING_CONFIG);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = decryptData<Partial<Persisted>>(raw);
        if (parsed) {
          if (parsed.products?.length) setProducts(parsed.products);
          if (parsed.orders?.length) setOrders(parsed.orders);
          if (parsed.cart) setCart(parsed.cart);
          if (parsed.paymentConfig) setPaymentConfig(parsed.paymentConfig);
          if (parsed.shippingConfig) setShippingConfig(parsed.shippingConfig);
          if (parsed.customers) setCustomers(parsed.customers);
          if (parsed.customerId) setCustomerId(parsed.customerId);
          if (parsed.categories?.length) setCategories(parsed.categories);
          if (parsed.coupons) setCoupons(parsed.coupons);
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
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload = { products, orders, cart, isAdmin, siteConfig, paymentConfig, shippingConfig, customers, customerId, categories, coupons };
    localStorage.setItem(KEY, encryptData(payload));
  }, [products, orders, cart, isAdmin, siteConfig, paymentConfig, shippingConfig, customers, customerId, categories, coupons, hydrated]);

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
        couponCode: input.couponCode,
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
      deleteOrder: (id) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, isDeleted: true } : o)));
      },
      restoreOrder: (id) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, isDeleted: false } : o)));
      },
      permanentlyDeleteOrder: (id) => {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      },
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
          password: hashPassword(input.password),
          id: `c-${Date.now()}`,
          createdAt: now(),
        };
        setCustomers((prev) => [...prev, created]);
        setCustomerId(created.id);
        return { ok: true };
      },
      loginCustomer: (email, password) => {
        const hashed = hashPassword(password);
        const found = customers.find(
          (c) => c.email === email.trim().toLowerCase() && (c.password === password || c.password === hashed),
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
      shippingConfig,
      updateShippingConfig: setShippingConfig,
      categories,
      saveCategory: (category) =>
        setCategories((prev) =>
          prev.some((c) => c.slug === category.slug)
            ? prev.map((c) => (c.slug === category.slug ? category : c))
            : [...prev, category],
        ),
      deleteCategory: (slug) => setCategories((prev) => prev.filter((c) => c.slug !== slug)),
      resetCustomerPassword: (id, newPass) => {
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, password: hashPassword(newPass) } : c)));
      },
      coupons,
      saveCoupon: (coupon) =>
        setCoupons((prev) =>
          prev.some((c) => c.code === coupon.code)
            ? prev.map((c) => (c.code === coupon.code ? coupon : c))
            : [...prev, coupon],
        ),
      deleteCoupon: (code) => setCoupons((prev) => prev.filter((c) => c.code !== code)),
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
    shippingConfig,
    categories,
    coupons,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
