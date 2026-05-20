import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Form shape kept local: ContactPage owns its own validation lifecycle and
// doesn't share this contract with any other module, so a local interface
// avoids polluting global types.
interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialForm: ContactForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactPage() {
  // useTranslation gives us `t` (lookup) bound to the active language so
  // the form re-renders automatically when the user toggles locale.
  const { t } = useTranslation();
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  // Validation messages flow through i18n so a Brazilian user sees Portuguese
  // errors and an English user sees English ones — without duplicating logic.
  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = t('contact.validation.nameRequired');
    if (!form.email.trim()) e.email = t('contact.validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('contact.validation.emailInvalid');
    if (!form.subject.trim()) e.subject = t('contact.validation.subjectRequired');
    if (!form.message.trim()) e.message = t('contact.validation.messageRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, createdAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      setForm(initialForm);
    } catch {
      toast({ title: t('contact.errorTitle'), description: t('contact.errorDesc'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    // Eagerly clear the per-field error on change so the user sees their fix
    // reflected immediately — better UX than waiting for next submit.
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">{t('contact.title')}</h1>
        <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          {t('contact.subtitle')}
        </p>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Sidebar info */}
          <aside className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h2 className="font-semibold text-lg">{t('contact.info')}</h2>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('contact.email')}</p>
                  <p className="text-sm text-muted-foreground">suporte@nexora.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('contact.phone')}</p>
                  <p className="text-sm text-muted-foreground">(11) 9999-8888</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{t('contact.address')}</p>
                  <p className="text-sm text-muted-foreground">Av. Paulista, 1000 — São Paulo, SP</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div className="md:col-span-2">
            {success ? (
              <div className="flex flex-col items-center justify-center gap-4 bg-card border border-border rounded-xl p-12 text-center">
                <CheckCircle className="w-16 h-16 text-primary" />
                <h2 className="text-xl font-semibold">{t('contact.successTitle')}</h2>
                <p className="text-muted-foreground max-w-md">
                  {t('contact.successDesc')}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSuccess(false)}>
                  {t('contact.sendAnother')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('contact.name')} *</Label>
                    <Input id="name" placeholder={t('contact.namePlaceholder')} value={form.name} onChange={set('name')} maxLength={100} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.email')} *</Label>
                    <Input id="email" type="email" placeholder={t('contact.emailPlaceholder')} value={form.email} onChange={set('email')} maxLength={255} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('contact.phone')}</Label>
                    <Input id="phone" placeholder={t('contact.phonePlaceholder')} value={form.phone} onChange={set('phone')} maxLength={20} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.subject')} *</Label>
                    <Input id="subject" placeholder={t('contact.subjectPlaceholder')} value={form.subject} onChange={set('subject')} maxLength={150} />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.message')} *</Label>
                  <Textarea id="message" placeholder={t('contact.messagePlaceholder')} rows={6} value={form.message} onChange={set('message')} maxLength={2000} />
                  {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>

                <Button type="submit" className="w-full sm:w-auto gap-2" disabled={loading}>
                  <Send className="w-4 h-4" />
                  {loading ? t('contact.sending') : t('contact.send')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
