// Página "Nossa História" — timeline vertical com marcos da empresa.

import { useEffect } from 'react';
import { useHistory } from '@/hooks/useInstitutional';
import InstitutionalLayout from '@/components/institutional/InstitutionalLayout';

export default function HistoryPage() {
  const { data, loading, error } = useHistory();

  useEffect(() => {
    if (data) document.title = `${data.title} — MarketBR`;
  }, [data]);

  return (
    <InstitutionalLayout
      loading={loading}
      error={error}
      eyebrow="Nossa Trajetória"
      title={data?.title}
      subtitle={data?.intro}
    >
      {data && (
        // Timeline construída com pseudo-elemento via border-left para evitar
        // SVG ou lib de timeline — mantém o bundle leve e o estilo no design system.
        <ol className="relative border-l-2 border-border ml-3 space-y-10">
          {data.milestones.map((milestone, idx) => (
            <li key={`${milestone.year}-${idx}`} className="pl-8 relative">
              {/* Bullet circular posicionado sobre a linha — usa cor primária
                  (token) para destacar marcos sem cor hardcoded. */}
              <span
                aria-hidden="true"
                className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-primary border-4 border-background shadow"
              />
              {/* Year com peso tipográfico para servir como ancora visual
                  e permitir scan rápido pela cronologia. */}
              <p className="text-sm font-bold uppercase tracking-wider text-primary mb-1">
                {milestone.year}
              </p>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {milestone.title}
              </h2>
              <p className="text-foreground/80 leading-relaxed">
                {milestone.description}
              </p>
            </li>
          ))}
        </ol>
      )}
    </InstitutionalLayout>
  );
}
