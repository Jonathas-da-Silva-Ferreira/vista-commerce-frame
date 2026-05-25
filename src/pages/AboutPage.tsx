// "About Us" page — pure presentation; content comes from the API.

import { useEffect } from 'react';
import { useAbout } from '@/hooks/useInstitutional';
import InstitutionalLayout from '@/components/institutional/InstitutionalLayout';

export default function AboutPage() {
  const { data, loading, error } = useAbout();

  // Per-page title for SEO and tab clarity. For richer SEO control
  // (description, OG tags) a helmet library would be added later.
  useEffect(() => {
    if (data) {
      document.title = `About — ${data.companyName}`;
    }
  }, [data]);

  return (
    <InstitutionalLayout
      loading={loading}
      error={error}
      eyebrow="About"
      title={data ? `About ${data.companyName}` : undefined}
      subtitle={data?.tagline}
    >
      {data && (
        <>
          {/* Lead paragraph carries heavier visual weight to orient the
              reader before diving into the section-by-section content. */}
          <p className="text-lg text-foreground/90 leading-relaxed mb-10">
            {data.description}
          </p>

          {/* Iterating over generic sections means marketing can add/remove
              blocks via the CMS without code changes here. */}
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
