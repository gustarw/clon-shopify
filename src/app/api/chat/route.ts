import { streamText, tool } from "ai";
import { z } from "zod";
import { getLanguageModel } from "@/lib/ai-provider";
import { listProducts, getProductBySlug } from "@/lib/repo/products";
import { listCategories } from "@/lib/repo/categories";
import { getOrder } from "@/lib/repo/orders";
import { money } from "@/lib/money";

export const maxDuration = 30;

function getStoreContext() {
  const categories = listCategories();
  const { products } = listProducts({ perPage: 60 });

  const categoriesList = categories
    .map((c) => `- ${c.name} (slug: ${c.slug}): ${c.description || "Produtos selecionados"}`)
    .join("\n");

  const productsList = products
    .map(
      (p) =>
        `- [${p.name}] | Slug: ${p.slug} | Preço: ${money(p.price_cents)}${
          p.compare_at_cents ? ` (de ${money(p.compare_at_cents)})` : ""
        } | Estoque: ${p.stock} un | Categoria: ${p.category?.name || "Geral"} | Detalhes: ${p.description.slice(0, 120)}...`
    )
    .join("\n");

  return `
Você é o **SensaBot**, o Consultor de Compras e Assistente Virtual Oficial da loja **SensaShop**.
Seu objetivo é ser extremamente educado, prestativo, ágil, simpático e especialista em todos os produtos da loja, ajudando os clientes a encontrar os melhores itens, tirar dúvidas sobre frete, pagamentos, rastreamento de pedidos e recomendações.

### 🌟 DIRETRIZES DE ATENDIMENTO:
1. Responda em Português do Brasil (pt-BR) de forma calorosa, amigável, clara e profissional.
2. Quando recomendar produtos aos clientes, mencione seus destaques e SEMPRE inclua a tag especial \`[[PRODUCT:slug-do-produto]]\` no final ou junto da recomendação, pois o sistema renderizará automaticamente um card interativo com foto, preço e botão de adicionar ao carrinho!
3. Políticas da Loja SensaShop:
   - 🚚 **Frete Grátis**: Para todo o Brasil em compras acima de R$ 199,00.
   - 💳 **Pagamento**: Cartão de crédito em até 12x, PIX com aprovação imediata ou boleto bancário.
   - 🔒 **Segurança**: Compra 100% segura com criptografia 256-bit e garantia de 30 dias para trocas/devoluções.
   - ⚡ **Envio Rápido**: Postagem em até 24 horas úteis com código de rastreio por e-mail.
4. Utilize a ferramenta \`checkOrderStatus\` para consultar pedidos quando o cliente informar o número do pedido (#ID).
5. Seja proativo ao sugerir itens complementares ou promoções atrativas.

### 📂 CATEGORIAS DA LOJA:
${categoriesList}

### 📦 CATÁLOGO ATUAL DE PRODUTOS:
${productsList}
`;
}

