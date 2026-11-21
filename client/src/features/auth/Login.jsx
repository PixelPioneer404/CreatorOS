import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useWorkspaceStore } from '../../store/useWorkspaceStore.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.jsx';
import { AlertBanner } from '../../components/ui/alert-banner.jsx';
import { Sparkles } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading, error: authError } = useAuthStore();
  const { loadWorkspaces, creatorProfile } = useWorkspaceStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please provide both email and password.');
      return;
    }

    try {
      await signIn(email, password);
      await loadWorkspaces();
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Failed to sign in. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="text-sm text-zinc-400">Sign in to your Creator OS workspace</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/60 shadow-xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your account credentials to continue</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {(formError || authError) && (
                <AlertBanner
                  variant="error"
                  message={formError || authError}
                  onDismiss={() => setFormError(null)}
                />
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="creator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In
              </Button>

              <p className="text-center text-xs text-zinc-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
