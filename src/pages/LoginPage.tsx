import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, UserX, AlertCircle, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

/**
 * LoginPage is the single entry point for authentication. It supports:
 *  - Email/password sign-in and sign-up against Lovable Cloud auth.
 *  - Google OAuth via the managed Lovable wrapper.
 *  - Guest fallback that returns to the homepage (guests may still browse).
 *
 * We always honor the `from` location passed by ProtectedRoute so a user
 * bounced from /checkout returns there automatically after authenticating.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { signInWithPassword, signUp, signInWithGoogle } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const from = (routerLocation.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';
  const isRedirected = from !== '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await signInWithPassword(loginData.email, loginData.password);
    setBusy(false);
    if (error) {
      // Surface server-side reason (wrong password, unconfirmed email…)
      // so the user knows what to fix instead of a generic "failed".
      toast.error(error);
      return;
    }
    toast.success('Signed in successfully!');
    navigate(from, { replace: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setBusy(true);
    const { error } = await signUp(registerData.email, registerData.password, registerData.name);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    // With email confirmation enabled, the user must click the link before
    // a session is created. We message that explicitly to avoid confusion.
    toast.success('Account created! Check your email to confirm and sign in.');
  };

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await signInWithGoogle();
    setBusy(false);
    if (error) toast.error(error);
    // On success the page is redirected by the OAuth flow; no navigate() needed.
  };

  const handleGuestContinue = () => {
    toast.info('Continuing as a guest');
    navigate('/');
  };

  return (
    <MainLayout>
      {/* noindex would be ideal here but per-route robots meta requires
          extra plumbing; at minimum a unique title prevents duplication. */}
      <SEO title="Sign in or create an account" description="Access your Nexora account to manage orders, favorites and seller listings." />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/50">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Welcome to Nexora</h1>
              <p className="text-muted-foreground mt-1">Sign in to your account or create a new one</p>
            </div>

            {isRedirected && (
              <div className="mb-5 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p>You need to sign in to continue. We'll bring you right back.</p>
              </div>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="register">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="login-email" type="email" placeholder="you@email.com" className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={busy}>
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="register-name" type="text" placeholder="Your name" className="pl-10"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="register-email" type="email" placeholder="you@email.com" className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="register-password" type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters" className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="register-confirm" type={showPassword ? 'text' : 'password'}
                        placeholder="Repeat the password" className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={busy}>
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or
                </span>
              </div>

              <Button variant="outline" className="w-full mt-4 gap-2" size="lg" onClick={handleGoogle} disabled={busy}>
                Continue with Google
              </Button>

              <Button variant="ghost" className="w-full mt-2 gap-2" size="lg" onClick={handleGuestContinue}>
                <UserX className="w-4 h-4" />
                Continue as guest
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms of Use</Link>{' '}and{' '}
              <Link to="/terms" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
