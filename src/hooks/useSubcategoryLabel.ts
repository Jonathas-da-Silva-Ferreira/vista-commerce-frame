// Translates subcategory labels which arrive as raw Portuguese strings from
// the mock API (e.g. "Furadeiras", "Memória RAM"). We can't use the standard
// `t('subcategories.' + name)` lookup because those names contain dots,
// slashes, and spaces — i18next would treat the dots as nesting separators.
// Instead we read the resource bundle directly and do a plain JS map lookup.
import { useTranslation } from 'react-i18next';

export function useSubcategoryLabel() {
  // i18n is the actual instance; re-reads happen via the hook subscription so
  // a language switch re-renders consumers automatically.
  const { i18n } = useTranslation();

  return (name: string) => {
    if (!name) return name;
    const current = (i18n.getResource(i18n.language, 'translation', 'subcategories') || {}) as Record<string, string>;
    if (current[name]) return current[name];
    // Fallback to English bundle so untranslated pt-BR entries still resolve
    // before degrading to the raw API string.
    const fallback = (i18n.getResource('en-US', 'translation', 'subcategories') || {}) as Record<string, string>;
    return fallback[name] ?? name;
  };
}
