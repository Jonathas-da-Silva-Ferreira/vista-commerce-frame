// Página "Termos de Uso" — documento legal com seções numeradas.

import { useEffect, useMemo } from 'react';
import { useTerms } from '@/hooks/useInstitutional';
import InstitutionalLayout from '@/components/institutional/InstitutionalLayout';

export default function TermsPage() {
  const { data, loading, error } = useTerms();

  useEffect(() => {
    if (data) document.title = `${data.title} — Nexora`;
  }, [data]);

  // Formatação de data feita NO COMPONENTE (não no conteúdo) — respeita
  // o locale do navegador e mantém o conteúdo da API agnóstico de idioma.
  // useMemo evita recriar o formatter a cada render.
  const formattedDate = useMemo(() => {
    if (!data?.lastUpdated) return null;
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(data.lastUpdated));
    } catch {
      // Fallback defensivo: se a string vier malformada, exibe ela bruta
      // ao invés de quebrar a página.
      return data.lastUpdated;
    }
  }, [data?.lastUpdated]);

  return (
    <InstitutionalLayout
      loading={loading}
      error={error}
      eyebrow="Documento legal"
      title={data?.title}
      subtitle={
        data && (
          <>
            {data.intro}
            {formattedDate && (
              <span className="block text-sm text-muted-foreground/80 mt-3">
                Última atualização: {formattedDate}
              </span>
            )}
          </>
        )
      }
    >
      {data && (
        <div className="space-y-8">
          {data.sections.map(section => (
            <section key={section.id} id={section.id} aria-labelledby={`term-${section.id}`}>
              <h2
                id={`term-${section.id}`}
                className="text-xl font-semibold text-foreground mb-2"
              >
                {section.title}
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      )}
    </InstitutionalLayout>
  );
}
