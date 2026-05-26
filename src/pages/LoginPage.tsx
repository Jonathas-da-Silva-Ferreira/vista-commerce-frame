import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserX, ShoppingBag, Heart, Clock, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { login, register: authRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // ProtectedRoute stashes the originally-requested location in router state.
  // We read it once on render so a successful auth bounces the user back to
  // the page they were trying to reach (e.g. /checkout) instead of "/".
  const from = (routerLocation.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';
  const isRedirected = from !== '/';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginData.email, loginData.password);
    toast.success('Signed in successfully!');
    navigate(from, { replace: true });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mirror the password twice to catch typos before sending anything to the
    // backend — the only safe way to confirm a value the user cannot see.
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    authRegister(registerData.name, registerData.email, registerData.password);
    toast.success('Account created successfully!');
    navigate(from, { replace: true });
  };

  const handleGuestContinue = () => {
    toast.info('Continuing as a guest');
    // Guest path always lands on the homepage — guests can browse and add
    // to cart, but cannot reach checkout (the route is protected).
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border/50">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Welcome to Nexora</h1>
              <p className="text-muted-foreground mt-1">Sign in to your account or create a new one</p>
            </div>

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
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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

                  <div className="flex items-center justify-end">
                    <Link to="/login" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Your name"
                        className="pl-10"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@email.com"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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
                    <Label htmlFor="register-confirm">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-confirm"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repeat the password"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Guest path — never block exploration behind a sign-up wall. */}
            <div className="mt-6">
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  or
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 gap-2"
                size="lg"
                onClick={handleGuestContinue}
              >
                <UserX className="w-4 h-4" />
                Continue as guest
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-6">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <p className="text-sm font-semibold mb-3 text-center">Why create an account?</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Save favorites</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Order history</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Faster checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
