import { z } from "zod";
import { findGuideCategory, askGeminiStoreGuide } from "../_core/geminiStoreGuide";
import { listProducts } from "../_core/shopify";
import { publicProcedure, router } from "../_core/trpc";

const messageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(600) });

export const guideRouter = router({
  ask: publicProcedure
    .input(z.object({ message: z.string().trim().min(1).max(600), history: z.array(messageSchema).max(6).default([]) }))
    .mutation(async ({ input }) => {
      const answer = await askGeminiStoreGuide(input.message, input.history);
      const category = findGuideCategory(input.message);
      if (!category) return { answer };

      try {
        const products = await listProducts({ collectionHandle: category.collectionHandle, first: 6, sort: "TITLE" });
        return { answer, category, products };
      } catch {
        return { answer, category, products: [] };
      }
    }),
});
