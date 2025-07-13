
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StylistCard from '@/components/StylistCard';
import { stylists } from '@/lib/placeholder-data';

export default function FavouritesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">My Favourites</h1>
            <p className="text-lg text-muted-foreground mt-4">Your favorite stylists for quick re-booking.</p>
        </div>
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Favourite Stylists</CardTitle>
                <CardDescription>A list of stylists you have marked as your favourites.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <StylistCard stylist={stylists[0]} />
                <StylistCard stylist={stylists[1]} />
            </CardContent>
        </Card>
    </div>
  );
}
