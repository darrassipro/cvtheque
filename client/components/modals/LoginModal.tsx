'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '@/lib/services/authApi';
import { setCredentials, closeAllModals, switchToRegister, switchToForgotPassword, setAuthError, clearAuthError } from '@/lib/slices/authSlice';
import { RootState } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';

export default function LoginModal() {
  const dispatch = useDispatch();
  const { isLoginOpen, error } = useSelector((state: RootState) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!isLoginOpen) {
      setFormData({ email: '', password: '' });
      dispatch(clearAuthError());
    }
  }, [isLoginOpen, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());

    try {
      const result = await login(formData).unwrap();
      dispatch(setCredentials({ user: result.data.user }));
      toast.success('Welcome back!');
      dispatch(closeAllModals());
    } catch (err: any) {
      const message = err?.data?.message || 'Login failed. Please try again.';
      dispatch(setAuthError(message));
      toast.error(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={isLoginOpen} onOpenChange={(open) => !open && dispatch(closeAllModals())}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome Back</DialogTitle>
          <DialogDescription>
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => dispatch(switchToForgotPassword())}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => dispatch(switchToRegister())}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Sign up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
