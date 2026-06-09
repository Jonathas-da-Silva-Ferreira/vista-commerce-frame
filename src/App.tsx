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

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import SellProductPage from "./pages/SellProductPage";
import ContactPage from "./pages/ContactPage";
import LogisticsDashboardPage from "./pages/LogisticsDashboardPage";
import AboutPage from "./pages/AboutPage";
import HistoryPage from "./pages/HistoryPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Admin pages render outside the storefront chrome so they get their own
// layout, navigation, and visual identity (similar to Shopify Admin).
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminPlaceholderPage from "./pages/admin/AdminPlaceholderPage";

// staleTime > 0 prevents the "flash of empty content" when navigating
// back to a recently-visited page; gcTime keeps the cache hot for 5 min.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, gcTime: 5 * 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

// Storefront shell: Header + Footer mount ONCE so they don't unmount on
// every route change (eliminates the white flash between navigations).
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
                  <Routes>
                    {/*
                      Admin routes are declared FIRST so they win the match
                      before the catch-all storefront wrapper. Every admin
                      route uses ProtectedRoute(requireRoles=['admin']);
                      true security is enforced by RLS policies server-side.
                    */}
                    <Route path="/admin" element={<ProtectedRoute requireRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute>} />
                    <Route path="/admin/products" element={<ProtectedRoute requireRoles={["admin"]}><AdminProductsPage /></ProtectedRoute>} />
                    <Route path="/admin/categories" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Category Management" /></ProtectedRoute>} />
                    <Route path="/admin/banners" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Banner Management" /></ProtectedRoute>} />
                    <Route path="/admin/orders" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Order Management" /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="User Management" /></ProtectedRoute>} />
                    <Route path="/admin/sellers" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Seller Management" /></ProtectedRoute>} />

                    {/* Storefront routes share the persistent shell. */}
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
                    <Route path="/sell" element={<StorefrontShell><SellProductPage /></StorefrontShell>} />
                    <Route path="/contact" element={<StorefrontShell><ContactPage /></StorefrontShell>} />
                    <Route path="/logistics" element={<StorefrontShell><LogisticsDashboardPage /></StorefrontShell>} />
                    <Route path="/about" element={<StorefrontShell><AboutPage /></StorefrontShell>} />
                    <Route path="/history" element={<StorefrontShell><HistoryPage /></StorefrontShell>} />
                    <Route path="/terms" element={<StorefrontShell><TermsPage /></StorefrontShell>} />
                    <Route path="*" element={<StorefrontShell><NotFound /></StorefrontShell>} />
                  </Routes>
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
