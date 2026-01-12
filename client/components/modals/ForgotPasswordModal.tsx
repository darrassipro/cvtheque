'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRequestPasswordResetMutation } from '@/lib/services/authApi';
import { closeAllModals, switchToLogin, clearAuthError } from '@/lib/slices/authSlice';
import { RootState } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Send, Loader2 } from 'lucide-react';

export default function ForgotPasswordModal() {
  const dispatch = useDispatch();
  const { isForgotPasswordOpen } = useSelector((state: RootState) => state.auth);
  const [requestPasswordReset, { isLoading }] = useRequestPasswordResetMutation();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isForgotPasswordOpen) {
      setEmail('');
      setSubmitted(false);
      dispatch(clearAuthError());
    }
  }, [isForgotPasswordOpen, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await requestPasswordReset({ email }).unwrap();
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (err: any) {
      const message = err?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(message);
    }
  };

  return (
    <Dialog open={isForgotPasswordOpen} onOpenChange={(open) => !open && dispatch(closeAllModals())}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Reset Password</DialogTitle>
          <DialogDescription>
            {submitted
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive password reset instructions'}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-4 mt-4">
            <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              <p className="font-medium mb-1">Email Sent!</p>
              <p>If an account exists with {email}, you will receive password reset instructions shortly.</p>
            </div>

            <Button
              onClick={() => dispatch(switchToLogin())}
              className="w-full"
              variant="outline"
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => dispatch(switchToLogin())}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
