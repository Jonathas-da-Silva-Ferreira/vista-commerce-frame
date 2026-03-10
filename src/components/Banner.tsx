import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Banner as BannerType } from '@/types';

interface BannerProps {
  banners: BannerType[];
  loading?: boolean;
}

export default function Banner({ banners, loading }: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="w-full rounded-2xl shadow-card overflow-hidden animate-pulse">
        <div className="h-40 md:h-56 bg-muted" />
      </div>
    );
  }

  if (banners.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const renderSlide = (banner: BannerType) => {
    const content = (
      <div
        className={`w-full flex-shrink-0 bg-gradient-to-r ${banner.bgColor} p-8 md:p-16 relative overflow-hidden`}
      >
        {banner.image && (
          <img
            src={banner.image}
            alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="text-center relative z-10">
          <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2">
            {banner.title}
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90">
            {banner.subtitle}
          </p>
        </div>
      </div>
    );

    if (banner.link) {
      return (
        <Link key={banner.id} to={banner.link} className="w-full flex-shrink-0 block">
          {content}
        </Link>
      );
    }

    return <div key={banner.id} className="w-full flex-shrink-0">{content}</div>;
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-card">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map(renderSlide)}
      </div>

      {banners.length > 1 && (
        <>
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
        </>
      )}
    </div>
  );
}
