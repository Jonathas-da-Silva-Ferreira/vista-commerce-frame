import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout — intentionally a transparent pass-through.
 *
 * Why: Header and Footer are now mounted ONCE at the App level (see App.tsx)
 * so they survive route changes. Re-mounting them per page was the main cause
 * of the white flash during navigation — the entire chrome unmounted, React
 * re-rendered an empty tree, and only then did the new page paint.
 *
 * We keep this component as a thin wrapper instead of deleting it because
 * every page imports it. Treating it as a no-op preserves the existing call
 * sites (and the option to add page-level affordances later, e.g. a
 * page-scoped error boundary) without a sweeping refactor.
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return <>{children}</>;
}
