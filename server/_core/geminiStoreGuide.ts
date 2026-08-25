type GuideMessage = { role: "user" | "assistant"; content: string };

const STORE_GUIDE_INSTRUCTION = `You are the concise shopping guide for ALRAHEEM COLLECTION 786, a Pakistan fashion and accessories store. The store offers JEWELLERY, HANDBAGS, LADIES SUIT, MENS SUIT, BRANDED KARA, BRIDAL SETS, MENS BRACELET, and PARTY SET. Prices are PKR. Standard delivery is PKR 250 across Pakistan; delivery estimates are approximate and checkout confirms delivery details. Cash on Delivery may be available at checkout. Shoppers can order through WhatsApp at +92 336 1243334. Do not invent stock, discounts, order status, delivery guarantees, refund policy, reviews, customer data, or payment availability. For account, order-status, payment, or product-specific availability questions, direct shoppers to WhatsApp. Keep replies under 120 words and friendly.`;
const GEMINI_STORE_GUIDE_MODEL = "gemini-3.6-flash";

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

function getStoreGuideFallback(message: string) {
  const question = message.toLowerCase();
  if (/\b(hi|hello|hey|salam|assalam)\b/.test(question)) return "Hello! I can help you browse categories, explain delivery, or guide you to WhatsApp ordering.";
  if (/deliver|shipping|postage/.test(question)) return "Standard delivery is PKR 250 across Pakistan. Delivery timing is approximate, and checkout confirms your delivery details.";
  if (/whatsapp|order/.test(question)) return "You can order through WhatsApp at +92 336 1243334. Our team can help with product-specific availability and order questions there.";
  if (/category|jewell|handbag|suit|kara|bracelet|bridal|party/.test(question)) return "You can browse Jewellery, Handbags, Ladies Suit, Mens Suit, Branded Kara, Bridal Sets, Mens Bracelet, and Party Set from the Shop page.";
  return "I can help you browse categories, explain PKR 250 Pakistan delivery, or guide you to WhatsApp ordering at +92 336 1243334.";
}

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Store guide is not configured.");
  return key;
}

export async function askGeminiStoreGuide(message: string, history: GuideMessage[]) {
  const turns = history.map(item => `${item.role === "assistant" ? "Guide" : "Shopper"}: ${item.content}`).join("\n");
  const input = `${STORE_GUIDE_INSTRUCTION}\n\nConversation:\n${turns}\nShopper: ${message}\nGuide:`;
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": getGeminiKey() },
      body: JSON.stringify({ model: GEMINI_STORE_GUIDE_MODEL, input }),
    });
    if (!response.ok) {
      console.warn(`Gemini store guide request fell back after status ${response.status}.`);
      return getStoreGuideFallback(message);
    }
    const data = await response.json() as GeminiInteractionResponse;
    const answer = getGeminiAnswer(data);
    if (!answer) return getStoreGuideFallback(message);
    return answer.slice(0, 1400);
  } catch {
    console.warn("Gemini store guide request fell back after a transport error.");
    return getStoreGuideFallback(message);
  }
}
