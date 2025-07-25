'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Gift, Star, TicketPercent } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { getLoyaltyPoints, redeemLoyaltyPoints } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function PromotionsPage() {
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeemAmount, setRedeemAmount] = useState<number | string>('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPoints = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        const data = await getLoyaltyPoints();
        setLoyaltyPoints(data.points);
      } catch (err) {
        console.error('Failed to fetch loyalty points:', err);
        const errorMessage =
          err instanceof Error &&
          (err.message.includes('401') || err.message.includes('403'))
            ? 'Authentication failed. Please log in again.'
            : 'Could not load your loyalty points. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setLoyaltyPoints(0);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const handleRedeem = async () => {
    if (!redeemAmount || +redeemAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a positive number of points to redeem.',
        variant: 'destructive',
      });
      return;
    }

    if (loyaltyPoints === null || +redeemAmount > loyaltyPoints) {
      toast({
        title: 'Insufficient Points',
        description: 'You do not have enough points to redeem this amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsRedeeming(true);
    try {
      const result = await redeemLoyaltyPoints({ amount: +redeemAmount });
      toast({
        title: 'Success!',
        description: `${result.message}. Your new balance is ${result.new_loyalty_points}.`,
      });
      setLoyaltyPoints(result.new_loyalty_points);
      setRedeemAmount('');
    } catch (err) {
      console.error('Failed to redeem points:', err);
      toast({
        title: 'Redemption Failed',
        description:
          err instanceof Error ? err.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const renderLoyaltyCardContent = () => {
    if (loading) {
      return (
        <CardContent className="flex-grow flex flex-col items-center justify-center">
          <Skeleton className="h-16 w-24 mb-2" />
          <Skeleton className="h-6 w-40" />
        </CardContent>
      );
    }

    if (error) {
      return (
        <CardContent className="flex-grow flex flex-col items-center justify-center">
          <p className="text-destructive text-center">{error}</p>
        </CardContent>
      );
    }

    if (!user) {
      return (
        <CardContent className="flex-grow flex flex-col items-center justify-center">
          <p className="text-muted-foreground text-center">
            Please{' '}
            <Link href="/login" className="text-primary hover:underline">
              log in
            </Link>{' '}
            to see your loyalty points.
          </p>
        </CardContent>
      );
    }

    return (
      <>
        <CardContent className="flex-grow text-center">
          <p className="text-6xl font-bold">{loyaltyPoints ?? '0'}</p>
          <p className="text-muted-foreground mt-2">Your current balance</p>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <div className="w-full flex gap-2">
            <Input
              type="number"
              placeholder="Points to redeem"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              disabled={isRedeeming}
              className="w-full"
            />
            <Button
              onClick={handleRedeem}
              disabled={isRedeeming || !redeemAmount || +redeemAmount <= 0}
              className="w-auto"
            >
              {isRedeeming ? 'Redeeming...' : 'Redeem'}
            </Button>
          </div>
        </CardFooter>
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">
          Promotions & Rewards
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Exclusive offers and your loyalty rewards, all in one place.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Welcome Offer */}
        <Card className="bg-card shadow-lg border-primary/20 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-primary text-2xl">
                Welcome Offer
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground text-lg">
              Enjoy{' '}
              <span className="font-bold text-foreground">20% off</span> your
              first service with us!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This offer is automatically applied for new customers.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/booking">Book Now & Redeem</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Loyalty Points */}
        <Card className="bg-card shadow-lg border-accent/20 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-full">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-accent text-2xl">
                Loyalty Points
              </CardTitle>
            </div>
          </CardHeader>
          {renderLoyaltyCardContent()}
        </Card>

        {/* Referral Program */}
        <Card className="bg-card shadow-lg border-secondary-foreground/20 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-secondary/10 p-3 rounded-full">
                <TicketPercent className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-secondary-foreground text-2xl">
                Refer a Friend
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground text-lg">
              Get <span className="font-bold text-foreground">100 points</span>{' '}
              for every friend who signs up and books an appointment!
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/referrals">Get Your Referral Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
