import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthService } from '../../services/auth.service.js';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.jsx';
import { AlertBanner } from '../../components/ui/alert-banner.jsx';
import { Sparkles, ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setFeedback(null);
    try {
      await AuthService.resetPassword(email);
      setFeedback({
        type: 'success',
        message: 'Password reset instructions have been sent to your email address.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Unable to process password reset request.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="text-sm text-zinc-400">Enter your email to receive recovery instructions</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/60 shadow-xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Account Recovery</CardTitle>
              <CardDescription>We will send a password reset link to your registered email</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {feedback && (
                <AlertBanner
                  variant={feedback.type}
                  message={feedback.message}
                  onDismiss={() => setFeedback(null)}
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
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Send Reset Link
              </Button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
