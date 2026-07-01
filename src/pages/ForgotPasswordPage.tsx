import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ForgotPasswordPage — starts the password recovery flow.
 *
 * Why a dedicated route instead of a dialog: the reset email link brings the
 * user back to a specific URL (/reset-password). Keeping the request step
 * on its own route mirrors that pattern and makes deep-linking simple.
 *
 * Security note: we ALWAYS show a generic "check your email" success message
 * even when the email doesn't exist. Leaking "email not found" would enable
 * account enumeration attacks. The Supabase call itself won't error on
 * unknown emails for the same reason.
 */
export default function ForgotPasswordPage() {
  const { resetPasswordForEmail, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // Already signed in? No reason to request a reset — send them home.
  if (!loading && isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return; // Prevent duplicate reset emails from double-clicks.
    const clean = email.trim().toLowerCase();
    // Minimal shape check — the server does the real validation.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      toast.error('Enter a valid email address');
      return;
    }
    setBusy(true);
    const { error } = await resetPasswordForEmail(clean);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    // Generic message regardless of whether the account exists.
    setSent(true);
    toast.success('If an account exists, a reset link is on its way.');
  };

  return (
    <MainLayout>
      <SEO title="Reset your password" description="Recover access to your Nexora account by requesting a password reset link." />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/50">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
            <h1 className="text-2xl font-bold">Forgot your password?</h1>
            <p className="text-muted-foreground mt-1 mb-6">
              Enter your account email and we'll send you a link to set a new one.
            </p>

            {sent ? (
              // We don't reveal whether the address exists — same copy either way.
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
                <p className="font-medium">Check your inbox</p>
                <p className="text-muted-foreground mt-1">
                  If an account matches <span className="text-foreground">{email}</span>, you'll
                  get an email with instructions to reset your password shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={busy}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
