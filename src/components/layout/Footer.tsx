import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';

// Routes are kept in code (not data) because they're part of the URL contract;
// translating them would silently break inbound links and SEO history.
const FOOTER_LINKS = [
  { label: 'History', to: '/history' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Terms', to: '/terms' },
];

export default function Footer() {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Logo size={44} />
          <div className="text-center">
            <p className="font-bold text-lg tracking-tight">Nexora</p>
            <p className="text-sm text-muted-foreground">The future of online shopping</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {FOOTER_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          {/* Year is computed at render so we never ship a stale copyright. */}
          <p>© {new Date().getFullYear()} Nexora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
