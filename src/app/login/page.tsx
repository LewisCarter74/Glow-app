
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
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('ada@example.com');
  const [password, setPassword] = useState('password');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const redirectedFrom = searchParams.get('redirectedFrom');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    try {
      await signIn(email, password);
      // The redirect will now be handled by the useEffect below
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please check your email and password.',
      });
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    // This effect runs when the user state changes.
    // If the user is logged in, redirect them.
    if (user) {
        toast({
            title: 'Login Successful',
            description: "Welcome back!",
        });
        router.push(redirectedFrom || '/account');
    }
  }, [user, router, redirectedFrom, toast]);
  

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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent />
    </Suspense>
  )
}
