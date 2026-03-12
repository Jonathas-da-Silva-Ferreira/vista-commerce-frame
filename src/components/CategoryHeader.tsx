import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface CategoryHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; to?: string }[];
}

export default function CategoryHeader({ title, description, breadcrumbs }: CategoryHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-4 h-4" />}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-foreground transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}
