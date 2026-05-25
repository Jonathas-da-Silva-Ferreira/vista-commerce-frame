import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Banner as BannerType } from '@/types';

import bannerElectronics from '@/assets/banner-eletronicos.jpg';
import bannerFashion from '@/assets/banner-moda.jpg';
import bannerShipping from '@/assets/banner-frete.jpg';

// Banner images shipped via /src/assets are mapped here so the CMS-style
// payload can keep pointing at a stable path, while bundlers still get the
// fingerprinted URL at build time.
const localImages: Record<string, string> = {
  '/src/assets/banner-eletronicos.jpg': bannerElectronics,
  '/src/assets/banner-moda.jpg': bannerFashion,
  '/src/assets/banner-frete.jpg': bannerShipping,
};

function resolveImage(src?: string) {
  if (!src) return undefined;
  return localImages[src] ?? src;
}

interface BannerProps {
  banners: BannerType[];
  loading?: boolean;
}

export default function Banner({ banners, loading }: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto-advance pauses on hover so users can read banner copy without it
  // sliding away mid-sentence — small detail that materially improves UX.
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;
    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [banners.length, isHovered, goToNext]);

  if (loading) {
    return (
      <div className="w-full rounded-2xl overflow-hidden animate-pulse">
        <div className="h-48 md:h-80 lg:h-[420px] bg-muted" />
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => {
          const imgSrc = resolveImage(banner.image);
          return (
            <div
              key={banner.id}
              className="w-full flex-shrink-0 relative h-48 md:h-80 lg:h-[420px]"
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: banner.bgColor }} />
              )}

              {/* Gradient overlay guarantees text legibility regardless of the
                  underlying image — avoids per-banner contrast tuning. */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-2xl">
                <h2
                  className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4"
                  style={{ lineHeight: 1.1, textWrap: 'balance' }}
                >
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-sm md:text-lg lg:text-xl text-white/85 mb-4 md:mb-8 max-w-md">
                    {banner.subtitle}
                  </p>
                )}
                {banner.link && (
                  <div>
                    <Link to={banner.link}>
                      <Button
                        size="lg"
                        className="bg-white text-black hover:bg-white/90 active:scale-[0.97] transition-all font-semibold text-sm md:text-base px-6 md:px-8 rounded-lg shadow-md"
                      >
                        {banner.buttonText || 'View more'}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50 active:scale-95"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50 active:scale-95"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to banner ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/40 w-2 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
