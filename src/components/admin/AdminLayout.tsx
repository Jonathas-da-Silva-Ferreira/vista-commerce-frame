import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Image as ImageIcon, ShoppingCart, Users, Store, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

// Centralized nav definition. Each entry is a Phase-1 placeholder OR a fully
// implemented page; keeping them all here keeps future expansion to a single
// edit point and ensures URL/icon/label always stay in sync.
const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/sellers', label: 'Sellers', icon: Store },
];

/**
 * Persistent admin shell. We render OUTSIDE the storefront's Header/Footer
 * so the admin context feels distinct (Amazon Seller Central pattern) and
 * doesn't inherit shopper-oriented UI (cart icon, favorites, etc.).
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="h-14 border-b bg-card flex items-center px-4 gap-4">
        <NavLink to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </NavLink>
        <div className="ml-auto text-sm font-semibold">Admin Panel</div>
      </header>

      <div className="flex flex-1">
        <aside className="w-60 border-r bg-card hidden md:flex flex-col py-4">
          <nav className="flex flex-col gap-1 px-2">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
