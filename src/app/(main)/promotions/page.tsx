'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Gift, Star, TicketPercent } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getLoyaltyPoints } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function PromotionsPage() {
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getLoyaltyPoints()
        .then((data) => {
          setLoyaltyPoints(data.points);
        })
        .catch((error) => {
          console.error('Failed to fetch loyalty points:', error);
        });
    }
  }, [user]);

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
              <Link href="/book">Book Now & Redeem</Link>
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
          <CardContent className="flex-grow text-center">
            <p className="text-6xl font-bold">{loyaltyPoints}</p>
            <p className="text-muted-foreground mt-2">Your current balance</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Redeem Loyalty Points
            </Button>
          </CardFooter>
        </Card>

        {/* Referral Program */}
        <Card className="bg-card shadow-lg border-secondary-foreground/20 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-secondary p-3 rounded-full">
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
            <Button asChild variant="secondary" className="w-full">
              <Link href="/referrals">Get Your Referral Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
