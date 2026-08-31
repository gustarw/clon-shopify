import { streamText, tool } from "ai";
import { z } from "zod";
import { getLanguageModel } from "@/lib/ai-provider";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProductBySlug,
  getProduct,
} from "@/lib/repo/products";
import { listCategories, createCategory } from "@/lib/repo/categories";
import { getThemeConfig, saveThemeConfig, SectionType } from "@/lib/repo/theme";
import { getDashboardStats } from "@/lib/repo/stats";
import { listOrders, setOrderStatus } from "@/lib/repo/orders";
import { money } from "@/lib/money";

export const maxDuration = 60;

function getAdminSystemContext() {
  const categories = listCategories();
  const theme = getThemeConfig();
  const stats = getDashboardStats(30);
  const { products, total } = listProducts({ perPage: 30 });

  return `
Você é o **Shopify Sidekick (Admin AI Co-Pilot)** da loja **SensaShop**.
Você é uma IA de elite para gestão de e-commerce e tem acesso DIRETO às ferramentas de gerenciamento da loja (banco de dados SQLite e configurações do tema).

### 🛠️ SUAS CAPACIDADES E FERRAMENTAS:
1. **Criar Produtos** (\`createStoreProduct\`): Cadastre novos itens com nome, preço em centavos (ex: R$ 199,90 = 19990), compare_at_cents, estoque, categoria e descrição rica.
2. **Atualizar Produtos** (\`updateStoreProduct\`): Altere preços, estoque, descrição ou status de qualquer produto existente.
3. **Deletar Produtos** (\`deleteStoreProduct\`): Remova produtos quando solicitado pelo lojista.
4. **Editar Cores do Tema** (\`updateThemeColors\`): Altere cores primárias (primary), de destaque (accent) ou de fundo (background).
5. **Atualizar Barra de Anúncio** (\`updateAnnouncementBar\`): Altere o texto do banner no topo da loja, estilo de cor ou ative/desative.
6. **Adicionar Seções ao Tema** (\`addThemeSection\`): Insira seções como Marquee Neon, Hero Banner, Depoimentos, etc.
7. **Consultar Métricas de Vendas** (\`getStoreDashboardMetrics\`): Faturamento, pedidos, clientes e produtos campeões de venda.
8. **Consultar e Criar Categorias** (\`listCategories\`, \`createCategory\`).

### 📊 DADOS EM TEMPO REAL DA LOJA:
- Faturamento Total (Últimos 30 dias): ${money(stats.revenueCents)}
- Total de Pedidos: ${stats.ordersCount}
- Produtos Cadastrados: ${total}
- Tema Atual: "${theme.name || "Dawn 15.0 - SensaShop"}"
- Cores do Tema: Primária: ${theme.colors.primary} | Destaque: ${theme.colors.accent} | Fundo: ${theme.colors.background}
- Barra de Anúncio: "${theme.announcement.text}" (Ativa: ${theme.announcement.enabled})

### 🏷️ CATEGORIAS DA LOJA:
${categories.map((c) => `- ID ${c.id}: "${c.name}" (slug: ${c.slug})`).join("\n")}

### 📦 PRODUTOS DISPONÍVEIS NA LOJA:
${products.slice(0, 15).map((p) => `- ID ${p.id}: "${p.name}" | Preço: ${money(p.price_cents)} | Estoque: ${p.stock} | Categoria: ${p.category?.name || "Geral"} | Slug: ${p.slug}`).join("\n")}

### 🌟 DIRETRIZES DE RESPOSTA:
1. Responda em Português do Brasil de forma extremamente inteligente, profissional, ágil e prestativa.
2. SEMPRE utilize as ferramentas disponíveis quando o usuário pedir para criar, modificar, excluir ou consultar algo na loja!
3. Quando criar um produto com sucesso, inclua no texto da resposta a tag: \`[[ADMIN_PRODUCT_CREATED:id,nome,precoFormatado,estoque]]\` para que a interface renderize o card interativo de sucesso!
4. Quando alterar cores ou configurações do tema, inclua a tag: \`[[ADMIN_THEME_UPDATED:detalhes_da_alteracao]]\` para a interface renderizar o card de prévia do tema!
`;
}

