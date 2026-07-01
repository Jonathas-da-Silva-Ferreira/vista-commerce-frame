import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * ResetPasswordPage — completes the password recovery flow.
 *
 * How the token arrives: Supabase's recovery email points at
 * /reset-password with a `type=recovery` hash. When the page loads, the
 * Supabase client detects it and fires a PASSWORD_RECOVERY auth event,
 * which authenticates the user for the ONE purpose of updating their
 * password. That's why this page must be publicly reachable — the user
 * is not "signed in" yet in the normal sense.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  // `ready` becomes true once we have a recovery session — until then we
  // can't call updateUser() successfully. Guarding UI on this avoids the
  // user submitting a new password against an empty session.
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event — Supabase fires it after
    // parsing the recovery token from the URL fragment on page load.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
      }
    });

    // Fallback: if the URL doesn't contain a recovery hash after a beat,
    // the link is either expired or was opened directly. Tell the user.
    const t = setTimeout(() => {
      setReady((prev) => {
        if (!prev && !window.location.hash.includes('type=recovery')) {
          setInvalid(true);
        }
        return prev;
      });
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    // Same strength policy as sign-up so a reset can't downgrade security.
    const strong = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
    if (!strong) {
      toast.error('Password must be 8+ chars with upper, lower and a number');
      return;
    }
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Password updated. Please sign in with your new password.');
    // Sign out the recovery session so the login form is the next step —
    // this is safer than auto-logging-in with the temporary token.
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <MainLayout>
      <SEO title="Set a new password" description="Choose a new password for your Nexora account." />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/50">
            <h1 className="text-2xl font-bold">Set a new password</h1>
            <p className="text-muted-foreground mt-1 mb-6">
              Choose a strong password you haven't used before.
            </p>

            {invalid ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p className="font-medium text-destructive">Invalid or expired link</p>
                <p className="text-muted-foreground mt-1">
                  Please request a new reset link from the{' '}
                  <Link to="/forgot-password" className="text-primary hover:underline">forgot password</Link> page.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="pl-10 pr-10"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      className="pl-10"
                      placeholder="Repeat the new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={busy || !ready}>
                  {busy
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : ready ? 'Update password' : 'Preparing…'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
