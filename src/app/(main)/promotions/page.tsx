'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Gift, Star, TicketPercent, Clipboard, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { getLoyaltyPoints, redeemLoyaltyPoints, fetchPromotions } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Promotion {
    id: string | number;
    name: string;
    description: string;
    promo_type: string;
}

export default function PromotionsPage() {
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemAmount, setRedeemAmount] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const referralPromo = promotions.find(p => p.promo_type === 'referral');

  const copyToClipboard = () => {
    if (referralPromo) {
        // Extracts the code from a description like "Share your unique referral code: YOURCODE123 and earn rewards!"
        const referralCode = referralPromo.description.split(': ')[1]?.split(' ')[0];
        if (referralCode) {
            navigator.clipboard.writeText(referralCode).then(() => {
                setCopied(true);
                toast({ title: 'Copied!', description: 'Referral code copied to clipboard.' });
                setTimeout(() => setCopied(false), 2000);
            });
        }
    }
  };

  const fetchPageData = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        const [pointsData, promosData] = await Promise.all([
          getLoyaltyPoints(),
          fetchPromotions(),
        ]);
        setLoyaltyPoints(pointsData.points);
        setPromotions(promosData);
      } catch (error) {
        console.error('Failed to fetch page data:', error);
        setError(error instanceof Error && (error.message.includes('401') || error.message.includes('403')) 
            ? 'Authentication failed. Please log in again.'
            : 'Could not load your rewards data. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleRedeem = async () => {
    if (!redeemAmount || redeemAmount <= 0) {
        toast({ title: 'Invalid Amount', description: 'Please enter a positive number of points to redeem.', variant: 'destructive' });
        return;
    }
    try {
        const response = await redeemLoyaltyPoints({ amount: redeemAmount });
        toast({ title: 'Success!', description: response.detail || 'Points redeemed successfully!' });
        fetchPageData(); 
    } catch (error) {
        toast({ title: 'Redemption Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.', variant: 'destructive'});
    }
  }

  const renderLoyaltyContent = () => {
    if (!user) {
      return (
        <div className="text-center flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground mb-4">Please log in to see your rewards.</p>
          <Button asChild><Link href="/login">Login</Link></Button>
        </div>
      );
    }
     if (loading) {
      return (
        <div className="text-center">
            <Skeleton className="h-20 w-32 mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto mt-2" />
        </div>
      );
    }
    if (error) {
      return <p className="text-destructive text-center">{error}</p>;
    }
    return (
      <div className='text-center'>
        <p className="text-6xl font-bold">{loyaltyPoints}</p>
        <p className="text-muted-foreground mt-2">Your current balance</p>
      </div>
    );
  };

  const renderPromotionCards = () => {
      if (loading && user) return null;
      if (!user) return null;

      const regularPromos = promotions.filter(p => p.promo_type !== 'referral');
      return regularPromos.map(promo => (
          <Card key={promo.id} className="bg-card shadow-lg border-primary/20 flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full"><Gift className="w-8 h-8 text-primary" /></div>
                <CardTitle className="text-primary text-2xl">{promo.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-lg">{promo.description}</p>
            </CardContent>
            <CardFooter><Button asChild className="w-full"><Link href="/booking">Book Now</Link></Button></CardFooter>
          </Card>
      ));
  };
  
  const renderReferralCard = () => {
    if (loading && user) return null;
    if (!user || !referralPromo) return null;

    const referralCode = referralPromo.description.split(': ')[1]?.split(' ')[0];

    return (
        <Card className="bg-card shadow-lg border-secondary-foreground/20 flex flex-col">
            <CardHeader>
            <div className="flex items-center gap-4">
                <div className="bg-secondary p-3 rounded-full"><TicketPercent className="w-8 h-8 text-secondary-foreground" /></div>
                <CardTitle className="text-secondary-foreground text-2xl">{referralPromo.name}</CardTitle>
            </div>
            </CardHeader>
            <CardContent className="flex-grow">
            <p className="text-muted-foreground text-lg">
                Share your unique code to give friends a discount and earn points!
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3">
                <Input readOnly value={referralCode || 'Loading...'} className="flex-grow bg-transparent border-0 shadow-none focus-visible:ring-0"/>
                <Button onClick={copyToClipboard} size="icon" variant="ghost" disabled={!referralCode}>
                    {copied ? <ClipboardCheck className="w-5 h-5 text-green-500" /> : <Clipboard className="w-5 h-5" />}
                </Button>
            </div>
            </CardContent>
            <CardFooter><Button asChild variant="secondary" className="w-full"><Link href="/booking">Book an Appointment</Link></Button></CardFooter>
        </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Promotions & Rewards</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">Exclusive offers and your loyalty rewards, all in one place.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {renderPromotionCards()}

        <Card className="bg-card shadow-lg border-accent/20 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-full"><Star className="w-8 h-8 text-accent" /></div>
              <CardTitle className="text-accent text-2xl">Loyalty Points</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-grow text-center">{renderLoyaltyContent()}</CardContent>
          {user && !error && (
            <CardFooter className="flex-col items-stretch space-y-2">
                <div className="flex gap-2">
                    <Input type="number" placeholder="Amount" value={redeemAmount > 0 ? redeemAmount : ''} onChange={e => setRedeemAmount(Number(e.target.value))} className="w-2/3" />
                    <Button onClick={handleRedeem} className="flex-1">Redeem</Button>
                </div>
            </CardFooter>
          )}
        </Card>

        {renderReferralCard()}
      </div>
    </div>
  );
}
