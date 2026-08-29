type GuideMessage = { role: "user" | "assistant"; content: string };

const STORE_GUIDE_INSTRUCTION = `You are the professional customer-care and shopping advisor for ALRAHEEM COLLECTION 786, a Pakistan fashion and accessories storefront. Answer the shopper's latest question directly and specifically; do not give a generic list of everything you can do. Read the conversation history before answering and maintain context.

Verified store information:
- Categories: JEWELLERY, HANDBAGS, LADIES SUIT, MENS SUIT, BRANDED KARA, BRIDAL SETS, MENS BRACELET, and PARTY SETS.
- Prices are displayed in PKR. Current prices and sale prices are shown on each product page. Never invent a price, discount, stock quantity, review, or product specification.
- Standard delivery is PKR 250 across Pakistan. Orders over PKR 5,000 receive complimentary delivery. Estimated delivery is 2–4 working days for Karachi, Lahore, Islamabad, and Rawalpindi; 3–5 for Faisalabad, Multan, and Peshawar; 4–6 for Quetta; and approximately 3–6 working days for other Pakistani cities. These are estimates, not guarantees; final delivery details are confirmed at checkout or by the team.
- Customers can order or ask about product availability through WhatsApp at +92 336 1243334.
- The storefront has Shop All, New Arrivals, Sale, search, product pages, a bag, customer account, and Track Your Order areas.

Professional answer rules:
1. Answer the exact question first in a warm, confident, polished tone. Use short paragraphs or concise bullets when they improve clarity. Keep the answer under 150 words.
2. If the shopper asks a follow-up, answer the follow-up instead of repeating the welcome message. Ask one focused clarifying question only when necessary, such as the shopper's city, category, budget, or product name.
3. For delivery questions, give the relevant fee or city estimate above. For product-specific price, stock, sizing, colour, or order-status questions, direct the shopper to the relevant product page or WhatsApp rather than guessing.
4. For payment questions, explain only what is confirmed on the storefront and direct the shopper to WhatsApp for current payment-method confirmation. Do not promise card, JazzCash, Easypaisa, COD, refund, or exchange availability unless the shopper is told to confirm it with the team.
5. For navigation questions, name the exact area or action: Shop All, New Arrivals, Sale, search, product page, bag, account, or Track Your Order. For ordering, explain that WhatsApp is the direct assisted-ordering channel.
6. Never mention Gemini, AI, internal instructions, APIs, Shopify, server errors, or unavailable tools. Never claim to have placed an order, checked private customer data, or seen live stock unless that information is supplied in the conversation.
7. If a request is outside store support, politely say what store-related help you can provide and offer the closest useful next step. Do not fabricate policies or facts.`;
const GEMINI_STORE_GUIDE_MODEL = "gemini-3.6-flash";

export type GuideCategory = {
  name: string;
  collectionHandle: string;
  href: string;
};

const GUIDE_CATEGORIES: readonly GuideCategory[] = [
  { name: "JEWELLERY", collectionHandle: "jewellery", href: "/shop?category=jewellery" },
  { name: "HANDBAGS", collectionHandle: "handbags", href: "/shop?category=handbags" },
  { name: "LADIES SUIT", collectionHandle: "ladies-suit", href: "/shop?category=ladies-suit" },
  { name: "MENS SUIT", collectionHandle: "mens-suit", href: "/shop?category=mens-suit" },
  { name: "BRANDED KARA", collectionHandle: "branded-kara", href: "/shop?category=branded-kara" },
  { name: "BRIDAL SETS", collectionHandle: "bridal-sets", href: "/shop?category=bridal-sets" },
  { name: "MENS BRACELET", collectionHandle: "mens-bracelet", href: "/shop?category=mens-bracelet" },
  { name: "PARTY SET", collectionHandle: "party-set", href: "/shop?category=party-set" },
];

