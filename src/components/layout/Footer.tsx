import { Link } from 'react-router-dom';

// Links centralizados em constante para que adição/remoção seja trivial
// e o JSX permaneça declarativo. As rotas batem 1:1 com as definidas em App.tsx.
const footerLinks = [
  { label: 'História', to: '/historia' },
  { label: 'Sobre Nós', to: '/sobre' },
  { label: 'Contato', to: '/contato' },
  { label: 'Termos', to: '/termos' },
];

export default function Footer() {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container mx-auto px-4 py-8">
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
          <p>© {new Date().getFullYear()} MarketBR. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
