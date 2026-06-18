/**
 * ProductCardSkeleton — placeholder estrutural enquanto produtos carregam.
 *
 * Por quê: o skeleton REPLICA a geometria final do ProductCard (mesma
 * proporção da imagem, mesma altura de texto/preço/botão). Isso zera CLS
 * (Cumulative Layout Shift) — quando os dados chegam, NADA pula de posição.
 * Skeletons que não respeitam a altura final são piores que ausência deles.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-card animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-9 bg-muted rounded w-full" />
      </div>
    </div>
  );
}
