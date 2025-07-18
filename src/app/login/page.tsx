
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginUser } from '@/lib/api'; // Import loginUser

function LoginComponent() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirect if already logged in (check localStorage directly or a simpler flag)
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/'); // Redirect to home if user data exists in local storage
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    
    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }

      await loginUser(email, password);
      toast({
            title: 'Login Successful',
            description: "Welcome back!",
      });
      router.push('/'); // Redirect to home on successful login

    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: (error instanceof Error) ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };
  
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginComponent />
    </Suspense>
  )
}
