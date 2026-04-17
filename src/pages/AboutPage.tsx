// Página "Sobre Nós" — apresenta a empresa institucionalmente.
// Conteúdo vem 100% da API (mockServer); o componente é puramente apresentacional.

import { useEffect } from 'react';
import { useAbout } from '@/hooks/useInstitutional';
import InstitutionalLayout from '@/components/institutional/InstitutionalLayout';

export default function AboutPage() {
  const { data, loading, error } = useAbout();

  // SEO básico: título dinâmico por página. Em apps maiores, usar react-helmet
  // ou similar para também controlar meta description/og:tags.
  useEffect(() => {
    if (data) {
      document.title = `Sobre — ${data.companyName}`;
    }
  }, [data]);

  return (
    <InstitutionalLayout
      loading={loading}
      error={error}
      eyebrow="Institucional"
      title={data ? `Sobre a ${data.companyName}` : undefined}
      subtitle={data?.tagline}
    >
      {data && (
        <>
          {/* Lead paragraph — descrição introdutória com peso visual maior
              para contextualizar o leitor antes das seções específicas. */}
          <p className="text-lg text-foreground/90 leading-relaxed mb-10">
            {data.description}
          </p>

          {/* Iteração sobre seções genéricas — adicionar/remover blocos no
              backend NÃO requer mudança aqui. Esse é o ganho de modelar
              o conteúdo como array de ContentSection. */}
          <div className="space-y-10">
            {data.sections.map(section => (
              <section key={section.id} aria-labelledby={`section-${section.id}`}>
                <h2
                  id={`section-${section.id}`}
                  className="text-2xl font-semibold text-foreground mb-3"
                >
                  {section.title}
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </>
      )}
    </InstitutionalLayout>
  );
}
