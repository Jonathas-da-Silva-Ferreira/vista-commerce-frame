// Centralizes category-name localization so any consumer (grid, filter,
// breadcrumbs, header) renders the same translated label without each
// component needing to know the slug→label mapping.
//
// WHY a helper instead of inlining `t(\`categories.${slug}\`)` everywhere:
//   1. Single point to handle unknown/new slugs — falls back to the API name
//      so user-created categories never display the raw key.
//   2. parseMissingKeyHandler in i18n would humanize "pet-shop" → "Pet Shop";
//      that's fine for English but wrong for pt-BR ("Petshop" vs "Pet Shop"),
//      so we explicitly prefer the API-provided name on miss.
import { useTranslation } from 'react-i18next';

export function useCategoryLabel() {
  const { t, i18n } = useTranslation();

  return (slug: string, fallbackName?: string) => {
    const key = `categories.${slug}`;
    // i18n.exists checks the current resource bundle; using it avoids the
    // generic parseMissingKeyHandler from producing a "humanized" English
    // label when the slug is missing from translations.
    if (i18n.exists(key)) return t(key);
    return fallbackName ?? slug;
  };
}
