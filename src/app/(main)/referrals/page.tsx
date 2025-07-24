'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const referralLink = `${window.location.origin}/signup?ref=${user?.referral_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard.',
    });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">
          Refer a Friend
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Share your referral link and earn 100 points for every friend who
          signs up and books an appointment.
        </p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Your Unique Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <p className="text-lg font-mono p-2 bg-muted rounded-md flex-grow">
              {referralLink}
            </p>
            <Button onClick={copyToClipboard} variant="outline" size="icon">
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
