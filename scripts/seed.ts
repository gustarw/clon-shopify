/* Seeds the database with demo data. Run: npm run seed */
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "shop.db"));
db.pragma("foreign_keys = ON");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL,
  compare_at_cents INTEGER,
  image TEXT NOT NULL DEFAULT '/products/default.svg',
  stock INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_cents INTEGER NOT NULL,
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);
`;

db.exec("BEGIN");
db.exec(SCHEMA);

// Make seeding idempotent: clear previous demo data in FK-safe order.
db.exec("PRAGMA foreign_keys = OFF;");
db.exec("DELETE FROM order_items;");
db.exec("DELETE FROM orders;");
db.exec("DELETE FROM reviews;");
db.exec("DELETE FROM products;");
db.exec("DELETE FROM categories;");
db.exec("DELETE FROM users;");
db.exec("DELETE FROM sqlite_sequence;");
db.exec("PRAGMA foreign_keys = ON;");

const hash = (p: string) => bcrypt.hashSync(p, 10);

// node:sqlite's exec() ignores bound parameters, so all inserts go through prepare().run().
const ins = (sql: string, params: unknown[] = []) => db.prepare(sql).run(...(params as never[]));
const lastId = () => Number((db.prepare("SELECT last_insert_rowid() AS id").get() as { id: number }).id);
const count = (table: string) => Number((db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n);

ins("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
  ["Ana Souza", "admin@loja.com", hash("admin123"), "admin"]);
ins("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
  ["Bruno Lima", "bruno@email.com", hash("cliente123"), "customer"]);

const categories = [
  ["Eletrônicos", "Eletrônicos portáteis, som e acessórios para o dia a dia."],
  ["Moda", "Roupas e acessórios com estilo para todas as estações."],
  ["Casa & Decoração", "Itens para deixar seu lar mais bonito e funcional."],
  ["Esportes & Fitness", "Equipamentos para treinar com conforto e desempenho."],
  ["Livros", "Histórias e conhecimento para todas as idades."],
];
const catIds: number[] = [];
const catSlug: Record<string, number> = {};
for (const [name, desc] of categories) {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  ins("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)", [name, slug, desc]);
  const id = lastId();
  catIds.push(id);
  catSlug[slug] = id;
}

const products: Array<[string, string, number, number | null, number, string]> = [
  ["Fone Bluetooth AirSound Pro", "Fone de ouvido sem fio com cancelamento ativo de ruído e até 30h de bateria. Conforto premium para o dia inteiro.", 29990, 39990, 42, "eletronicos"],
  ["Smartwatch Pulse Fit", "Relógio inteligente com monitor de batimentos, GPS integrado e notificações. À prova d'água até 50m.", 45990, 59990, 28, "eletronicos"],
  ["Caixa de Som Portátil BoomGo", "Som 360° potente, à prova d'água e até 12h de reprodução. Leve para qualquer lugar.", 18990, null, 65, "eletronicos"],
  ["Notebook UltraSlim 14", "Notebook leve com processador de última geração, 16GB RAM e SSD de 512GB. Perfeito para trabalhar em qualquer lugar.", 429990, 499990, 8, "eletronicos"],
  ["Camiseta Essential Cotton", "Camiseta 100% algodão com caimento perfeito. Básica, confortável e atemporal.", 5990, 7990, 120, "moda"],
  ["Jaqueta Corta-Vento Storm", "Jaqueta impermeável e respirável, ideal para aventuras ao ar livre em qualquer clima.", 18990, 24990, 35, "moda"],
  ["Tênis Runner Pro", "Tênis de corrida com amortecimento responsivo e solado antiderrapante. Leveza para cada quilômetro.", 25990, 32990, 54, "moda"],
  ["Mochila Urban Explorer", "Mochila resistente à água com compartimento para notebook 15,6\" e múltiplos bolsos organizadores.", 14990, null, 47, "moda"],
  ["Luminária de Mesa Nordic", "Luminária minimalista com luz LED regulável e três níveis de intensidade. Design escandinavo.", 12990, 16990, 33, "casa-decoracao"],
  ["Jogo de Panelas Antiaderente 6 peças", "Conjunto de panelas antiaderentes com cabos de bambu. Distribuição uniforme de calor e fácil limpeza.", 34990, 44990, 19, "casa-decoracao"],
  ["Kit Organizadores de Gaveta 4 peças", "Organize suas gavetas com elegância. Conjunto de 4 caixas em tecido resistente com alças.", 7990, null, 72, "casa-decoracao"],
  ["Tapete de Meditação Zen", "Tapete acolchoado antiderrapante para yoga e meditação. Espuma de alta densidade.", 9990, 13990, 41, "casa-decoracao"],
  ["Halteres Ajustáveis 20kg", "Par de halteres ajustáveis até 20kg. Substituem um rack inteiro e economizam espaço na academia.", 59900, 79900, 12, "esportes-fitness"],
  ["Corda de Pular Speed Jump", "Corda com rolamentos de alta velocidade e cabos ajustáveis. Ideal para treino de alta intensidade.", 4990, null, 88, "esportes-fitness"],
  ["Mesa de Exercício Compacta", "Mesa de treino dobrável para treino de peito, costas e abdominais. Dobra para fácil armazenamento.", 21990, 27990, 16, "esportes-fitness"],
  ["Bandas de Resistência 5 níveis", "Kit de 5 bandagens elásticas com níveis progressivos de resistência. Treino completo em casa.", 6990, 8990, 95, "esportes-fitness"],
  ["O Poder do Hábito", "Best-seller que explica por que fazemos o que fazemos e como mudar nossos hábitos de forma duradoura.", 4990, 6990, 60, "livros"],
  ["Dom Casmurro", "Clássico da literatura brasileira de Machado de Assis. A saga de Bento Santiago em busca de verdade e amor.", 3490, null, 75, "livros"],
  ["Clean Code", "Guia essencial para desenvolvedores que desejam escrever código legível, testável e manutenível.", 7990, 9990, 44, "livros"],
  ["A Revolução dos Bichos", "Fábula política atemporal de George Orwell sobre poder, liberdade e a natureza da tirania.", 3990, 5490, 51, "livros"],
];

const prodIds: Record<string, number> = {};
products.forEach((p, i) => {
  const [name, desc, price, compare, stock, cat] = p;
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const created = new Date(Date.now() - (products.length - i) * 86400000 * 3).toISOString();
  ins(
    "INSERT INTO products (name, slug, description, price_cents, compare_at_cents, image, stock, category_id, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)",
    [name, slug, desc, price, compare, `/products/p${String(i + 1).padStart(2, "0")}.svg`, stock, catSlug[cat], created]
  );
  prodIds[slug] = lastId();
});

const reviewData: Array<[number, string, number, string, string]> = [
  [prodIds["fone-bluetooth-airsound-pro"], "Carlos M.", 5, "Melhor compra do ano! O cancelamento de ruído é absurdo e o conforto é impressionante.", "2026-07-12T10:00:00Z"],
  [prodIds["fone-bluetooth-airsound-pro"], "Juliana R.", 4, "Som excelente e bateria dura o prometido. Só achei a almofada um pouco firme no início.", "2026-07-28T15:30:00Z"],
  [prodIds["fone-bluetooth-airsound-pro"], "Roberto A.", 5, "Uso todo dia para trabalhar e a qualidade do áudio nas chamadas é nota dez.", "2026-08-05T09:15:00Z"],
  [prodIds["smartwatch-pulse-fit"], "Marina P.", 5, "O GPS é preciso e a tela fica legível mesmo sob sol forte. Recomendo demais!", "2026-08-01T11:00:00Z"],
  [prodIds["smartwatch-pulse-fit"], "Diego S.", 4, "Ótimo custo-benefício. O app poderia ter mais recursos de treino, mas cumpre bem o papel.", "2026-08-14T19:45:00Z"],
  [prodIds["camiseta-essential-cotton"], "Fernanda L.", 5, "Tecido macio, não desbota e a modelagem é perfeita. Já pedi mais três cores.", "2026-08-09T08:20:00Z"],
  [prodIds["camiseta-essential-cotton"], "Pedro H.", 4, "Bom tecido e ótimo caimento. A costura poderia ser um pouco mais reforçada.", "2026-08-20T14:00:00Z"],
  [prodIds["tenis-runner-pro"], "Larissa V.", 5, "Corri meia maratona com ele e zero bolhas. Amortecimento incrível.", "2026-08-18T07:30:00Z"],
  [prodIds["notebook-ultraslim-14"], "Thiago N.", 5, "Extremamente rápido e leve. Uso para edição de vídeo e roda perfeitamente.", "2026-08-03T16:00:00Z"],
  [prodIds["halteres-ajustaveis-20kg"], "André C.", 5, "Economizou muito espaço na minha academia caseira. Sistema de trava é firme e seguro.", "2026-08-11T13:00:00Z"],
  [prodIds["o-poder-do-habito"], "Camila B.", 5, "Livro transformador. A estrutura dos hábitos mudou completamente minha rotina.", "2026-08-07T20:00:00Z"],
  [prodIds["dom-casmurro"], "Victor T.", 5, "Tradução excelente e edição caprichada. Machado é eterno.", "2026-08-22T18:30:00Z"],
  [prodIds["luminaria-de-mesa-nordic"], "Renata F.", 4, "Linda e funcional. A luz quente fica ótima à noite.", "2026-08-16T10:45:00Z"],
  [prodIds["kit-organizadores-de-gaveta-4-pecas"], "Beatriz M.", 5, "Minhas gavetas ficaram organizadas como nunca. Tecido resistente e cheiroso.", "2026-08-24T12:00:00Z"],
  [prodIds["clean-code"], "Marcos D.", 5, "Livro obrigatório para qualquer dev. Reforçou muitos conceitos que eu tinha esquecido.", "2026-08-19T09:00:00Z"],
  [prodIds["corda-de-pular-speed-jump"], "Aline K.", 4, "Rolamentos muito rápidos e silenciosos. O cabo é ajustável, bom para iniciantes.", "2026-08-25T17:00:00Z"],
];

for (const [pid, author, rating, comment, created] of reviewData) {
  ins(
    "INSERT INTO reviews (product_id, user_id, author_name, rating, comment, created_at) VALUES (?, NULL, ?, ?, ?, ?)",
    [pid, author, rating, comment, created]
  );
}

// Historical orders for dashboard metrics.
const now = Date.now();
const day = 86400000;
const orderTemplates: Array<[string, number[]]> = [
  ["bruno@email.com", [1, 5]],
  ["bruno@email.com", [9]],
  ["maria@email.com", [3, 12]],
  ["pedro@email.com", [14]],
  ["carla@email.com", [7, 18]],
  ["bruno@email.com", [2]],
  ["joao@email.com", [16, 19]],
  ["ana@email.com", [11]],
  ["bruno@email.com", [6, 13]],
  ["lucia@email.com", [20]],
  ["ricardo@email.com", [4]],
  ["bruno@email.com", [8, 15]],
];

const cities = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Porto Alegre, RS", "Florianópolis, SC", "Salvador, BA", "Fortaleza, CE"];
orderTemplates.forEach(([email, itemNums], i) => {
  const userRow = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(email.toLowerCase()) as { id: number } | undefined;
  const userId = Number(userRow?.id || 0);
  const created = new Date(now - (i * 2.3 + 0.5) * day).toISOString();
  let total = 0;
  const items = itemNums.map((n) => {
    const p = db.prepare("SELECT id, name, price_cents FROM products WHERE id = ?").get(n) as { id: number; name: string; price_cents: number } | undefined;
    const qty = (i % 3) + 1;
    if (p) total += p.price_cents * qty;
    return { id: p?.id, name: p?.name || "Item", price: p?.price_cents || 0, qty };
  }).filter(Boolean) as { id: number; name: string; price: number; qty: number }[];

  const city = cities[i % cities.length];
  const [cityName] = city.split(", ");
  ins(
    `INSERT INTO orders (user_id, status, total_cents, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_country, email, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'Brasil', ?, ?)`,
    [userId || null, i % 7 === 0 ? "delivered" : i % 5 === 0 ? "shipped" : "paid", total, email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()), `${100 + i * 7}, Apt ${200 + i}`, cityName, `${50000 + i * 123}`, email.toLowerCase(), created]
  );
  const orderId = lastId();
  for (const it of items) {
    ins("INSERT INTO order_items (order_id, product_id, name, price_cents, quantity) VALUES (?, ?, ?, ?, ?)", [orderId, it.id, it.name, it.price, it.qty]);
  }
});

db.exec("COMMIT");

const counts = {
  categorias: count("categories"),
  produtos: count("products"),
  usuarios: count("users"),
  avaliacoes: count("reviews"),
  pedidos: count("orders"),
};

console.log("\nSeed concluído com sucesso!");
console.log(counts);
console.log("\nLogin admin:    admin@loja.com / admin123");
console.log("Login cliente:  bruno@email.com / cliente123\n");
