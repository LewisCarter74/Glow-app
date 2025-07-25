
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth

function LoginComponent() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading } = useAuth(); // Use login, isAuthenticated, isLoading from useAuth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission

  // Handle redirection after auth state is determined by useAuth
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/'); // Redirect to home if authenticated and not loading
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Set submitting state
    
    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password.");
      }

      await login({ email, password }); // Use login from useAuth
      toast({
            title: 'Login Successful',
            description: "Welcome back!",
      });
      // Redirection is handled by the useEffect hook

    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: (error instanceof Error) ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };
  
  // Show a loading state for the component while auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // If user is authenticated, and not loading, we redirect via useEffect
  // So, if we reach here and isAuthenticated is true, it means useEffect hasn't run yet
  // or is in the process of redirecting. We can render nothing or a small loader.
  if (isAuthenticated && !isLoading) {
    return null; // Or a simple loading spinner
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
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
