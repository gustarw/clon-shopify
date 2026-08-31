import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.SUPABASE_URL || "https://gnxcszxwrsiyoozkqzky.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_s9MUHFF2DTsy5vPkS8zviA_mSjCGmhP";

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("Connecting to Supabase at:", supabaseUrl);

  // 1. Seed Admin User
  const passwordHash = await bcrypt.hash("admin123", 10);
  const { data: existingUser, error: userCheckErr } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", "admin@sensashop.com")
    .maybeSingle();

  if (userCheckErr) {
    console.error("Note checking users table:", userCheckErr.message);
  } else if (!existingUser) {
    console.log("Creating default admin user...");
    const { error: insertUserErr } = await supabase.from("users").insert({
      name: "Administrador",
      email: "admin@sensashop.com",
      password_hash: passwordHash,
      role: "admin",
    });
    if (insertUserErr) console.error("Error inserting admin:", insertUserErr.message);
    else console.log("Admin user created: admin@sensashop.com / admin123");
  } else {
    console.log("Admin user already exists.");
  }

  // 2. Seed Categories
  const categories = [
    { name: "Eletrônicos", slug: "eletronicos", description: "Smartphones, notebooks e acessórios high-tech" },
    { name: "Moda & Estilo", slug: "moda", description: "Roupas, calçados e vestuário contemporâneo" },
    { name: "Casa & Decoração", slug: "casa-decoracao", description: "Móveis e utilidades para o lar" },
    { name: "Esportes & Fitness", slug: "esportes", description: "Equipamentos de alta performance" },
    { name: "Beleza & Cuidados", slug: "beleza", description: "Cosméticos, skincare e perfumes" },
  ];

  for (const cat of categories) {
    const { data: existingCat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", cat.slug)
      .maybeSingle();

    if (!existingCat) {
      await supabase.from("categories").insert(cat);
      console.log(`Inserted category: ${cat.name}`);
    }
  }

  // 3. Seed Products
  const { data: allCats } = await supabase.from("categories").select("id, slug");
  const catMap = new Map((allCats || []).map((c) => [c.slug, c.id]));

  const products = [
    {
      name: "Smartphone Galaxy S24 Ultra 512GB",
      slug: "smartphone-galaxy-s24-ultra",
      description: "Câmera de 200MP, inteligência artificial integrada Galaxy AI e tela Dynamic AMOLED 2X de 6.8 polegadas.",
      price_cents: 649900,
      compare_at_cents: 799900,
      image: "/products/default.svg",
      stock: 25,
      category_id: catMap.get("eletronicos") || null,
      active: 1,
    },
    {
      name: "Notebook Dell XPS 14 Core Ultra 7",
      slug: "notebook-dell-xps-14",
      description: "Design ultrafino premium em alumínio usinado, 32GB RAM e bateria de longa duração para profissionais exigentes.",
      price_cents: 1199900,
      compare_at_cents: 1349900,
      image: "/products/default.svg",
      stock: 12,
      category_id: catMap.get("eletronicos") || null,
      active: 1,
    },
    {
      name: "Fone Bluetooth Noise Cancelling Pro",
      slug: "fone-bluetooth-noise-cancelling",
      description: "Cancelamento ativo de ruído de última geração, áudio espacial imersivo e autonomia de 30 horas.",
      price_cents: 89900,
      compare_at_cents: 119900,
      image: "/products/default.svg",
      stock: 45,
      category_id: catMap.get("eletronicos") || null,
      active: 1,
    },
    {
      name: "Smartwatch Ultra Titanium GPS",
      slug: "smartwatch-ultra-titanium-gps",
      description: "Caixa em titânio aeroespacial, monitoramento cardíaco contínuo e resistência militar à água de até 100m.",
      price_cents: 249900,
      compare_at_cents: 299900,
      image: "/products/default.svg",
      stock: 18,
      category_id: catMap.get("eletronicos") || null,
      active: 1,
    },
  ];

  for (const prod of products) {
    const { data: existingProd } = await supabase
      .from("products")
      .select("id")
      .eq("slug", prod.slug)
      .maybeSingle();

    if (!existingProd) {
      await supabase.from("products").insert(prod);
      console.log(`Inserted product: ${prod.name}`);
    }
  }

  console.log("Supabase seed check completed successfully.");
}

main().catch((err) => {
  console.error("Seed script failed:", err);
});
