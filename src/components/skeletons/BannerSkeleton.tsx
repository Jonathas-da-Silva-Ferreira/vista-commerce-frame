/**
 * BannerSkeleton — reserva a altura do hero antes do conteúdo chegar.
 *
 * Por quê: o banner é o maior elemento da home (candidato a LCP). Reservar
 * sua altura via skeleton evita que TODO o conteúdo abaixo "pule" quando
 * a imagem real é carregada — um dos piores tipos de layout shift.
 */
export default function BannerSkeleton() {
  return (
    <div className="w-full h-48 md:h-64 lg:h-80 rounded-2xl bg-muted animate-pulse" />
  );
}
