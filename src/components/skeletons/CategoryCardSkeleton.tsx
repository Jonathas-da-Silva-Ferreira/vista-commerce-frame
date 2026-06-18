/**
 * CategoryCardSkeleton — espelha o CategoryCard real (aspect-square, mesmas
 * proporções) para manter o grid estável durante o carregamento.
 */
export default function CategoryCardSkeleton() {
  return (
    <div className="bg-muted rounded-2xl aspect-square animate-pulse" />
  );
}
