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

// Admin panel pages. Lazy-loading is intentionally NOT used here yet
// because the admin bundle is small and instant navigation matters more
// than initial-bundle KB for the small admin audience.
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminPlaceholderPage from "./pages/admin/AdminPlaceholderPage";

// Providers are composed top-down so that downstream consumers (cart needs
// auth context for example) always find their dependency mounted above them.
//
// QueryClient defaults are tuned for an e-commerce browse experience: we keep
// previously fetched data "fresh" for a minute and in-cache for five, so going
// Home -> Category -> back to Home does NOT re-trigger a loading state (which
// would manifest as a flash). staleTime > 0 also dedupes burst requests fired
// by sibling components on the same render.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
                  {/*
                    Persistent shell: Header and Footer are rendered ONCE,
                    outside <Routes>, so they don't unmount/remount on every
                    navigation. Only the <main> content swaps when the route
                    changes, which eliminates the white flash caused by the
                    full layout tree being torn down between pages.
                  */}
                <ScrollToTop />
                <Routes>
                  {/*
                    Admin routes render OUTSIDE the storefront shell so they
                    own their own chrome (sidebar, header). They sit at the
                    top of the <Routes> so the catch-all storefront layout
                    below never claims them. Every admin route is gated by
                    ProtectedRoute with requireRoles=['admin'] — the gate
                    relies on RLS for true security, this is just UX.
                  */}
                  <Route path="/admin" element={<ProtectedRoute requireRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute>} />
                  <Route path="/admin/products" element={<ProtectedRoute requireRoles={["admin"]}><AdminProductsPage /></ProtectedRoute>} />
                  <Route path="/admin/categories" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Category Management" /></ProtectedRoute>} />
                  <Route path="/admin/banners" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Banner Management" /></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Order Management" /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="User Management" /></ProtectedRoute>} />
                  <Route path="/admin/sellers" element={<ProtectedRoute requireRoles={["admin"]}><AdminPlaceholderPage title="Seller Management" /></ProtectedRoute>} />

                  {/*
                    Storefront shell: Header + Footer mount ONCE so they
                    don't unmount/remount between navigations. Only the
                    <main> content swaps. Wrapping in a layout route would
                    add another component layer for no real benefit here.
                  */}
                  <Route
                    path="*"
                    element={
                      <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">
                          <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/category/:slug" element={<ProductsPage />} />
                            <Route path="/product/:id" element={<ProductDetailPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                            <Route path="/payment" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                            <Route path="/orders" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                            <Route path="/favorites" element={<FavoritesPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/sell" element={<SellProductPage /></ProtectedRoute /></ProtectedRoute>} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/logistics" element={<LogisticsDashboardPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/history" element={<HistoryPage />} />
                            <Route path="/terms" element={<TermsPage />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                        <Footer />
                      </div>
                    }
                  />
                          /category/:slug is a semantic alias for the products
                          listing — same component, prettier URL for SEO and
                          sharing. Filters still resolve through ProductsPage.
                        */}
                        <Route path="/category/:slug" element={<ProductsPage />} />
                        <Route path="/product/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        {/*
                          Checkout, payment and orders are gated behind
                          ProtectedRoute. The guard preserves the attempted URL
                          in router state so LoginPage returns the user here
                          after a successful sign-in (Amazon-style flow).
                        */}
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute>
                              <CheckoutPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/payment"
                          element={
                            <ProtectedRoute>
                              <CheckoutPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute>
                              <CheckoutPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/sell" element={<SellProductPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/logistics" element={<LogisticsDashboardPage />} />
                        {/* Institutional pages served via the mock API */}
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        {/* Catch-all must stay last so explicit routes win the match */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
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
