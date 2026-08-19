import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
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
import { rowToCoupon, rowToOrder, rowToProduct, productToRow } from "./shop-mappers";
import { supabase } from "@/integrations/supabase/client";

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
  couponCode?: string | undefined;
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

const ADMIN_EMAIL = "orion@orion.app";
const ADMIN_USER = "ORION";

type Result = { ok: boolean; error?: string };

type ShopState = {
  loading: boolean;
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
  placeOrder: (input: PlaceOrderInput) => Promise<Order | null>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  restoreOrder: (id: string) => Promise<void>;
  permanentlyDeleteOrder: (id: string) => Promise<void>;
  confirmPayment: (id: string) => Promise<void>;
  confirmValue: (id: string) => Promise<void>;
  adjustOrderTotal: (id: string, total: number, reason: string) => Promise<void>;
  issueInvoice: (id: string) => Promise<void>;
  isAdmin: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  customers: Customer[];
  customer: Customer | null;
  registerCustomer: (input: RegisterInput) => Promise<Result>;
  loginCustomer: (email: string, password: string) => Promise<Result>;
  logoutCustomer: () => Promise<void>;
  siteConfig: SiteConfig;
  updateSiteConfig: (config: SiteConfig) => Promise<void>;
  paymentConfig: PaymentConfig;
  updatePaymentConfig: (config: PaymentConfig) => Promise<void>;
  shippingConfig: ShippingConfig;
  updateShippingConfig: (config: ShippingConfig) => Promise<void>;
  categories: Category[];
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (slug: string) => Promise<void>;
  resetCustomerPassword: (id: string, newPass?: string) => Promise<Result>;
  coupons: Coupon[];
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
};

const ShopContext = createContext<ShopState | null>(null);

const CART_KEY = "orion-cart-v2";
const now = () => new Date().toISOString();

