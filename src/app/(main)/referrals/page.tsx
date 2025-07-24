'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (user?.referral_code) {
      // Always generate a localhost link for the referral
      setReferralLink(`http://localhost:9002/signup?ref=${user.referral_code}`);
    }
  }, [user]);

  const copyToClipboard = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">
          Refer a Friend
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Share your referral link and earn 100 points for every friend who
          signs up and books their first appointment.
        </p>
      </div>

      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Your Unique Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-muted">
            <p className="text-lg font-mono flex-grow overflow-x-auto whitespace-nowrap scrollbar-hide text-center sm:text-left">
              {referralLink || 'Generating your link...'}
            </p>
            <Button 
              onClick={copyToClipboard} 
              variant="default" 
              size="lg" 
              disabled={!referralLink}
              className="w-full sm:w-auto"
            >
              <Copy className="h-5 w-5 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
