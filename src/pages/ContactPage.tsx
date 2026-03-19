import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    if (!form.subject.trim()) e.subject = 'Assunto é obrigatório';
    if (!form.message.trim()) e.message = 'Mensagem é obrigatória';
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
      toast({ title: 'Erro', description: 'Não foi possível enviar sua mensagem. Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">Fale Conosco</h1>
        <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          Tem alguma dúvida, sugestão ou precisa de ajuda? Preencha o formulário e entraremos em contato em breve.
        </p>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Sidebar info */}
          <aside className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h2 className="font-semibold text-lg">Informações</h2>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">suporte@marketbr.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">(11) 9999-8888</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Endereço</p>
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
                <h2 className="text-xl font-semibold">Mensagem enviada!</h2>
                <p className="text-muted-foreground max-w-md">
                  Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setSuccess(false)}>
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input id="name" placeholder="Seu nome" value={form.name} onChange={set('name')} maxLength={100} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" value={form.email} onChange={set('email')} maxLength={255} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" value={form.phone} onChange={set('phone')} maxLength={20} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto *</Label>
                    <Input id="subject" placeholder="Assunto da mensagem" value={form.subject} onChange={set('subject')} maxLength={150} />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea id="message" placeholder="Escreva sua mensagem aqui..." rows={6} value={form.message} onChange={set('message')} maxLength={2000} />
                  {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                </div>

                <Button type="submit" className="w-full sm:w-auto gap-2" disabled={loading}>
                  <Send className="w-4 h-4" />
                  {loading ? 'Enviando...' : 'Enviar mensagem'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
