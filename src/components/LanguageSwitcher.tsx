import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

// Display names live close to the switcher (and not in JSON) because they
// must always render in their own language — a Brazilian user choosing
// "English" should still see "Português" labelled in Portuguese.
const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'pt-BR': 'Português (BR)',
  'en-US': 'English (US)',
};

interface LanguageSwitcherProps {
  variant?: 'icon' | 'full';
}

export default function LanguageSwitcher({ variant = 'icon' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  // i18n.resolvedLanguage gives us the negotiated match (e.g. "pt" → "pt-BR"),
  // which is what we want to highlight — not the raw user preference.
  const current = (i18n.resolvedLanguage || i18n.language) as SupportedLanguage;

  const handleChange = (lang: SupportedLanguage) => {
    // changeLanguage persists via the LanguageDetector cache (localStorage)
    // and triggers our `languageChanged` listener to update <html lang>.
    void i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('language.label')}
        className="flex flex-col items-center gap-1 text-foreground/80 hover:text-foreground transition-colors"
      >
        <Globe className="w-6 h-6" />
        {variant === 'full' ? (
          <span className="text-xs font-medium">{LANGUAGE_LABELS[current]}</span>
        ) : (
          <span className="text-xs font-medium uppercase">{current.split('-')[0]}</span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleChange(lang)}
            className={lang === current ? 'font-semibold text-primary' : ''}
          >
            {LANGUAGE_LABELS[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
