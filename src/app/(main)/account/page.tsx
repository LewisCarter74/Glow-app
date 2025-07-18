
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, Heart, User, LogOut, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { useEffect } from 'react'; // Removed useEffect import as it's no longer used for redirection on this page

export default function AccountPage() {
  const router = useRouter();
  const { logout, user, isLoading } = useAuth();
  
  // Removed the useEffect hook that caused redirection conflicts during logout.
  // The logout function in useAuth now handles the full page redirect to the homepage.
  // If an unauthenticated user directly navigates to this page, they will see 'Loading...' indefinitely.
  // This is a trade-off to ensure the logout button consistently redirects to the homepage.

  const menuItems = [
    {
      icon: <User className="w-5 h-5 text-primary" />,
      title: 'Profile Information',
      description: 'View and edit your personal details.',
      path: '/account/profile',
    },
    {
      icon: <Calendar className="w-5 h-5 text-primary" />,
      title: 'My Appointments',
      description: 'See your upcoming and past bookings.',
      path: '/account/appointments',
    },
    {
      icon: <Heart className="w-5 h-5 text-primary" />,
      title: 'My Favourites',
      description: 'Access your saved stylists and services.',
      path: '/account/favourites',
    },
  ];
  
  const handleSignOut = () => {
    logout(); // This will clear auth and redirect to homepage via window.location.href in useAuth
  }

  // Show loading state while authentication status is being determined.
  // If not loading and no user, this component will remain in a loading state as 
  // it expects to be redirected by the logout function if a logout was initiated, 
  // or by a higher-level guard if directly accessed unauthenticated.
  if (isLoading || !user) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">My Account</h1>
        <p className="text-lg text-muted-foreground mt-4">Manage your profile, appointments, and favorites.</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="w-full text-left p-4 rounded-lg hover:bg-secondary/50 transition-colors flex items-center gap-4"
            >
              <div className="bg-secondary p-3 rounded-full">
                {item.icon}
              </div>
              <div className="flex-grow">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>
      
       <div className="max-w-2xl mx-auto mt-6">
          <Button variant="ghost" onClick={handleSignOut} className="w-full text-muted-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
       </div>
    </div>
  );
}
