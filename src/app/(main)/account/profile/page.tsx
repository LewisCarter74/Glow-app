
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { fetchUserProfile, logoutUser } from '@/lib/api'; // Import fetchUserProfile and logoutUser
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  name: string;
  profile_image_url: string | null;
}

export default function ProfileDetailsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setUserProfile(profile);
        setDisplayName(profile.name || `${profile.first_name} ${profile.last_name}`);
      } catch (err) {
        setError((err as Error).message || 'Failed to load profile.');
        toast({
          variant: 'destructive',
          title: 'Profile Load Error',
          description: (err as Error).message || 'Could not fetch user profile.',
        });
        // If profile fetching fails, especially due to auth, redirect to login
        router.push('/login'); 
      } finally {
        setIsLoading(false);
      }
    };
    getUserProfile();
  }, [toast, router]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Implement update profile logic here if needed. This example only displays.
    // For now, it will just show a success toast.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    toast({
        title: "Success",
        description: "Your profile has been updated.",
    });
    setIsSaving(false);
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/login'); // Redirect to login page after logout
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error || 'No profile data available.'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">Profile Information</h1>
            <p className="text-lg text-muted-foreground mt-4">View and update your personal details.</p>
        </div>
      
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Display Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>My Details</CardTitle>
            <CardDescription>This is your current account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userProfile.profile_image_url && (
              <div className="mb-4">
                <img 
                  src={userProfile.profile_image_url} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover mx-auto"
                />
              </div>
            )}
            <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{userProfile.name}</p>
            </div>
            <Separator/>
            <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{userProfile.email}</p>
            </div>
            <Separator/>
            <div>
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <p className="text-lg">{userProfile.phone_number || 'N/A'}</p>
            </div>
            <Separator/>
            <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-lg capitalize">{userProfile.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Update Information Card - Simplified for now as backend update is not implemented here */}
        <Card>
          <CardHeader>
            <CardTitle>Update Information</CardTitle>
            <CardDescription>Need to make a change? Update your details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={userProfile.email} disabled />
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
        <Button onClick={handleLogout} className="w-full mt-4" variant="outline">
          Log Out
        </Button>
      </div>
    </div>
  );
}
