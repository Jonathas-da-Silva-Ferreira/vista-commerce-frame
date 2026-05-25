import { Link } from 'react-router-dom';
import {
  Award,
  Tag,
  Home,
  Car,
  BookOpen,
  Wrench,
  Shirt,
  Monitor,
  Headphones,
  Dumbbell,
  ChefHat,
  Tent,
  Fish,
  PawPrint,
  Blocks,
} from 'lucide-react';
import type { Category } from '@/types';

// Icon registry keeps the data layer free of React component references —
// categories travel as plain JSON with a string `icon` field that we resolve
// to a real component here. This makes the data API-portable.
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Tag,
  Home,
  Car,
  BookOpen,
  Wrench,
  Shirt,
  Monitor,
  Headphones,
  Dumbbell,
  ChefHat,
  Tent,
  Fish,
  PawPrint,
  Blocks,
};

// Color → Tailwind class map prevents arbitrary class strings from leaking
// into category data while still letting marketing curate the palette.
const colorClasses: Record<string, string> = {
  gold: 'bg-category-gold',
  red: 'bg-category-red',
  orange: 'bg-category-orange',
  olive: 'bg-category-olive',
  brown: 'bg-category-brown',
  indigo: 'bg-category-indigo',
  'green-dark': 'bg-category-green-dark',
  magenta: 'bg-category-magenta',
  blue: 'bg-category-blue',
  teal: 'bg-category-teal',
  crimson: 'bg-category-crimson',
  khaki: 'bg-category-khaki',
  cyan: 'bg-category-cyan',
  purple: 'bg-category-purple',
  wine: 'bg-category-wine',
};

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Award;
  const bgColor = colorClasses[category.color] || 'bg-primary';

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className={`${bgColor} rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 aspect-square hover:scale-105 transition-transform shadow-card hover:shadow-card-hover`}
    >
      <Icon className="w-10 h-10 md:w-14 md:h-14 text-foreground/90" />
      <span className="text-xs md:text-sm font-semibold text-foreground/90 text-center leading-tight">
        {category.name}
      </span>
    </Link>
  );
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