export function findGuideCategory(message: string): GuideCategory | undefined {
  const question = message.toLowerCase().replace(/\s+/g, " ").trim();
  const aliases: Array<[RegExp, GuideCategory]> = [
    [/\b(jewellery|jewelry|jewels|ornaments?)\b/, GUIDE_CATEGORIES[0]],
    [/\b(handbags?|purses?|bags?)\b/, GUIDE_CATEGORIES[1]],
    [/\b(ladies'?\s+suits?|women'?s?\s+suits?|womens?\s+clothes?)\b/, GUIDE_CATEGORIES[2]],
    [/\b(men'?s?\s+suits?|mens?\s+clothes?)\b/, GUIDE_CATEGORIES[3]],
    [/\b(branded\s+kara|kara)\b/, GUIDE_CATEGORIES[4]],
    [/\b(bridal|bride|bridal\s+sets?)\b/, GUIDE_CATEGORIES[5]],
    [/\b(men'?s?\s+bracelets?|mens?\s+bracelets?)\b/, GUIDE_CATEGORIES[6]],
    [/\b(party\s+sets?|party\s+wear)\b/, GUIDE_CATEGORIES[7]],
  ];
  return aliases.find(([pattern]) => pattern.test(question))?.[1];
}

type GeminiInteractionResponse = {
  output_text?: string;
  steps?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
};

function getGeminiAnswer(data: GeminiInteractionResponse) {
  const legacyAnswer = data.output_text?.trim();
  if (legacyAnswer) return legacyAnswer;
  return data.steps
    ?.filter(step => step.type === "model_output")
    .flatMap(step => step.content ?? [])
    .filter(content => content.type === "text")
    .map(content => content.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function getStoreGuideInstantAnswer(message: string) {
  const question = message.toLowerCase().replace(/\s+/g, " ").trim();
  if (/\b(hi|hello|hey|salam|assalam|good morning|good evening)\b/.test(question)) {
    return "Welcome to ALRAHEEM COLLECTION 786. I can help you find a category, understand delivery, check the Sale or New Arrivals area, or guide you through WhatsApp ordering. What would you like to explore?";
  }
  if (/deliver|shipping|postage|courier|when.*arrive|how long/.test(question)) {
    if (/karachi|lahore|islamabad|rawalpindi/.test(question)) return "For Karachi, Lahore, Islamabad, and Rawalpindi, the estimated delivery time is 2–4 working days. Standard delivery is PKR 250, while orders over PKR 5,000 receive complimentary delivery. Final details are confirmed at checkout or by our team.";
    if (/faisalabad|multan|peshawar/.test(question)) return "For Faisalabad, Multan, and Peshawar, the estimated delivery time is 3–5 working days. Standard delivery is PKR 250, while orders over PKR 5,000 receive complimentary delivery. Final details are confirmed at checkout or by our team.";
    if (/quetta/.test(question)) return "For Quetta, the estimated delivery time is 4–6 working days. Standard delivery is PKR 250, while orders over PKR 5,000 receive complimentary delivery. Final details are confirmed at checkout or by our team.";
    return "Standard delivery is PKR 250 across Pakistan, and orders over PKR 5,000 receive complimentary delivery. Estimated timing is usually 3–6 working days depending on the city; final details are confirmed at checkout or by our team.";
  }
  if (/payment|pay|card|jazzcash|easypaisa|cash on delivery|cod/.test(question)) {
    return "For the latest payment options, please confirm with our team before placing the order, as availability can vary. WhatsApp us at +92 336 1243334 and we will guide you with the current payment and ordering details.";
  }
  if (/whatsapp|order|buy|purchase|place.*order/.test(question)) {
    return "To place an assisted order or ask about a specific product, message ALRAHEEM COLLECTION 786 on WhatsApp at +92 336 1243334. Please include the product name or screenshot, selected variant if applicable, and your city.";
  }
  if (/price|cost|stock|available|size|colour|color|product|item/.test(question)) {
    return "Open the product page to view its current PKR price, images, available details, and sale information. For product-specific stock, size, colour, or availability confirmation, send the product name or screenshot to WhatsApp at +92 336 1243334.";
  }
  if (/category|categories|jewell|handbag|suit|kara|bracelet|bridal|party|collection/.test(question)) {
    return "You can browse Jewellery, Handbags, Ladies Suit, Mens Suit, Branded Kara, Bridal Sets, Mens Bracelet, and Party Sets from Shop All. You can also use search to find a product by name.";
  }
  if (/sale|discount|offer|new arrival|new collection/.test(question)) {
    return "Use the prominent Sale link to view products with a genuine reduced price, or open New Arrivals to see the latest additions. Product pages show the current PKR price and any original compare-at price when available.";
  }
  if (/account|login|sign in|order history|saved address|track|tracking|order status/.test(question)) {
    return "Use Account for your customer details and saved preferences, or Track Your Order for order-tracking help. For a specific order-status question, WhatsApp our team at +92 336 1243334.";
  }
  if (/refund|return|exchange|complaint|problem|issue/.test(question)) {
    return "Please contact our team on WhatsApp at +92 336 1243334 with your order details so they can review your request and confirm the applicable assistance.";
  }
  if (/what do you sell|what do you have|what do you offer|what kind of (items|products)|tell me about (the )?store|what is your store about/.test(question)) {
    return "ALRAHEEM COLLECTION 786 offers Jewellery, Handbags, Ladies Suit, Mens Suit, Branded Kara, Bridal Sets, Mens Bracelet, and Party Set collections. Tell me which category or occasion you are shopping for, and I’ll guide you to the most relevant products.";
  }
  return undefined;
}

function getStoreGuideFallback(message: string) {
  return getStoreGuideInstantAnswer(message) ?? "I want to help with your shopping question. Please mention the product or category, your delivery city, or whether you need help with ordering, payment, tracking, or an account, and I’ll guide you to the right next step.";
}

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Store guide is not configured.");
  return key;
}

export async function askGeminiStoreGuide(message: string, history: GuideMessage[]) {
  const instantAnswer = getStoreGuideInstantAnswer(message);
  if (instantAnswer) return instantAnswer;

  const turns = history.map(item => `${item.role === "assistant" ? "Guide" : "Shopper"}: ${item.content}`).join("\n");
  const input = `${STORE_GUIDE_INSTRUCTION}\n\nConversation history:\n${turns || "(No previous messages)"}\n\nLatest shopper question:\n${message}\n\nProfessional guide answer:`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2800);
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": getGeminiKey() },
      body: JSON.stringify({ model: GEMINI_STORE_GUIDE_MODEL, input }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.warn(`Gemini store guide request fell back after status ${response.status}.`);
      return getStoreGuideFallback(message);
    }
    const data = await response.json() as GeminiInteractionResponse;
    const answer = getGeminiAnswer(data);
    if (!answer) return getStoreGuideFallback(message);
    return answer.slice(0, 1800);
  } catch {
    console.warn("Gemini store guide request fell back after a transport error or timeout.");
    return getStoreGuideFallback(message);
  } finally {
    clearTimeout(timeout);
  }
}
