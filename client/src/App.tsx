import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import StoreShell from "./components/StoreShell";
import Home from "./pages/Home";

// The landing route stays eager for the quickest first view. Every secondary
// page is downloaded only when a shopper navigates to it.
const Bag = lazy(() => import("./pages/Bag"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const PromotionCatalogue = lazy(() => import("./pages/PromotionCatalogue"));
const Shop = lazy(() => import("./pages/Shop"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Toaster = lazy(async () => ({ default: (await import("@/components/ui/sonner")).Toaster }));

function IdleToaster() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const schedule = window.requestIdleCallback?.(() => setShouldLoad(true), { timeout: 1200 });
    const fallback = schedule ? undefined : window.setTimeout(() => setShouldLoad(true), 600);
    return () => {
      if (schedule) window.cancelIdleCallback?.(schedule);
      if (fallback) window.clearTimeout(fallback);
    };
  }, []);

  return shouldLoad ? <Suspense fallback={null}><Toaster /></Suspense> : null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<div className="min-h-72 bg-[#fffdf9]" aria-busy="true" aria-label="Loading page" />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/shop"} component={Shop} />
        <Route path={"/product/:handle"} component={ProductDetail} />
        <Route path={"/new-arrivals"}>{() => <PromotionCatalogue kind="new" />}</Route>
        <Route path={"/sale"}>{() => <PromotionCatalogue kind="sale" />}</Route>
        <Route path={"/bag"} component={Bag} />
        <Route path={"/wishlist"} component={Wishlist} />
        <Route path={"/track-order"} component={TrackOrder} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <>
          <IdleToaster />
          <StoreShell>
            <Router />
          </StoreShell>
        </>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
