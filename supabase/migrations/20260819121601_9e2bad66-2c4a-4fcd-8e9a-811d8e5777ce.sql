-- ROLES
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins read all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- updated_at helper
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  doc text not null default '',
  phone text not null default '',
  cep text not null default '',
  address text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin')) with check (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, doc, phone, cep, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'doc', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'cep', ''),
    coalesce(new.raw_user_meta_data ->> 'address', '')
  ) on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- CATEGORIES
create table public.categories (
  slug text primary key,
  name text not null,
  emoji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger categories_updated_at before update on public.categories for each row execute function public.update_updated_at_column();

-- PRODUCTS
create table public.products (
  id text primary key,
  name text not null,
  price numeric(12,2) not null default 0,
  old_price numeric(12,2),
  stock integer not null default 0,
  image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  category text not null default '',
  description text not null default '',
  variants jsonb not null default '[]'::jsonb,
  rating numeric(3,2) not null default 0,
  is_new boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select using (true);
create policy "products admin write" on public.products for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger products_updated_at before update on public.products for each row execute function public.update_updated_at_column();

-- COUPONS
create table public.coupons (
  code text primary key,
  discount numeric(12,2) not null default 0,
  type text not null default 'percent',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.coupons to anon;
grant select, insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "coupons public read" on public.coupons for select using (true);
create policy "coupons admin write" on public.coupons for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger coupons_updated_at before update on public.coupons for each row execute function public.update_updated_at_column();

-- SITE SETTINGS
create table public.site_settings (
  id integer primary key default 1,
  site_config jsonb not null default '{}'::jsonb,
  payment_config jsonb not null default '{}'::jsonb,
  shipping_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "settings public read" on public.site_settings for select using (true);
create policy "settings admin write" on public.site_settings for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.update_updated_at_column();

-- ORDERS
create table public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  customer text not null default '',
  date date not null default current_date,
  total numeric(12,2) not null default 0,
  items integer not null default 0,
  status text not null default 'Aguardando Pagamento',
  email text,
  doc text,
  phone text,
  cep text,
  address text,
  payment text,
  subtotal numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  coupon_code text,
  lines jsonb not null default '[]'::jsonb,
  payment_confirmed boolean not null default false,
  value_confirmed boolean not null default false,
  invoice jsonb,
  history jsonb not null default '[]'::jsonb,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders own select" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "orders own insert" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "orders admin update" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "orders admin delete" on public.orders for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger orders_updated_at before update on public.orders for each row execute function public.update_updated_at_column();

-- SEED
insert into public.categories (slug, name, emoji) values
  ('audio','Áudio','🎧'),
  ('wearables','Wearables','⌚'),
  ('calcados','Calçados','👟'),
  ('acessorios','Acessórios','🎒');

insert into public.products (id, name, price, old_price, stock, image, gallery, category, description, variants, rating, is_new, featured) values
  ('p-001','Headphone Orion Studio ANC',1299.90,1699.90,24,'/assets/p1.jpg','[]','audio','Cancelamento ativo de ruído híbrido, 40h de bateria e drivers de 40mm com áudio hi-res certificado.','["Preto","Grafite","Areia"]',4.9,false,true),
  ('p-002','Smartwatch Orion Pulse 2',899.00,1099.00,15,'/assets/p2.jpg','[]','wearables','Tela AMOLED 1.9”, GPS integrado, monitor cardíaco contínuo e resistência à água 5ATM.','["42mm","46mm"]',4.7,true,true),
  ('p-003','Tênis Orion Cloud Runner',549.90,null,38,'/assets/p3.jpg','[]','calcados','Entressola em espuma de alta resposta e cabedal em malha respirável ultraleve.','["38","39","40","41","42","43"]',4.8,true,true),
  ('p-004','Fone In-Ear Orion Air Mini',399.90,499.90,52,'/assets/p1.jpg','[]','audio','True wireless com estojo de carga rápida e modo transparência.','["Branco","Preto"]',4.5,false,true),
  ('p-005','Pulseira Fitness Orion Band',249.00,null,60,'/assets/p2.jpg','[]','wearables','Monitoramento de sono, 14 dias de bateria e mais de 60 modos esportivos.','["P","M","G"]',4.3,false,false),
  ('p-006','Tênis Orion Street Low',429.90,529.90,0,'/assets/p3.jpg','[]','calcados','Silhueta clássica em couro premium com solado emborrachado antiderrapante.','["38","39","40","41","42"]',4.6,false,false),
  ('p-007','Mochila Orion Daily 22L',319.90,null,27,'/assets/p1.jpg','[]','acessorios','Compartimento acolchoado para notebook 16”, tecido impermeável e porta USB.','["Cinza","Preto"]',4.4,true,false),
  ('p-008','Carregador Orion GaN 65W',189.90,null,90,'/assets/p2.jpg','[]','acessorios','Três portas, tecnologia GaN compacta e carregamento inteligente multiplataforma.','["Único"]',4.7,false,false);

insert into public.site_settings (id, site_config, payment_config, shipping_config) values (
  1,
  '{}'::jsonb,
  '{"pixEnabled":true,"pixKey":"CNPJ 12.345.678/0001-90","cardEnabled":true,"gatewayKey":"pk_test_12345"}'::jsonb,
  '{"fixedRate":24.90,"freeShippingThreshold":299.00}'::jsonb
);