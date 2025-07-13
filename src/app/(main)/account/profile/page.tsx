
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function ProfileDetailsPage() {
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState('Ada Lovelace');
  const [email, setEmail] = useState('ada@example.com');
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
            <p className="text-lg text-muted-foreground mt-4">Update your personal details.</p>
        </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>My Details</CardTitle>
          <CardDescription>Manage your account information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled />
          </div>
          <div className="flex justify-between items-center">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
