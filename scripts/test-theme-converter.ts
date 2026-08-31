import JSZip from "jszip";
import { importShopifyThemeFromZip } from "../src/lib/theme-importer/shopify-zip-extractor";

async function testShopifyConverter() {
  console.log("=== INICIANDO TESTE DO CONVERSOR DE TEMAS SHOPIFY LIQUID ===");

  const zip = new JSZip();

  // 1. settings_schema.json
  const settingsSchema = [
    {
      name: "theme_info",
      theme_name: "Spotlight Modern 2026",
      theme_version: "2.5.0",
      theme_author: "Shopify Official Team",
    },
  ];
  zip.file("config/settings_schema.json", JSON.stringify(settingsSchema, null, 2));

  // 2. settings_data.json
  const settingsData = {
    current: {
      colors_solid_button_labels: "#0284c7",
      colors_accent_1: "#38bdf8",
      colors_background_1: "#f8fafc",
      colors_background_2: "#ffffff",
      colors_text: "#0f172a",
      type_header_font: "outfit_n7",
      type_body_font: "inter_n4",
      type_body_base_size: 16,
      page_width: 1400,
      social_instagram_link: "https://instagram.com/sensashop",
      social_whatsapp_link: "https://wa.me/5511999999999",
      announcement_bar_enabled: true,
      announcement_text: "⚡ SUPER PROMOÇÃO DE INAUGURAÇÃO | ATÉ 50% OFF",
    },
  };
  zip.file("config/settings_data.json", JSON.stringify(settingsData, null, 2));

  // 2.1 sections/header-group.json
  const headerGroup = {
    name: "Header",
    type: "header",
    sections: {
      announcementSection: {
        type: "announcement-bar",
        settings: {
          show_announcement: true,
          badge: "EXCLUSIVO",
          link_text: "Ver Coleção",
          link: "/produtos",
        },
        blocks: {
          ann1: {
            type: "announcement",
            settings: {
              text: "⚡ FRETE GRÁTIS EM TODAS AS COMPRAS HOJE",
              link: "/produtos",
            },
          },
        },
      },
      headerSection: {
        type: "header",
        settings: {
          logo_text: "Spotlight Elite",
          logo_badge: "Store",
          search_placeholder: "Encontre seu produto ideal...",
          menu_links: [
            { label: "Lançamentos 2026", href: "/produtos?ordem=recentes" },
            { label: "Eletrônicos", href: "/produtos?categoria=eletronicos" },
            { label: "Moda & Estilo", href: "/produtos?categoria=moda" },
          ],
        },
      },
    },
  };
  zip.file("sections/header-group.json", JSON.stringify(headerGroup, null, 2));

  // 2.2 sections/footer-group.json
  const footerGroup = {
    name: "Footer",
    type: "footer",
    sections: {
      footerSection: {
        type: "footer",
        settings: {
          copyright: "© 2026 Spotlight Elite. Todos os direitos reservados.",
          tagline: "A melhor experiência em comércio eletrônico de alta performance.",
          contact_email: "sac@spotlightelite.com",
          contact_phone: "+55 11 3000-0000",
          contact_address: "Avenida das Américas, 5000 — Rio de Janeiro, RJ",
        },
        blocks: {
          col1: {
            type: "link_list",
            settings: {
              heading: "Coleções em Alta",
              links: [
                { label: "Smartphones", href: "/produtos?categoria=eletronicos" },
                { label: "Vestuário Premium", href: "/produtos?categoria=moda" },
              ],
            },
          },
        },
      },
    },
  };
  zip.file("sections/footer-group.json", JSON.stringify(footerGroup, null, 2));

  // 3. templates/index.json (OS 2.0)
  const indexTemplate = {
    sections: {
      image_banner_1: {
        type: "image-banner",
        settings: {
          heading: "Coleção de Verão Exclusiva",
          text: "Peças selecionadas com design sofisticado e envio imediato.",
          button_label_1: "Ver Catálogo Completo",
          button_link_1: "/produtos",
          image_height: "large",
          image_overlay_opacity: 25,
        },
        blocks: {
          b1: { type: "heading", settings: { heading: "Coleção de Verão Exclusiva" } },
          b2: { type: "text", settings: { text: "Peças selecionadas com design sofisticado." } },
          b3: {
            type: "buttons",
            settings: { button_label_1: "Ver Coleção", button_link_1: "/produtos" },
          },
        },
        block_order: ["b1", "b2", "b3"],
      },
      featured_collection_1: {
        type: "featured-collection",
        settings: {
          title: "Mais Vendidos da Temporada",
          products_to_show: 8,
          collection: "moda",
        },
      },
      multicolumn_1: {
        type: "multicolumn",
        settings: {
          title: "Nossos Diferenciais",
        },
        blocks: {
          c1: { type: "column", settings: { title: "Frete Grátis Brasil", text: "Acima de R$ 199" } },
          c2: { type: "column", settings: { title: "Parcele em até 12x", text: "Sem juros no cartão" } },
          c3: { type: "column", settings: { title: "Garantia Estendida", text: "30 dias para devolução" } },
          c4: { type: "column", settings: { title: "Suporte Especializado", text: "Atendimento 24 horas" } },
        },
        block_order: ["c1", "c2", "c3", "c4"],
      },
      testimonials_1: {
        type: "testimonials",
        settings: {
          title: "Avaliações de Clientes Reais",
        },
        blocks: {
          t1: {
            type: "quote",
            settings: {
              author: "Ana Beatriz",
              location: "Rio de Janeiro, RJ",
              quote: "Entrega super rápida e embalagem impecável!",
            },
          },
        },
        block_order: ["t1"],
      },
    },
    order: ["image_banner_1", "featured_collection_1", "multicolumn_1", "testimonials_1"],
  };
  zip.file("templates/index.json", JSON.stringify(indexTemplate, null, 2));

  // 4. assets/base.css
  zip.file("assets/base.css", "/* Base Shopify CSS */\n.shopify-section { margin-bottom: 2rem; }");

  // Generate buffer
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  console.log(`Buffer ZIP gerado com ${zipBuffer.length} bytes.`);

  // Test Conversion
  const result = await importShopifyThemeFromZip(zipBuffer, "Spotlight-Modern-Shopify.zip");

  console.log("\n=== RESULTADO DA CONVERSÃO ===");
  console.log("Sucesso:", result.success);
  console.log("Tema:", result.theme.name);
  console.log("Versão:", result.theme.version);
  console.log("Cores Extraídas:", result.theme.colors);
  console.log("Tipografia:", result.theme.typography);
  console.log("Seções Convertidas:", result.theme.sections.length);
  result.theme.sections.forEach((s, idx) => {
    console.log(`  [${idx + 1}] ID: ${s.id} | Tipo: ${s.type} | Nome: ${s.name}`);
  });

  console.log("Header Logo:", result.theme.header.logoText);
  console.log("Header Menu Links:", result.theme.header.menuLinks);
  console.log("Footer Contact Email:", result.theme.footer.contactEmail);
  console.log("Footer Columns:", result.theme.footer.columns);

  if (
    result.success &&
    result.theme.colors.primary === "#0284c7" &&
    result.theme.typography.headingFont === "Outfit" &&
    result.theme.sections.length === 4 &&
    result.theme.header.logoText === "Spotlight Elite" &&
    result.theme.header.menuLinks?.length === 3 &&
    result.theme.footer.contactEmail === "sac@spotlightelite.com" &&
    result.theme.footer.columns[0].title === "Coleções em Alta"
  ) {
    console.log("\n✅ TODOS OS TESTES DO CONVERSOR PASSARAM COM 100% DE SUCESSO!");
  } else {
    console.error("\n❌ FALHA NO TESTE");
    process.exit(1);
  }
}

testShopifyConverter().catch((err) => {
  console.error(err);
  process.exit(1);
});