// Untyped table access keeps the store resilient while the generated types catch up.
const db = supabase as unknown as {
  from: (table: string) => any;
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>(DEFAULT_SHIPPING_CONFIG);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // ---- cart persistence (local only) ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setCart(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  // ---- public catalog data ----
  const loadCatalog = useCallback(async () => {
    const [prod, cat, cou, cfg] = await Promise.all([
      db.from("products").select("*").order("created_at", { ascending: false }),
      db.from("categories").select("*").order("name"),
      db.from("coupons").select("*"),
      db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (prod.data) setProducts(prod.data.map(rowToProduct));
    if (cat.data?.length)
      setCategories(
        cat.data.map((c: any) => ({ slug: c.slug, name: c.name, emoji: c.emoji ?? "" })),
      );
    if (cou.data) setCoupons(cou.data.map(rowToCoupon));
    const stored = cfg.data as any;
    if (stored) {
      const sc = (stored.site_config ?? {}) as Partial<SiteConfig>;
      setSiteConfig({
        ...DEFAULT_SITE_CONFIG,
        ...sc,
        perks: sc.perks?.length ? sc.perks : DEFAULT_SITE_CONFIG.perks,
        footerLinks: sc.footerLinks?.length ? sc.footerLinks : DEFAULT_SITE_CONFIG.footerLinks,
      });
      if (stored.payment_config && Object.keys(stored.payment_config).length)
        setPaymentConfig({ ...DEFAULT_PAYMENT_CONFIG, ...stored.payment_config });
      if (stored.shipping_config && Object.keys(stored.shipping_config).length)
        setShippingConfig({ ...DEFAULT_SHIPPING_CONFIG, ...stored.shipping_config });
    }
  }, []);

  // ---- session-dependent data ----
  const loadSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;
    userIdRef.current = user?.id ?? null;
    if (!user) {
      setIsAdmin(false);
      setCustomer(null);
      setCustomers([]);
      setOrders([]);
      return;
    }
    const [{ data: roles }, { data: profile }] = await Promise.all([
      db.from("user_roles").select("role").eq("user_id", user.id),
      db.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    ]);
    const admin = Boolean(roles?.some((r: any) => r.role === "admin"));
    setIsAdmin(admin);
    setCustomer(
      admin || !profile
        ? null
        : {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            password: "",
            doc: profile.doc,
            phone: profile.phone,
            cep: profile.cep,
            address: profile.address,
            createdAt: profile.created_at,
          },
    );
    const { data: orderRows } = await db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((orderRows ?? []).map(rowToOrder));
    if (admin) {
      const { data: profiles } = await db
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setCustomers(
        (profiles ?? []).map((p: any) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          password: "",
          doc: p.doc,
          phone: p.phone,
          cep: p.cep,
          address: p.address,
          createdAt: p.created_at,
        })),
      );
    }
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      await loadCatalog();
      await loadSession();
      if (active) setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void loadSession();
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadCatalog, loadSession]);

  // ---- cart ----
  const addToCart = useCallback((product: Product, variant: string, qty: number) => {
    setCart((prev) => {
      const found = prev.find((i) => i.productId === product.id && i.variant === variant);
      if (found) {
        return prev.map((i) => (i === found ? { ...i, qty: Math.min(i.qty + qty, 99) } : i));
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, price: product.price, image: product.image, variant, qty },
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

  const patchOrder = useCallback(
    async (id: string, label: string | null, patch: Record<string, unknown>) => {
      const current = orders.find((o) => o.id === id);
      const history = label
        ? [...(current?.history ?? []), { at: now(), label }]
        : (current?.history ?? []);
      const payload = label ? { ...patch, history } : patch;
      const { data, error } = await db.from("orders").update(payload).eq("id", id).select().maybeSingle();
      if (error || !data) return;
      const updated = rowToOrder(data);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    },
    [orders],
  );

  const placeOrder = useCallback<ShopState["placeOrder"]>(
    async (input) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return null;
      const id = `#${Date.now().toString().slice(-6)}`;
      const row = {
        id,
        user_id: userId,
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
        coupon_code: input.couponCode ?? null,
        lines: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          variant: i.variant,
          qty: i.qty,
          price: i.price,
        })),
        payment_confirmed: false,
        value_confirmed: false,
        invoice: null,
        history: [{ at: now(), label: "Pedido recebido pela loja" }],
        is_deleted: false,
      };
      const { data, error } = await db.from("orders").insert(row).select().maybeSingle();
      if (error || !data) return null;
      const order = rowToOrder(data);
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    },
    [cart, cartCount],
  );

  const value = useMemo<ShopState>(
    () => ({
      loading,
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
      deleteOrder: (id) => patchOrder(id, null, { is_deleted: true }),
      restoreOrder: (id) => patchOrder(id, null, { is_deleted: false }),
      permanentlyDeleteOrder: async (id) => {
        await db.from("orders").delete().eq("id", id);
        setOrders((prev) => prev.filter((o) => o.id !== id));
      },
      saveProduct: async (product) => {
        const { data } = await db.from("products").upsert(productToRow(product)).select().maybeSingle();
        const saved = data ? rowToProduct(data) : product;
        setProducts((prev) =>
          prev.some((p) => p.id === saved.id)
            ? prev.map((p) => (p.id === saved.id ? saved : p))
            : [saved, ...prev],
        );
      },
      deleteProduct: async (id) => {
        await db.from("products").delete().eq("id", id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      },
      updateOrderStatus: (id, status) =>
        patchOrder(id, `Status alterado para "${status}"`, { status }),
      confirmPayment: (id) =>
        patchOrder(id, "Pagamento confirmado pelo gestor", {
          payment_confirmed: true,
          status: "Pagamento Confirmado",
        }),
      confirmValue: (id) =>
        patchOrder(id, "Valor do pedido conferido e aprovado", { value_confirmed: true }),
      adjustOrderTotal: (id, total, reason) =>
        patchOrder(id, `Valor ajustado para R$ ${total.toFixed(2)} — ${reason || "sem observação"}`, {
          total,
          value_confirmed: true,
        }),
      issueInvoice: async (id) => {
        const order = orders.find((o) => o.id === id);
        if (!order) return;
        const seq = String(1000 + orders.filter((o) => o.invoice).length + 1);
        const invoice: Invoice = {
          number: seq,
          series: "001",
          issuedAt: now(),
          key: Array.from({ length: 44 }, (_, i) => (id.charCodeAt(i % id.length) + i * 7) % 10).join(""),
          taxes: Number((order.total * 0.12).toFixed(2)),
        };
        await patchOrder(id, `Nota fiscal ${seq} emitida`, { invoice });
      },
      isAdmin,
      login: async (user, pass) => {
        const email = user.trim().toUpperCase() === ADMIN_USER ? ADMIN_EMAIL : user.trim();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error || !data.user) return false;
        const { data: roles } = await db.from("user_roles").select("role").eq("user_id", data.user.id);
        const admin = Boolean(roles?.some((r: any) => r.role === "admin"));
        if (!admin) {
          await supabase.auth.signOut();
          return false;
        }
        await loadSession();
        return true;
      },
      logout: async () => {
        await supabase.auth.signOut();
        await loadSession();
      },
      customers,
      customer,
      registerCustomer: async (input) => {
        const email = input.email.trim().toLowerCase();
        const { error } = await supabase.auth.signUp({
          email,
          password: input.password,
          options: {
            emailRedirectTo: `${window.location.origin}/conta`,
            data: {
              name: input.name,
              doc: input.doc,
              phone: input.phone,
              cep: input.cep,
              address: input.address,
            },
          },
        });
        if (error) {
          const msg = /already registered|already been registered/i.test(error.message)
            ? "Já existe uma conta com este e-mail."
            : error.message;
          return { ok: false, error: msg };
        }
        await loadSession();
        return { ok: true };
      },
      loginCustomer: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) return { ok: false, error: "E-mail ou senha inválidos." };
        await loadSession();
        return { ok: true };
      },
      logoutCustomer: async () => {
        await supabase.auth.signOut();
        await loadSession();
      },
      siteConfig,
      updateSiteConfig: async (config) => {
        setSiteConfig(config);
        await db.from("site_settings").update({ site_config: config }).eq("id", 1);
      },
      paymentConfig,
      updatePaymentConfig: async (config) => {
        setPaymentConfig(config);
        await db.from("site_settings").update({ payment_config: config }).eq("id", 1);
      },
      shippingConfig,
      updateShippingConfig: async (config) => {
        setShippingConfig(config);
        await db.from("site_settings").update({ shipping_config: config }).eq("id", 1);
      },
      categories,
      saveCategory: async (category) => {
        await db.from("categories").upsert({
          slug: category.slug,
          name: category.name,
          emoji: category.emoji ?? "",
        });
        setCategories((prev) =>
          prev.some((c) => c.slug === category.slug)
            ? prev.map((c) => (c.slug === category.slug ? category : c))
            : [...prev, category],
        );
      },
      deleteCategory: async (slug) => {
        await db.from("categories").delete().eq("slug", slug);
        setCategories((prev) => prev.filter((c) => c.slug !== slug));
      },
      resetCustomerPassword: async (id) => {
        const target = customers.find((c) => c.id === id);
        if (!target) return { ok: false, error: "Cliente não encontrado." };
        const { error } = await supabase.auth.resetPasswordForEmail(target.email, {
          redirectTo: `${window.location.origin}/conta`,
        });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },
      coupons,
      saveCoupon: async (coupon) => {
        await db.from("coupons").upsert({
          code: coupon.code,
          discount: coupon.discount,
          type: coupon.type,
          is_active: coupon.isActive,
        });
        setCoupons((prev) =>
          prev.some((c) => c.code === coupon.code)
            ? prev.map((c) => (c.code === coupon.code ? coupon : c))
            : [...prev, coupon],
        );
      },
      deleteCoupon: async (code) => {
        await db.from("coupons").delete().eq("code", code);
        setCoupons((prev) => prev.filter((c) => c.code !== code));
      },
    }),
    [
      loading,
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
      patchOrder,
      loadSession,
      isAdmin,
      customers,
      customer,
      siteConfig,
      paymentConfig,
      shippingConfig,
      categories,
      coupons,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
