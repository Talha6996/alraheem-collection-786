type GuideMessage = { role: "user" | "assistant"; content: string };

const STORE_GUIDE_INSTRUCTION = `You are the concise shopping guide for ALRAHEEM COLLECTION 786, a Pakistan fashion and accessories store. The store offers JEWELLERY, HANDBAGS, LADIES SUIT, MENS SUIT, BRANDED KARA, BRIDAL SETS, MENS BRACELET, and PARTY SET. Prices are PKR. Standard delivery is PKR 250 across Pakistan; delivery estimates are approximate and checkout confirms delivery details. Cash on Delivery may be available at checkout. Shoppers can order through WhatsApp at +92 336 1243334. Do not invent stock, discounts, order status, delivery guarantees, refund policy, reviews, customer data, or payment availability. For account, order-status, payment, or product-specific availability questions, direct shoppers to WhatsApp. Keep replies under 120 words and friendly.`;

function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Store guide is not configured.");
  return key;
}

export async function askGeminiStoreGuide(message: string, history: GuideMessage[]) {
  const turns = history.map(item => `${item.role === "assistant" ? "Guide" : "Shopper"}: ${item.content}`).join("\n");
  const input = `${STORE_GUIDE_INSTRUCTION}\n\nConversation:\n${turns}\nShopper: ${message}\nGuide:`;
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": getGeminiKey() },
    body: JSON.stringify({ model: "gemini-2.5-flash", input }),
  });
  if (!response.ok) throw new Error(`Gemini store guide request failed with ${response.status}.`);
  const data = await response.json() as { output_text?: string };
  const answer = data.output_text?.trim();
  if (!answer) throw new Error("Gemini returned no store-guide text.");
  return answer.slice(0, 1400);
}
