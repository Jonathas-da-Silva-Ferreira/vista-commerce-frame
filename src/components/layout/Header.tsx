import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  User,
  DollarSign,
  Mail,
  Heart,
  ShoppingCart,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LocationSelector from '@/components/LocationSelector';

interface HeaderLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  // Quando muda, o badge re-anima (via key). Propriedade externa para que
  // o mesmo trigger anime simultaneamente os badges desktop e mobile.
  pulseKey?: number;
}

// Slot reutilizável para itens da nav (ícone + label + badge).
// key={pulseKey} no badge força remount e replays a animação CSS sem
// precisar gerenciar timeouts internos.
function HeaderLink({ to, icon, label, badge, pulseKey }: HeaderLinkProps) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 text-foreground/80 hover:text-foreground transition-colors relative group"
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span
            key={pulseKey}
            className={`absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium ${
              pulseKey ? 'animate-cart-bounce' : ''
            }`}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium hidden md:block">{label}</span>
    </Link>
  );
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const { favorites } = useFavorites();
  const { user, isAuthenticated, logout } = useAuth();
  // Mobile menu state stays local: no other component needs to react to it.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // pulseKey é incrementado a cada CustomEvent 'nexora:cart-pulse' disparado
  // pelo ProductCard. Mudança de key força remount do <span> do badge,
  // disparando a animação CSS sem precisar de setTimeout para "limpar".
  // Inicia em 0 (falsy) para que o badge não anime no mount inicial.
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    // Listener global: qualquer parte do app pode disparar o pulso sem
    // precisar conhecer o Header. Desinscrição no cleanup evita leak.
    const handler = () => setPulseKey(k => k + 1);
    window.addEventListener('nexora:cart-pulse', handler);
    return () => window.removeEventListener('nexora:cart-pulse', handler);
  }, []);


  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo + brand wordmark */}
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={40} />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-xl tracking-tight">Nexora</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">The future of online shopping</span>
            </div>
          </Link>

          {/* Location picker (drives shipping calculations) */}
          <div className="hidden md:block">
            <LocationSelector />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-1 text-foreground/80">
                <User className="w-6 h-6" />
                <span className="text-xs font-medium">{user?.name?.split(' ')[0]}</span>
                <button onClick={logout} className="text-[10px] text-muted-foreground hover:text-foreground">Sign out</button>
              </div>
            ) : (
              <HeaderLink to="/login" icon={<User className="w-6 h-6" />} label="Login" />
            )}
            <HeaderLink to="/sell" icon={<DollarSign className="w-6 h-6" />} label="Sell" />
            <HeaderLink to="/contact" icon={<Mail className="w-6 h-6" />} label="Contact" />
            <HeaderLink to="/favorites" icon={<Heart className="w-6 h-6" />} label="Favorites" badge={favorites.length} />
            <HeaderLink to="/cart" icon={<ShoppingCart className="w-6 h-6" />} label="Cart" badge={itemCount} pulseKey={pulseKey} />


            <button
              onClick={toggleTheme}
              className="flex flex-col items-center gap-1 text-foreground/80 hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
              <span className="text-xs font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </nav>

          {/* Mobile controls — cart/favorites stay accessible even without the menu */}
          <div className="flex lg:hidden items-center gap-4">
            <Link to="/favorites" className="relative">
              <Heart className="w-6 h-6" />
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                // Mesmo pulseKey reaproveitado no badge mobile: o evento
                // global afeta os dois sem código duplicado de subscription.
                <span
                  key={pulseKey}
                  className={`absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center ${pulseKey ? 'animate-cart-bounce' : ''}`}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu (collapsible) */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5" />
                    <span>{user?.name}</span>
                  </div>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-5 h-5" />
                  <span>Login / Register</span>
                </Link>
              )}
              <Link to="/sell" className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                <DollarSign className="w-5 h-5" />
                <span>Sell</span>
              </Link>
              <Link to="/contact" className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                <Mail className="w-5 h-5" />
                <span>Contact</span>
              </Link>
              <div className="flex items-center gap-3 p-2">
                <LocationSelector />
              </div>
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg w-full text-left"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
