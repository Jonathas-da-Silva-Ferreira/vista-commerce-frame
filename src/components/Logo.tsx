import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Logo Nexora — "N" estilizado em gradiente da marca.
 * SVG inline para nitidez em qualquer tamanho e tema-aware via tokens.
 */
export default function Logo({ className, size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('flex-shrink-0', className)}
      aria-label="Nexora"
    >
      <defs>
        <linearGradient id="nexora-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--secondary-brand))" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#nexora-grad)" />
      <path
        d="M12 28 V12 L28 28 V12"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
