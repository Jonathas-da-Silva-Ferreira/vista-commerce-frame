import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const banners = [
  {
    id: 1,
    title: 'Super Promoção de Verão',
    subtitle: 'Até 50% de desconto em eletrônicos',
    bgColor: 'from-primary to-primary/80',
  },
  {
    id: 2,
    title: 'Frete Grátis',
    subtitle: 'Para compras acima de R$ 199',
    bgColor: 'from-accent to-accent/80',
  },
  {
    id: 3,
    title: 'Ofertas Especiais',
    subtitle: 'Novos produtos toda semana',
    bgColor: 'from-category-teal to-category-cyan',
  },
];

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-card">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`w-full flex-shrink-0 bg-gradient-to-r ${banner.bgColor} p-8 md:p-16`}
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2">
                {banner.title}
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90">
                {banner.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-primary-foreground"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-primary-foreground"
        onClick={goToNext}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-primary-foreground w-6'
                : 'bg-primary-foreground/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
