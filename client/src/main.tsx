import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { CartProvider } from "./contexts/CartContext";
import "./index.css";
import { getStorefrontTrpcEndpoint } from "./lib/trpcEndpoint";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Storefront reads are shared across routes; retaining them briefly avoids
      // refetching Shopify whenever a shopper changes category or returns home.
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getStorefrontTrpcEndpoint(
        import.meta.env.VITE_NETLIFY_FUNCTIONS === "true"
      ),
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <App />
      </CartProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
