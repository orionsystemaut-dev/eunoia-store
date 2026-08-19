import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env
const envPath = path.resolve('.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const mockProducts = [
  {
    id: "prod-1",
    name: "iPhone 17 Pro Max 512GB Titânio Espacial",
    description: "O mais novo lançamento da Apple com chip A19 Pro, corpo em titânio e sistema de câmeras revoluncionário.",
    price: 11499.00,
    old_price: 13999.00,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop",
    category: "smartphones",
    stock: 12,
    rating: 5.0,
    is_new: true,
  },
  {
    id: "prod-2",
    name: "MacBook Pro M3 Max 16 polegadas 1TB",
    description: "O notebook mais poderoso para profissionais criativos, agora com a geração M3 Max.",
    price: 24999.00,
    old_price: null,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    category: "notebooks",
    stock: 5,
    rating: 4.9,
    is_new: false,
  },
  {
    id: "prod-3",
    name: "Apple Watch Ultra 2 Titânio",
    description: "O relógio definitivo para esportes radicais, com a tela mais brilhante já feita pela Apple.",
    price: 6499.00,
    old_price: 7299.00,
    image: "https://images.unsplash.com/photo-1617043786539-204122d25081?q=80&w=800&auto=format&fit=crop",
    category: "smartwatches",
    stock: 8,
    rating: 4.8,
    is_new: true,
  },
  {
    id: "prod-4",
    name: "AirPods Pro 2ª Geração com USB-C",
    description: "Cancelamento de ruído ativo 2x melhor e áudio adaptativo para o dia a dia.",
    price: 2199.00,
    old_price: 2599.00,
    image: "https://images.unsplash.com/photo-1606220838315-056192d5e927?q=80&w=800&auto=format&fit=crop",
    category: "acessorios",
    stock: 25,
    rating: 4.7,
    is_new: false,
  },
  {
    id: "prod-5",
    name: "Samsung Galaxy S24 Ultra 1TB Titanium",
    description: "O poder do Galaxy AI em suas mãos. Câmera de 200MP e caneta S Pen inclusa.",
    price: 9999.00,
    old_price: 10999.00,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop",
    category: "smartphones",
    stock: 3,
    rating: 4.9,
    is_new: true,
  },
  {
    id: "prod-6",
    name: "iPad Pro M4 13\" OLED 512GB",
    description: "Espessura inacreditável com a melhor tela já feita para um tablet, processador M4.",
    price: 14299.00,
    old_price: null,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
    category: "tablets",
    stock: 6,
    rating: 5.0,
    is_new: true,
  }
];

async function seed() {
  console.log("Inserindo produtos na nuvem...");
  const { data, error } = await supabase.from('products').insert(mockProducts);
  
  if (error) {
    console.error("Erro ao inserir:", error);
  } else {
    console.log("Produtos inseridos com sucesso!");
  }
}

seed();
