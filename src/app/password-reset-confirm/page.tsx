
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { confirmPasswordReset } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PasswordResetConfirmPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!uid || !token) {
      setError('Invalid password reset link. Please try again from the forgot password page.');
    }
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      toast({
        title: 'Error',
        description: 'New password and confirmation password do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (!uid || !token) {
      setError('Missing UID or Token. Cannot reset password.');
      toast({
        title: 'Error',
        description: 'Invalid password reset link. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await confirmPasswordReset({ uid, token, new_password: newPassword });
      setIsSubmitted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Failed to reset password: ${errorMessage}`);
      toast({
        title: 'Error',
        description: `Failed to reset password: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            {isSubmitted
              ? "Your password has been successfully reset."
              : error || "Enter your new password below."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="text-center">
              <p>You can now log in with your new password.</p>
              <Button asChild className="mt-4">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={!uid || !token}>
                Reset Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
