
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function ProfileDetailsPage() {
  const { toast } = useToast();
  
  // Mock current user data
  const currentUser = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
  };

  const [displayName, setDisplayName] = useState(currentUser.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Simulate saving to a backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
        title: "Success",
        description: "Your profile has been updated.",
    })
    setIsSaving(false);
  };

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
            <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{currentUser.name}</p>
            </div>
            <Separator/>
            <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{currentUser.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Update Information Card */}
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
              <Input id="email" type="email" value={currentUser.email} disabled />
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
