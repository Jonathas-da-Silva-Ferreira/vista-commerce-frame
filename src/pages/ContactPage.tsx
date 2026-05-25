import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Form shape kept local because no other module shares this contract — a
// local interface avoids polluting global types just to ship one screen.
interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialForm: ContactForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  // Client-side validation gives immediate feedback and reduces useless
  // round-trips. Server-side validation must still exist as the source of truth.
  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
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
      toast({ title: 'Error', description: 'Could not send your message. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    // Clear the field-specific error as the user types so the fix is reflected
    // immediately — much better UX than waiting for the next submit attempt.
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">Contact Us</h1>
        <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          Have a question, suggestion or need help? Fill out the form and we'll get back to you shortly.
        </p>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <aside className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h2 className="font-semibold text-lg">Information</h2>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@nexora.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (415) 555-0199</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">350 Mission St, San Francisco, CA</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="md:col-span-2">
            {success ? (
              <div className="flex flex-col items-center justify-center gap-4 bg-card border border-border rounded-xl p-12 text-center">
                <CheckCircle className="w-16 h-16 text-primary" />
                <h2 className="text-xl font-semibold">Message sent!</h2>
                <p className="text-muted-foreground max-w-md">
                  Your message was sent successfully. We'll be in touch soon.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSuccess(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" placeholder="Your name" value={form.name} onChange={set('name')} maxLength={100} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} maxLength={255} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="(000) 000-0000" value={form.phone} onChange={set('phone')} maxLength={20} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input id="subject" placeholder="Message subject" value={form.subject} onChange={set('subject')} maxLength={150} />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" placeholder="Write your message here..." rows={6} value={form.message} onChange={set('message')} maxLength={2000} />
                  {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>

                <Button type="submit" className="w-full sm:w-auto gap-2" disabled={loading}>
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send message'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
