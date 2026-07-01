import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { LocationProvider } from "@/contexts/LocationContext";

// HomePage NÃO é lazy: é a rota mais provável de aparecer no LCP. Code-split
// dela só atrasaria o first paint sem benefício real de bundle.
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import NavigationProgress from "./components/NavigationProgress";

/*
 * lazy() + Suspense: cada rota vira um chunk separado no build do Vite.
 *
 * Por quê:
 *  - Bundle inicial cai (~30–50% típico em apps com Admin/Dashboard pesados).
 *  - Quem nunca abre /admin nunca baixa o código de Admin. Idem para
 *    Logistics/Checkout — fluxos secundários não pesam no first paint.
 *  - Cada chunk é cacheado independentemente — uma mudança em Admin não
 *    invalida o cache do Home.
 *
 * Trade-off: cada navegação para uma rota nova faz um fetch do chunk.
 * Mitigamos com NavigationProgress (feedback visual) + Suspense fallback
 * que preserva o Header (evita flash de header desaparecendo).
 */
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const SellProductPage = lazy(() => import("./pages/SellProductPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LogisticsDashboardPage = lazy(() => import("./pages/LogisticsDashboardPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin é o caso mais óbvio para lazy: 99% dos usuários nunca vê esses chunks.
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminPlaceholderPage = lazy(() => import("./pages/admin/AdminPlaceholderPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

/**
 * Fallback "invisível" para Suspense — propositalmente vazio.
 *
 * Por quê não um spinner: o chunk carrega em ~100–300ms e a barra superior
 * (NavigationProgress) já dá o feedback. Spinner adicional só causaria
 * flicker. Reservamos altura mínima do main pra evitar o footer subir
 * durante a troca de rota.
 */
function RouteFallback() {
  return <div className="min-h-[60vh]" aria-busy="true" aria-live="polite" />;
}

// Storefront shell: Header + Footer permanecem montados entre rotas.
// NavigationProgress vive AQUI (não no App raiz) para herdar o contexto do
// Router — useLocation só funciona dentro de <BrowserRouter>.
function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <LocationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  {/* NavigationProgress observa pathname e dispara a barra
                      no topo a cada navegação — feedback imediato antes
                      mesmo do chunk lazy terminar de baixar. */}
                  <NavigationProgress />
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      {/* Admin: declarado primeiro para evitar match no shell. */}
                      <Route path="/admin" element={<ProtectedRoute requireRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute>} />
                      <Route path="/admin/products" element={<ProtectedRoute requireRoles={["admin"]}><AdminProductsPage /></ProtectedRoute>} />
                      <Route path="/admin/categories" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Category Management" /></ProtectedRoute>} />
                      <Route path="/admin/banners" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Banner Management" /></ProtectedRoute>} />
                      <Route path="/admin/orders" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Order Management" /></ProtectedRoute>} />
                      <Route path="/admin/users" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="User Management" /></ProtectedRoute>} />
                      <Route path="/admin/sellers" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Seller Management" /></ProtectedRoute>} />

                      <Route path="/" element={<StorefrontShell><HomePage /></StorefrontShell>} />
                      <Route path="/products" element={<StorefrontShell><ProductsPage /></StorefrontShell>} />
                      <Route path="/category/:slug" element={<StorefrontShell><ProductsPage /></StorefrontShell>} />
                      <Route path="/product/:id" element={<StorefrontShell><ProductDetailPage /></StorefrontShell>} />
                      <Route path="/cart" element={<StorefrontShell><CartPage /></StorefrontShell>} />
                      <Route path="/checkout" element={<StorefrontShell><ProtectedRoute><CheckoutPage /></ProtectedRoute></StorefrontShell>} />
                      <Route path="/payment" element={<StorefrontShell><ProtectedRoute><CheckoutPage /></ProtectedRoute></StorefrontShell>} />
                      <Route path="/orders" element={<StorefrontShell><ProtectedRoute><CheckoutPage /></ProtectedRoute></StorefrontShell>} />
                      <Route path="/favorites" element={<StorefrontShell><FavoritesPage /></StorefrontShell>} />
                      <Route path="/login" element={<StorefrontShell><LoginPage /></StorefrontShell>} />
                      <Route path="/forgot-password" element={<StorefrontShell><ForgotPasswordPage /></StorefrontShell>} />
                      <Route path="/reset-password" element={<StorefrontShell><ResetPasswordPage /></StorefrontShell>} />
                      <Route path="/sell" element={<StorefrontShell><SellProductPage /></StorefrontShell>} />
                      <Route path="/contact" element={<StorefrontShell><ContactPage /></StorefrontShell>} />
                      <Route path="/logistics" element={<StorefrontShell><LogisticsDashboardPage /></StorefrontShell>} />
                      <Route path="/about" element={<StorefrontShell><AboutPage /></StorefrontShell>} />
                      <Route path="/history" element={<StorefrontShell><HistoryPage /></StorefrontShell>} />
                      <Route path="/terms" element={<StorefrontShell><TermsPage /></StorefrontShell>} />
                      <Route path="*" element={<StorefrontShell><NotFound /></StorefrontShell>} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </LocationProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
