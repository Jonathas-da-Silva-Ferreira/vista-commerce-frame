import { Star } from 'lucide-react';

// Componente puramente visual — recebe valor e renderiza estrelas.
// Suporta meia-estrela via clip-path/overflow para não depender de SVG custom,
// mantendo consistência com o ícone Star usado em todo o app (lucide-react).
interface StarRatingProps {
  value: number; // 0-5, aceita decimais (ex: 4.5)
  size?: number; // tamanho em px — default pequeno para uso inline
  className?: string;
}

export function StarRating({ value, size = 16, className = '' }: StarRatingProps) {
  // Clamp defensivo — evita renderização inconsistente caso a API retorne
  // valores fora do range esperado (ex: produto novo sem avaliações = 0).
  const clamped = Math.max(0, Math.min(5, value));

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${clamped.toFixed(1)} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => {
        // Cálculo do preenchimento por estrela:
        // - Se valor >= i+1 → estrela cheia (100%)
        // - Se valor está entre i e i+1 → fração proporcional (ex: 4.5 → 5ª estrela = 50%)
        // - Caso contrário → vazia (0%)
        const fill = Math.max(0, Math.min(1, clamped - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            {/* Camada base: estrela vazia (cor muted) — sempre visível como background */}
            <Star className="absolute inset-0 text-muted-foreground/30" style={{ width: size, height: size }} />
            {/* Camada superior: estrela cheia clipada pela largura proporcional ao fill.
                overflow:hidden + width % é mais performático que SVG mask para listas longas. */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
              aria-hidden="true"
            >
              <Star className="fill-accent text-accent" style={{ width: size, height: size }} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