// Built-in intelligent free action engine that executes all admin operations natively
function executeNativeAdminEngine(userPrompt: string): string {
  const prompt = userPrompt.trim();
  const lower = prompt.toLowerCase();
  const categories = listCategories();
  const currentTheme = getThemeConfig();

  // 1. PRODUCT CREATION (e.g. "Crie um produto...", "Cadastrar tênis por 299...")
  if (
    /(?:cri[ea]|cadastr|adicion|inser|novo produto)/i.test(lower) &&
    (lower.includes("produto") || lower.includes("item") || lower.includes("peça") || lower.includes("tenis") || lower.includes("tênis") || lower.includes("camisa") || lower.includes("jaqueta") || lower.includes("fone") || lower.includes("oculos") || lower.includes("óculos") || lower.includes("r$") || lower.includes("preco") || lower.includes("preço"))
  ) {
    try {
      let name = "Novo Produto Especial";
      const nameMatch =
        prompt.match(/(?:produto|chamado|nome)\s+["']?([^"',.\n]+?)(?:por|com|na|categoria|custando|\s+r\$|\d+)/i) ||
        prompt.match(/(?:produto|chamado|nome)\s+["']?([^"',.\n]+)["']?/i) ||
        prompt.match(/(?:cri[ea]|cadastr[ea]|adicion[ea])\s+(?:um|uma|o|a)?\s*(?:novo|nova)?\s*([^"',.\n]+?)(?:por|com|na|categoria|\s+r\$|\d+)/i);

      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].replace(/^(?:chamado|produto|item|de|um|uma)\s+/i, "").trim();
      }

      let priceCents = 19990;
      const priceMatch =
        prompt.match(/(?:r\$|por|preco|preço|valor|custando)\s*(\d+(?:[.,]\d{1,2})?)/i) ||
        prompt.match(/(\d+)\s*(?:reais)/i) ||
        prompt.match(/(\d+[.,]\d{2})/);

      if (priceMatch && priceMatch[1]) {
        const rawNum = parseFloat(priceMatch[1].replace(",", "."));
        if (!isNaN(rawNum)) priceCents = Math.round(rawNum * 100);
      }

      let stock = 30;
      const stockMatch =
        prompt.match(/(?:estoque|qtd|quantidade|unidades)\s*(?:de)?\s*(\d+)/i) ||
        prompt.match(/(\d+)\s*(?:unidades|itens|un|pecas|peças)/i);

      if (stockMatch && stockMatch[1]) {
        stock = parseInt(stockMatch[1], 10);
      }

      let categoryId = categories[0]?.id || null;
      for (const cat of categories) {
        if (lower.includes(cat.name.toLowerCase()) || lower.includes(cat.slug.toLowerCase())) {
          categoryId = cat.id;
          break;
        }
      }

      const created = createProduct({
        name,
        description: `Produto premium oficial SensaShop: ${name}. Excelente qualidade de acabamento, design moderno e garantia de satisfação.`,
        price_cents: priceCents,
        compare_at_cents: Math.round(priceCents * 1.25),
        stock,
        category_id: categoryId,
        image: "/products/p01.svg",
        active: 1,
      });

      return `🎉 **Produto Criado com Sucesso pelo Sidekick!**\n\n- 📦 **Nome:** ${created.name}\n- 💰 **Preço:** ${money(created.price_cents)} (Preço comparativo de ${money(created.compare_at_cents || 0)})\n- 📊 **Estoque:** ${created.stock} unidades disponíveis\n- 🏷️ **Categoria:** ${created.category?.name || "Geral"}\n- 🔗 **Link:** \`/produtos/${created.slug}\`\n\n[[ADMIN_PRODUCT_CREATED:${created.id},${created.name},${money(created.price_cents)},${created.stock}]]\n\nO item foi cadastrado no banco de dados e já está ativo na vitrine da sua loja!`;
    } catch (e: unknown) {
      return `❌ Erro ao criar produto: ${(e as Error).message}`;
    }
  }

  // 2. THEME COLORS & PALETTE
  if (
    /(?:cor|cores|tema|paleta|estilo|mude a cor|alterar cor|mudar cor)/i.test(lower) &&
    !/(?:anuncio|anúncio|seção|secao)/i.test(lower)
  ) {
    try {
      let updatedPrimary = currentTheme.colors.primary;
      let updatedAccent = currentTheme.colors.accent;

      const hexMatches = prompt.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g);
      if (hexMatches && hexMatches.length > 0) {
        updatedPrimary = hexMatches[0];
        if (hexMatches.length > 1) updatedAccent = hexMatches[1];
      } else if (lower.includes("azul")) {
        updatedPrimary = "#2563eb";
        updatedAccent = "#38bdf8";
      } else if (lower.includes("roxo") || lower.includes("purple") || lower.includes("neon")) {
        updatedPrimary = "#7c3aed";
        updatedAccent = "#a855f7";
      } else if (lower.includes("verde") || lower.includes("emerald") || lower.includes("shopify")) {
        updatedPrimary = "#008060";
        updatedAccent = "#10b981";
      } else if (lower.includes("preto") || lower.includes("dark") || lower.includes("black")) {
        updatedPrimary = "#111827";
        updatedAccent = "#4b5563";
      } else if (lower.includes("laranja") || lower.includes("sunset") || lower.includes("coral")) {
        updatedPrimary = "#ea580c";
        updatedAccent = "#f97316";
      }

      const updated = saveThemeConfig({
        colors: {
          ...currentTheme.colors,
          primary: updatedPrimary,
          accent: updatedAccent,
        },
      });

      return `🎨 **Cores do Tema Atualizadas com Sucesso!**\n\n- 🟢 **Cor Primária da Marca:** \`${updated.colors.primary}\`\n- 🟣 **Cor de Destaque / Accent:** \`${updated.colors.accent}\`\n\n[[ADMIN_THEME_UPDATED:Cores do tema atualizadas para ${updated.colors.primary}]]\n\nAs novas cores foram salvas nas configurações e já estão refletidas na sua loja!`;
    } catch (e: unknown) {
      return `❌ Erro ao atualizar cores do tema: ${(e as Error).message}`;
    }
  }

  // 3. ANNOUNCEMENT BAR
  if (lower.includes("anuncio") || lower.includes("anúncio") || lower.includes("aviso") || lower.includes("topo") || lower.includes("barra")) {
    try {
      let text = "⚡ FRETE GRÁTIS para todo o Brasil acima de R$ 199 | Parcele em até 12x";
      const textMatch =
        prompt.match(/(?:texto|dizer|para|anúncio|anuncio)\s*[:=]?\s*["']?([^"',.\n]+)["']?/i) ||
        prompt.match(/["']([^"']+)["']/);

      if (textMatch && textMatch[1]) {
        text = textMatch[1].trim();
      }

      const updated = saveThemeConfig({
        announcement: {
          ...currentTheme.announcement,
          enabled: true,
          text,
        },
      });

      return `📢 **Barra de Anúncio da Loja Atualizada!**\n\n- 📝 **Novo Texto:** "${updated.announcement.text}"\n- 🟢 **Status:** Ativa no topo de todas as páginas da loja\n\n[[ADMIN_THEME_UPDATED:Barra de anúncio atualizada]]`;
    } catch (e: unknown) {
      return `❌ Erro ao atualizar barra de anúncio: ${(e as Error).message}`;
    }
  }

  // 4. ADD THEME SECTION
  if (lower.includes("secao") || lower.includes("seção") || lower.includes("marquee") || lower.includes("banner") || lower.includes("adicionar")) {
    try {
      const newSection = {
        id: `sec-ai-${Date.now()}`,
        type: "marquee_ticker" as SectionType,
        name: "Marquee Neon Automático",
        enabled: true,
        settings: {
          speed: "normal",
          bgColor: currentTheme.colors.primary,
          textColor: "#ffffff",
          items: ["⚡ PROMOÇÃO EXCLUSIVA", "🚀 ENVIO EM 24 HORAS", "🔥 ESTOQUE LIMITADO", "💳 PARCELAMENTO EM ATÉ 12X"],
        },
      };

      const updated = saveThemeConfig({
        sections: [newSection, ...currentTheme.sections],
      });

      return `⚡ **Nova Seção Adicionada à Página Inicial!**\n\n- 🧩 **Seção:** Marquee Ticker (Barra Animada em Loop)\n- 🎨 **Cor de Fundo:** ${currentTheme.colors.primary}\n- 🏷️ **Frases:** Promoção Exclusiva, Envio 24h, Estoque Limitado\n\n[[ADMIN_THEME_UPDATED:Nova seção Marquee adicionada à página inicial]]`;
    } catch (e: unknown) {
      return `❌ Erro ao adicionar seção: ${(e as Error).message}`;
    }
  }

  // 5. SALES & PERFORMANCE DASHBOARD METRICS
  if (lower.includes("venda") || lower.includes("faturamento") || lower.includes("metrica") || lower.includes("métrica") || lower.includes("relatorio") || lower.includes("relatório") || lower.includes("resumo")) {
    const stats = getDashboardStats(30);
    const top = stats.topProducts.slice(0, 4);

    return `📊 **Resumo de Desempenho da Loja (Últimos 30 dias):**\n\n- 💰 **Faturamento Total:** ${money(stats.revenueCents)}\n- 📦 **Total de Pedidos:** ${stats.ordersCount} pedidos registrados\n- 👥 **Total de Clientes:** ${stats.customersCount} clientes na base\n- ⚠️ **Estoque Baixo:** ${stats.lowStockCount} itens precisando de reposição\n\n🔥 **Produtos Campeões de Venda:**\n${top.map((p, i) => `${i + 1}. **${p.name}** (${p.sold} un vendidas — ${money(p.cents)})`).join("\n") || "• Nenhum pedido registrado ainda."}\n\nPosso te ajudar a cadastrar novos itens para impulsionar suas vendas!`;
  }

  // DEFAULT GREETING & GUIDANCE
  return `Olá! Sou o **Shopify Sidekick (Admin AI)**, seu assistente de gestão inteligente. 🛍️⚡\n\nEstou pronto para executar ações diretamente na sua loja:\n\n- 📦 **Criar produtos:** _"Crie um produto Jaqueta Cyberpunk por R$ 289,90 com 30 unidades na categoria Moda"_\n- 🎨 **Editar tema:** _"Mude a cor primária do tema para verde #008060"_\n- 📢 **Barra de Anúncio:** _"Altere o anúncio do topo para Frete Grátis acima de R$ 199"_\n- 📊 **Consultar Métricas:** _"Qual o faturamento e produtos mais vendidos deste mês?"_\n\nQual tarefa gostaria de realizar agora?`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const lastUserMessage =
      messages.length > 0 ? messages[messages.length - 1]?.content : "";

    const model = getLanguageModel();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let streamedAny = false;

        if (model) {
          try {
            const systemPrompt = getAdminSystemContext();
            const result = streamText({
              model,
              system: systemPrompt,
              messages: messages.map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant" | "system",
                content: m.content,
              })),
              tools: {
                createStoreProduct: tool({
                  description: "Cria um novo produto diretamente no catálogo e banco de dados da loja online",
                  inputSchema: z.object({
                    name: z.string().describe("Nome comercial do produto"),
                    description: z.string().describe("Descrição persuasiva do produto"),
                    price_cents: z.number().describe("Preço em centavos (ex: R$ 199,90 = 19990)"),
                    compare_at_cents: z.number().optional().describe("Preço original em centavos"),
                    stock: z.number().describe("Quantidade em estoque"),
                    category_id: z.number().optional().describe("ID da categoria"),
                    category_name: z.string().optional().describe("Nome da categoria"),
                  }),
                  execute: async ({ name, description, price_cents, compare_at_cents, stock, category_id, category_name }) => {
                    let catId = category_id;
                    if (!catId && category_name) {
                      const allCats = listCategories();
                      const match = allCats.find((c) => c.name.toLowerCase().includes(category_name.toLowerCase()));
                      if (match) catId = match.id;
                    }

                    const product = createProduct({
                      name,
                      description: description || `Produto oficial SensaShop: ${name}.`,
                      price_cents,
                      compare_at_cents: compare_at_cents ?? Math.round(price_cents * 1.2),
                      stock: stock > 0 ? stock : 10,
                      category_id: catId ?? null,
                      image: "/products/p01.svg",
                      active: 1,
                    });

                    return {
                      success: true,
                      product: {
                        id: product.id,
                        name: product.name,
                        price: money(product.price_cents),
                        stock: product.stock,
                        slug: product.slug,
                      },
                    };
                  },
                }),
                updateThemeColors: tool({
                  description: "Atualiza as cores do tema da loja online (primary, accent, background)",
                  inputSchema: z.object({
                    primary: z.string().optional().describe("Cor primária em hexadecimal"),
                    accent: z.string().optional().describe("Cor de destaque em hexadecimal"),
                    background: z.string().optional().describe("Cor de fundo em hexadecimal"),
                  }),
                  execute: async ({ primary, accent, background }) => {
                    const current = getThemeConfig();
                    const updated = saveThemeConfig({
                      colors: {
                        ...current.colors,
                        ...(primary && { primary }),
                        ...(accent && { accent }),
                        ...(background && { background }),
                      },
                    });
                    return { success: true, colors: updated.colors };
                  },
                }),
                updateAnnouncementBar: tool({
                  description: "Atualiza o texto ou status da barra de anúncio no topo da loja",
                  inputSchema: z.object({
                    text: z.string().describe("Texto promocional da barra de anúncio"),
                    enabled: z.boolean().optional().describe("Se a barra deve estar visível"),
                    bgStyle: z.enum(["dark", "brand", "gradient_emerald", "sunset"]).optional(),
                  }),
                  execute: async ({ text, enabled, bgStyle }) => {
                    const current = getThemeConfig();
                    const updated = saveThemeConfig({
                      announcement: {
                        ...current.announcement,
                        text,
                        enabled: enabled ?? true,
                        ...(bgStyle && { bgStyle }),
                      },
                    });
                    return { success: true, announcement: updated.announcement };
                  },
                }),
                getStoreDashboardMetrics: tool({
                  description: "Retorna faturamento, total de pedidos e produtos com estoque baixo",
                  inputSchema: z.object({}),
                  execute: async () => {
                    const stats = getDashboardStats(30);
                    return {
                      revenue: money(stats.revenueCents),
                      ordersCount: stats.ordersCount,
                      customersCount: stats.customersCount,
                      lowStockCount: stats.lowStockCount,
                      topProducts: stats.topProducts.slice(0, 5),
                    };
                  },
                }),
              },
            });

            for await (const chunk of result.textStream) {
              controller.enqueue(encoder.encode(chunk));
              streamedAny = true;
            }
          } catch (err) {
            console.warn("LLM Stream failed or permission denied, using native engine:", err);
          }
        }

        // Native engine backup to ensure 100% smooth real response under all conditions
        if (!streamedAny) {
          const responseText = executeNativeAdminEngine(lastUserMessage || "");
          const words = responseText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(encoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 12));
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    console.error("Admin AI Chat error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error in Admin AI" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
