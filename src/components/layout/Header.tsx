import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  DollarSign,
  Mail,
  Heart,
  ShoppingCart,
  MapPin,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
}

function HeaderLink({ to, icon, label, badge }: HeaderLinkProps) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1 text-foreground/80 hover:text-foreground transition-colors relative group"
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium hidden md:block">{label}</span>
    </Link>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const { favorites } = useFavorites();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={40} />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-xl tracking-tight">Nexora</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">{t('header.tagline')}</span>
            </div>
          </Link>

          {/* Location */}
          <div className="hidden md:block">
            <LocationSelector />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {isAuthenticated ? (
              <div className="flex flex-col items-center gap-1 text-foreground/80">
                <User className="w-6 h-6" />
                <span className="text-xs font-medium">{user?.name?.split(' ')[0]}</span>
                <button onClick={logout} className="text-[10px] text-muted-foreground hover:text-foreground">{t('header.logout')}</button>
              </div>
            ) : (
              <HeaderLink to="/login" icon={<User className="w-6 h-6" />} label={t('header.login')} />
            )}
            <HeaderLink to="/vender" icon={<DollarSign className="w-6 h-6" />} label={t('header.sell')} />
            <HeaderLink to="/contato" icon={<Mail className="w-6 h-6" />} label={t('header.contact')} />
            <HeaderLink to="/favoritos" icon={<Heart className="w-6 h-6" />} label={t('header.favorites')} badge={favorites.length} />
            <HeaderLink to="/carrinho" icon={<ShoppingCart className="w-6 h-6" />} label={t('header.cart')} badge={itemCount} />

            <button
              onClick={toggleTheme}
              className="flex flex-col items-center gap-1 text-foreground/80 hover:text-foreground transition-colors"
              aria-label={t('header.toggleTheme')}
            >
              {theme === 'light' ? (
                <Moon className="w-6 h-6" />
              ) : (
                <Sun className="w-6 h-6" />
              )}
              <span className="text-xs font-medium">{theme === 'light' ? t('header.darkMode') : t('header.lightMode')}</span>
            </button>

            {/* Language switcher sits last so it doesn't compete with primary nav. */}
            <LanguageSwitcher />
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-4">
            <LanguageSwitcher />
            <Link to="/favoritos" className="relative">
              <Heart className="w-6 h-6" />
              {favorites.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            <Link to="/carrinho" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t('header.menu')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5" />
                    <span>{user?.name}</span>
                  </div>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-sm text-muted-foreground hover:text-foreground">{t('header.logout')}</button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-5 h-5" />
                  <span>{t('header.loginRegister')}</span>
                </Link>
              )}
              <Link to="/vender" className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                <DollarSign className="w-5 h-5" />
                <span>{t('header.sell')}</span>
              </Link>
              <Link to="/contato" className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                <Mail className="w-5 h-5" />
                <span>{t('header.contact')}</span>
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
                <span>{theme === 'light' ? t('header.darkMode') : t('header.lightMode')}</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
