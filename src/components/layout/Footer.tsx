import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '@/components/Logo';

// Link list is built inside the component so labels react to language changes.
// Routes themselves stay in Portuguese — they're part of the URL contract
// and are not localized to avoid breaking existing inbound links/SEO.
export default function Footer() {
  const { t } = useTranslation();

  const footerLinks = [
    { label: t('footer.history'), to: '/historia' },
    { label: t('footer.about'), to: '/sobre' },
    { label: t('footer.contact'), to: '/contato' },
    { label: t('footer.terms'), to: '/termos' },
  ];

  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Logo size={44} />
          <div className="text-center">
            <p className="font-bold text-lg tracking-tight">Nexora</p>
            <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {footerLinks.map(link => (
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
          <p>© {new Date().getFullYear()} Nexora. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