function executeNativeStorefrontEngine(userPrompt: string): string {
  const lower = userPrompt.toLowerCase().trim();
  const { products } = listProducts({ perPage: 50 });
  const categories = listCategories();

  // 1. Shipping & Free shipping
  if (lower.includes("frete") || lower.includes("entrega") || lower.includes("prazo") || lower.includes("envio")) {
    return `🚚 **Informações de Frete e Entrega da SensaShop:**\n\n- ⚡ **Frete Grátis:** Válido para todo o Brasil em compras acima de **R$ 199,00**!\n- 📦 **Prazo de Postagem:** Despachamos todos os pedidos em até **24h úteis**.\n- 🕒 **Prazo de Entrega:** Varia entre 2 a 7 dias úteis conforme seu CEP (calculado automaticamente no checkout).\n- 🔒 **Rastreamento:** Código de rastreio enviado por e-mail após a postagem.\n\nQuer que eu recomende algum item para você garantir o Frete Grátis hoje?`;
  }

  // 2. Payments & Installments
  if (lower.includes("pagamento") || lower.includes("parcela") || lower.includes("pix") || lower.includes("cartao") || lower.includes("cartão") || lower.includes("boleto")) {
    return `💳 **Formas de Pagamento na SensaShop:**\n\n- ⚡ **PIX:** Aprovação imediata e 5% de desconto no checkout!\n- 💳 **Cartão de Crédito:** Em até **12x** (até 3x sem juros) com Visa, Mastercard, Elo e Amex.\n- 📄 **Boleto Bancário:** Compensação rápida em até 3 dias úteis.\n- 🔒 **Segurança Total:** Criptografia SSL 256-bit em todas as transações.`;
  }

  // 3. Order tracking
  const orderIdMatch = lower.match(/(?:pedido|order|id)\s*#?(\d+)/i) || lower.match(/#(\d+)/);
  if (orderIdMatch) {
    const orderId = parseInt(orderIdMatch[1], 10);
    try {
      const order = getOrder(orderId);
      if (order) {
        const statusMap: Record<string, string> = {
          pending: "⏳ Pendente",
          paid: "✅ Pago & Em Separação",
          shipped: "🚚 Enviado / Em Transporte",
          delivered: "🎁 Entregue com Sucesso",
          cancelled: "❌ Cancelado",
        };
        const itemsList = order.items.map((i) => `• ${i.quantity}x ${i.name} (${money(i.price_cents)})`).join("\n");
        return `📦 **Status do Pedido #${order.id}:**\n\n- **Status:** ${statusMap[order.status] || order.status}\n- **Destinatário:** ${order.shipping_name}\n- **Cidade:** ${order.shipping_city} (${order.shipping_country})\n- **Total:** ${money(order.total_cents)}\n- **Itens:**\n${itemsList}\n\nSeu pedido está sendo acompanhado com prioridade!`;
      }
    } catch {
      // ignore
    }
  }

  // 4. Category matching
  const matchedCat = categories.find((c) => lower.includes(c.name.toLowerCase()) || lower.includes(c.slug.toLowerCase()));
  if (matchedCat) {
    const catProducts = products.filter((p) => p.category_id === matchedCat.id || p.category?.slug === matchedCat.slug);
    if (catProducts.length > 0) {
      const recs = catProducts.slice(0, 3);
      const tags = recs.map((p) => `[[PRODUCT:${p.slug}]]`).join(" ");
      return `✨ Destaques na categoria **${matchedCat.name}**:\n\n${recs
        .map((p) => `• **${p.name}** por apenas **${money(p.price_cents)}**`)
        .join("\n")}\n\n${tags}\n\nVocê pode clicar no botão acima para adicionar ao seu carrinho!`;
    }
  }

  // 5. Keyword search
  const found = products.filter((p) => {
    const pName = p.name.toLowerCase();
    const pDesc = p.description.toLowerCase();
    const words = lower.split(" ").filter((w) => w.length > 3);
    return words.some((w) => pName.includes(w) || pDesc.includes(w));
  });

  if (found.length > 0) {
    const top = found.slice(0, 3);
    const tags = top.map((p) => `[[PRODUCT:${p.slug}]]`).join(" ");
    return `🎯 Encontrei estes produtos para você:\n\n${top
      .map((p) => `• **${p.name}** (${money(p.price_cents)})\n  _${p.description.slice(0, 85)}..._`)
      .join("\n\n")}\n\n${tags}\n\nPosso te ajudar com mais detalhes sobre algum deles?`;
  }

  // 6. Featured / Best sellers
  const featured = products.slice(0, 3);
  const featuredTags = featured.map((p) => `[[PRODUCT:${p.slug}]]`).join(" ");
  return `Olá! Sou o **SensaBot**, seu consultor de compras inteligente da SensaShop. 🛍️✨\n\nPosso te ajudar a encontrar os melhores produtos, conferir especificações técnicas, prazos de frete ou acompanhar seus pedidos!\n\n🔥 **Produtos mais buscados hoje na loja:**\n\n${featured
    .map((p) => `• **${p.name}** por **${money(p.price_cents)}**`)
    .join("\n")}\n\n${featuredTags}\n\nO que você gostaria de ver hoje?`;
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
            const systemPrompt = getStoreContext();
            const result = streamText({
              model,
              system: systemPrompt,
              messages: messages.map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant" | "system",
                content: m.content,
              })),
              tools: {
                searchStoreProducts: tool({
                  description: "Busca produtos disponíveis no catálogo da SensaShop por nome, categoria ou faixa de preço",
                  inputSchema: z.object({
                    query: z.string().optional().describe("Termo de busca do produto"),
                    categoryId: z.number().optional().describe("ID da categoria"),
                  }),
                  execute: async ({ query, categoryId }) => {
                    const res = listProducts({ search: query, categoryId, perPage: 6 });
                    return res.products.map((p) => ({
                      id: p.id,
                      name: p.name,
                      slug: p.slug,
                      price: money(p.price_cents),
                      price_cents: p.price_cents,
                      stock: p.stock,
                      image: p.image,
                      category: p.category?.name,
                    }));
                  },
                }),
                getProductBySlug: tool({
                  description: "Retorna todos os detalhes de um produto específico através do slug",
                  inputSchema: z.object({
                    slug: z.string().describe("Slug único do produto"),
                  }),
                  execute: async ({ slug }) => {
                    const product = getProductBySlug(slug);
                    if (!product) return { error: "Produto não encontrado" };
                    return {
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      description: product.description,
                      price: money(product.price_cents),
                      price_cents: product.price_cents,
                      image: product.image,
                      stock: product.stock,
                      category: product.category?.name,
                    };
                  },
                }),
                checkOrderStatus: tool({
                  description: "Consulta o status e detalhes de um pedido na SensaShop pelo número do pedido",
                  inputSchema: z.object({
                    orderId: z.number().describe("ID numérico do pedido"),
                  }),
                  execute: async ({ orderId }) => {
                    const order = getOrder(orderId);
                    if (!order) return { found: false, message: "Pedido não encontrado." };
                    return {
                      found: true,
                      orderId: order.id,
                      status: order.status,
                      total: money(order.total_cents),
                      recipient: order.shipping_name,
                      city: order.shipping_city,
                      itemsCount: order.items.length,
                      createdAt: order.created_at,
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
            console.warn("Storefront LLM Stream failed, using native engine:", err);
          }
        }

        if (!streamedAny) {
          const responseText = executeNativeStorefrontEngine(lastUserMessage || "");
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
    console.error("Storefront AI Chat Route error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error in AI assistant" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
