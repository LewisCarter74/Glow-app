
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

function LoginComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('ada@example.com');
  const [password, setPassword] = useState('password');
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const redirectedFrom = searchParams.get('redirectedFrom');

  useEffect(() => {
    // This effect handles the redirect AFTER the user state has been updated.
    if (user && !isAuthLoading) {
        const destination = redirectedFrom || '/account';
        router.push(destination);
    }
  }, [user, isAuthLoading, router, redirectedFrom]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    try {
      // The signIn function will update the user state,
      // which will trigger the useEffect above to handle the redirect.
      await signIn(email, password);
      toast({
            title: 'Login Successful',
            description: "Welcome back!",
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please check your email and password.',
      });
      setIsSigningIn(false); // Only set signing in to false on error
    } 
    // Do not set isSigningIn to false on success, to avoid screen flicker before redirect.
  };

  // While the auth state is being determined, show a loading indicator.
  if (isAuthLoading && !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="w-full max-w-sm mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ada@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div className="text-sm">
                <Link href="/forgot-password"className="underline">
                  Forgot password?
                </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// It's crucial to wrap the component that uses `useSearchParams` in a Suspense boundary.
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginComponent />
    </Suspense>
  )
}
