'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Gift, Send } from 'lucide-react';

export default function ReferralsPage() {
  const { toast } = useToast();
  const referralLink = "https://glowapp.com/signup?ref=user123"; // Placeholder

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied to clipboard!',
      description: 'Your referral link is ready to be shared.',
    });
  };

  const emailSubject = encodeURIComponent("You're Invited to GlowApp!");
  const emailBody = encodeURIComponent(
    `I love using GlowApp for my salon appointments and thought you would too! Use my personal link to sign up: ${referralLink}`
  );
  const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Refer & Earn</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Share the love for GlowApp and get rewarded with loyalty points for every successful referral.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gift className="text-primary" />
            Your Personal Referral Link
          </CardTitle>
          <CardDescription>
            Share this link with your friends. When they sign up and book, you get 100 loyalty points!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={referralLink} readOnly className="text-muted-foreground"/>
            <Button onClick={copyToClipboard} variant="outline" size="icon" aria-label="Copy link">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="w-full sm:w-auto">
                <a href={mailtoLink}>
                    <Send className="mr-2 h-4 w-4"/> Share via Email
                </a>
            </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center max-w-2xl mx-auto">
        <h3 className="font-semibold text-lg">Pro Tip</h3>
        <p className="text-muted-foreground text-sm mt-1">
          The more friends you refer, the more surprise promotions and exclusive offers you'll unlock over time. Start sharing today!
        </p>
      </div>
    </div>
  );
}
