import { STORE_CATEGORIES } from "@/lib/storeCategories";

export type InstantGuideReply = {
  content: string;
  category?: { name: string; href: string; collectionHandle: string };
};

export function getInstantGuideReply(message: string): InstantGuideReply | null {
  const value = message.trim().toLowerCase();
  const category = STORE_CATEGORIES.find(item => {
    const aliases = [item.name.toLowerCase(), item.productType.toLowerCase(), item.collectionHandle.replaceAll("-", " ")];
    return aliases.some(alias => value.includes(alias));
  });

  if (category) {
    return {
      content: `Here are our live ${category.name.toLowerCase()} products. You can open any item to see its details, price, and ordering options.`,
      category: { name: category.name, href: category.href, collectionHandle: category.collectionHandle },
    };
  }
  if (/^(hi|hello|hey|salam|assalam|aoa)\b/.test(value)) {
    return { content: "Hello, and welcome to ALRAHEEM COLLECTION 786. I can help you find products, explain delivery and payment, or guide you through WhatsApp ordering. What would you like to shop for?" };
  }
  if (/deliver|shipping|ship|courier|delivery fee|delivery charges|how long.*arriv|when.*arriv/.test(value)) {
    return { content: "We offer standard delivery across Pakistan for PKR 250. Orders over PKR 5,000 receive complimentary delivery. Delivery usually takes 3–6 working days, depending on the city." };
  }
  if (/whatsapp|order|buy|purchase|checkout|how can i get/.test(value)) {
    return { content: "To order, open the product you want, choose the available variant if shown, and use the WhatsApp ordering option. Our team will confirm availability, total price, delivery details, and the next step with you." };
  }
  if (/payment|pay|cash on delivery|cod|jazzcash|easypaisa|bank card|card/.test(value)) {
    return { content: "For payment options and confirmation, please contact us through the WhatsApp ordering button with the product you want. Our team will confirm the currently available method before you place the order." };
  }
  if (/track|tracking|where.*order|order status/.test(value)) {
    return { content: "Use the Track Your Order link in the storefront header if you have tracking details. If you need help, send your order information to our team on WhatsApp so they can assist you." };
  }
  if (/what do you sell|what.*available|categories|collections|catalogue|catalog|products do you have/.test(value)) {
    return { content: "We offer Jewellery, Handbags, Ladies Suit, Mens Suit, Branded Kara, Bridal Sets, Mens Bracelet, and Party Set. Tell me a category and I’ll show you its live products." };
  }
  return null;
}
