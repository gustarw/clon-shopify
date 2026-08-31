import JSZip from "jszip";
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

async function generateSampleShopifyZip() {
  const zip = new JSZip();

  // config/settings_schema.json
  const schema = [
    {
      name: "theme_info",
      theme_name: "Dawn 15 Pro",
      theme_version: "15.2.0",
      theme_author: "Shopify Official",
    },
  ];
  zip.file("config/settings_schema.json", JSON.stringify(schema, null, 2));

  // config/settings_data.json
  const settingsData = {
    current: {
      colors_solid_button_labels: "#008060",
      colors_accent_1: "#10b981",
      colors_background_1: "#f6f6f7",
      colors_background_2: "#ffffff",
      colors_text: "#1a1c1d",
      colors_outline_button_labels: "#e1e3e5",
      type_header_font: "plus_jakarta_sans_n7",
      type_body_font: "inter_n4",
      type_body_base_size: 16,
      page_width: 1280,
      social_instagram_link: "https://instagram.com",
      social_whatsapp_link: "https://whatsapp.com",
      announcement_bar_enabled: true,
      announcement_text: "⚡ FRETE GRÁTIS ACIMA DE R$ 199 | PARCELAMENTO EM ATÉ 12X",
      logo_text: "SensaShop",
    },
  };
  zip.file("config/settings_data.json", JSON.stringify(settingsData, null, 2));

  // sections/header-group.json (Shopify OS 2.0 Header Group)
  const headerGroup = {
    name: "Header Group",
    type: "header",
    sections: {
      announcementSection: {
        type: "announcement-bar",
        settings: {
          show_announcement: true,
          badge: "OFERTA",
          link_text: "Ver Ofertas",
          link: "/produtos",
        },
        blocks: {
          ann_1: {
            type: "announcement",
            settings: {
              text: "⚡ FRETE GRÁTIS ACIMA DE R$ 199 | PARCELAMENTO EM ATÉ 12X",
              link: "/produtos",
            },
          },
        },
      },
      headerSection: {
        type: "header",
        settings: {
          logo_text: "Dawn Store",
          logo_badge: "Pro",
          sticky_header_type: "always",
          search_placeholder: "O que você procura hoje?",
          menu_links: [
            { label: "Todos os Produtos", href: "/produtos" },
            { label: "Eletrônicos VIP", href: "/produtos?categoria=eletronicos" },
            { label: "Moda & Estilo", href: "/produtos?categoria=moda" },
            { label: "Lançamentos", href: "/produtos?ordem=recentes" },
          ],
        },
      },
    },
    order: ["announcementSection", "headerSection"],
  };
  zip.file("sections/header-group.json", JSON.stringify(headerGroup, null, 2));

  // sections/footer-group.json (Shopify OS 2.0 Footer Group)
  const footerGroup = {
    name: "Footer Group",
    type: "footer",
    sections: {
      footerSection: {
        type: "footer",
        settings: {
          copyright: "© 2026 Dawn Store. Todos os direitos reservados.",
          tagline: "Design exclusivo e experiência de compras completa com tecnologia Shopify OS 2.0.",
          payment_enable: true,
          newsletter_enable: true,
          contact_email: "contato@dawnstore.com.br",
          contact_phone: "+55 11 98888-7777",
          contact_address: "Av. Faria Lima, 2000 — São Paulo, SP",
        },
        blocks: {
          col1: {
            type: "link_list",
            settings: {
              heading: "Departamentos",
              links: [
                { label: "Smartphones & Gadgets", href: "/produtos?categoria=eletronicos" },
                { label: "Coleção de Moda", href: "/produtos?categoria=moda" },
                { label: "Itens para Casa", href: "/produtos?categoria=casa-decoracao" },
              ],
            },
          },
          col2: {
            type: "link_list",
            settings: {
              heading: "Institucional",
              links: [
                { label: "Sobre a Dawn Store", href: "#" },
                { label: "Privacidade e Termos", href: "#" },
                { label: "Trabalhe Conosco", href: "#" },
              ],
            },
          },
        },
      },
    },
    order: ["footerSection"],
  };
  zip.file("sections/footer-group.json", JSON.stringify(footerGroup, null, 2));

  // templates/index.json
  const indexTemplate = {
    sections: {
      hero_banner: {
        type: "image-banner",
        settings: {
          heading: "Os melhores produtos com a qualidade que você confia",
          text: "Explore lançamentos selecionados a dedo com entrega rápida e garantia total de 30 dias.",
          button_label_1: "Ver Catálogo",
          button_link_1: "/produtos",
          button_label_2: "Ofertas da Semana",
          button_link_2: "/produtos",
          image_height: "large",
          image_overlay_opacity: 20,
        },
        blocks: {
          b1: { type: "heading", settings: { heading: "Os melhores produtos com a qualidade que você confia" } },
          b2: { type: "text", settings: { text: "Explore lançamentos selecionados a dedo com entrega rápida e garantia total." } },
          b3: { type: "buttons", settings: { button_label_1: "Ver Catálogo", button_link_1: "/produtos" } },
        },
        block_order: ["b1", "b2", "b3"],
      },
      marquee: {
        type: "marquee",
        settings: {
          speed: "normal",
        },
        blocks: {
          m1: { type: "item", settings: { text: "🚀 ENVIO RÁPIDO PARA TODO BRASIL" } },
          m2: { type: "item", settings: { text: "🔒 PAGAMENTO 100% SEGURO" } },
          m3: { type: "item", settings: { text: "💳 ATÉ 12X SEM JUROS" } },
          m4: { type: "item", settings: { text: "⭐ MAIS DE 10.000 CLIENTES SATISFEITOS" } },
        },
        block_order: ["m1", "m2", "m3", "m4"],
      },
      featured_products: {
        type: "featured-collection",
        settings: {
          title: "Mais Vendidos da Loja",
          products_to_show: 8,
        },
      },
      benefits: {
        type: "multicolumn",
        settings: {
          title: "Diferenciais Exclusivos",
        },
        blocks: {
          c1: { type: "column", settings: { title: "Frete Grátis", text: "Para compras acima de R$ 199" } },
          c2: { type: "column", settings: { title: "Até 12x Sem Juros", text: "Ou 5% de desconto no Pix" } },
          c3: { type: "column", settings: { title: "Compra Garantida", text: "30 dias para devolução grátis" } },
          c4: { type: "column", settings: { title: "Suporte 24/7", text: "Atendimento humanizado" } },
        },
        block_order: ["c1", "c2", "c3", "c4"],
      },
      image_with_text: {
        type: "image-with-text",
        settings: {
          heading: "Qualidade Premium Garantida",
          text: "Nossos produtos passam por rigoroso controle de qualidade para entregar o melhor para você.",
          button_label: "Conhecer Nossa História",
          button_link: "/produtos",
          image_position: "right",
        },
      },
      testimonials: {
        type: "testimonials",
        settings: {
          title: "Depoimentos dos Clientes",
        },
        blocks: {
          t1: { type: "quote", settings: { author: "Mariana Silva", location: "São Paulo, SP", quote: "Excelente loja! Entrega super pontual e produtos de primeiríssima." } },
          t2: { type: "quote", settings: { author: "Carlos Eduardo", location: "Belo Horizonte, MG", quote: "Experiência impecável. Recomendo a todos!" } },
        },
        block_order: ["t1", "t2"],
      },
      faq: {
        type: "faq",
        settings: {
          title: "Perguntas Frequentes",
        },
        blocks: {
          f1: { type: "item", settings: { question: "Qual o prazo de entrega?", answer: "De 2 a 7 dias úteis dependendo da sua região." } },
          f2: { type: "item", settings: { question: "Quais as formas de pagamento?", answer: "Cartão de crédito em até 12x, Pix com desconto e Boleto." } },
        },
        block_order: ["f1", "f2"],
      },
      newsletter: {
        type: "newsletter",
        settings: {
          heading: "Receba Nossas Ofertas Exclusivas",
          text: "Cadastre seu e-mail e ganhe 10% de desconto no primeiro pedido.",
        },
      },
    },
    order: [
      "hero_banner",
      "marquee",
      "featured_products",
      "benefits",
      "image_with_text",
      "testimonials",
      "faq",
      "newsletter",
    ],
  };
  zip.file("templates/index.json", JSON.stringify(indexTemplate, null, 2));

  // assets/base.css
  zip.file("assets/base.css", "/* Official Shopify Dawn CSS */\n:root { --font-body-scale: 1.0; }");

  const samplesDir = path.join(process.cwd(), "public", "samples");
  if (!existsSync(samplesDir)) {
    await fs.mkdir(samplesDir, { recursive: true });
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  await fs.writeFile(path.join(samplesDir, "shopify-dawn-sample.zip"), zipBuffer);

  console.log("✅ Pacote ZIP de exemplo gerado com sucesso em public/samples/shopify-dawn-sample.zip!");
}

generateSampleShopifyZip().catch(console.error);
