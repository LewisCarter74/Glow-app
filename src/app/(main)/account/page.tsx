
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, Heart, User, LogOut, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  
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
    signOut();
    router.push('/login');
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
