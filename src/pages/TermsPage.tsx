// "Terms of Use" page — long-form legal document with numbered sections.

import { useEffect, useMemo } from 'react';
import { useTerms } from '@/hooks/useInstitutional';
import InstitutionalLayout from '@/components/institutional/InstitutionalLayout';

export default function TermsPage() {
  const { data, loading, error } = useTerms();

  useEffect(() => {
    if (data) document.title = `${data.title} — Nexora`;
  }, [data]);

  // Format the "last updated" date in the component (not in the content)
  // so the underlying API stays locale-agnostic. useMemo avoids rebuilding
  // the formatter each render.
  const formattedDate = useMemo(() => {
    if (!data?.lastUpdated) return null;
    try {
      return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date(data.lastUpdated));
    } catch {
      // Defensive fallback: render the raw value rather than crashing the
      // whole page if the upstream date string is malformed.
      return data.lastUpdated;
    }
  }, [data?.lastUpdated]);

  return (
    <InstitutionalLayout
      loading={loading}
      error={error}
      eyebrow="Legal document"
      title={data?.title}
      subtitle={
        data && (
          <>
            {data.intro}
            {formattedDate && (
              <span className="block text-sm text-muted-foreground/80 mt-3">
                Last updated: {formattedDate}
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
