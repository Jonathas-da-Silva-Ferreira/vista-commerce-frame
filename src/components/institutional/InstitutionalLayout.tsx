// Wrapper de layout para páginas institucionais.
//
// Por que extrair?
// - Garante consistência visual entre Sobre/História/Termos (mesma largura,
//   mesmos paddings, mesma hierarquia tipográfica) sem duplicar markup.
// - Centraliza estados de loading/erro — qualquer mudança (skeleton, retry)
//   acontece em um único lugar e propaga para as 3 páginas.

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface InstitutionalLayoutProps {
  loading: boolean;
  error: string | null;
  // eyebrow: pequeno rótulo acima do título principal (ex: "Institucional")
  eyebrow?: string;
  title?: string;
  // subtitle aceita string ou node para permitir formatação rica (datas, links).
  subtitle?: ReactNode;
  children: ReactNode;
}

export default function InstitutionalLayout({
  loading,
  error,
  eyebrow,
  title,
  subtitle,
  children,
}: InstitutionalLayoutProps) {
  return (
    <MainLayout>
      {/* max-w-3xl segue padrão de "long-form reading" — ~70 caracteres por
          linha é o sweet spot tipográfico para legibilidade de texto corrido. */}
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        {loading && (
          <div className="flex items-center justify-center py-24" aria-busy="true">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-destructive"
          >
            <p className="font-medium">Não foi possível carregar o conteúdo.</p>
            <p className="text-sm opacity-80 mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {(eyebrow || title || subtitle) && (
              <header className="mb-10 border-b border-border pb-8">
                {eyebrow && (
                  <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
                    {eyebrow}
                  </p>
                )}
                {title && (
                  // h1 único por página — bom para SEO e leitores de tela.
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </header>
            )}
            {children}
          </>
        )}
      </article>
    </MainLayout>
  );
}
