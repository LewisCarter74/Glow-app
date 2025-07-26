'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StylistCard from '@/components/StylistCard';
import { getFavorites, removeFavorite } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Stylist } from '@/lib/types';

export default function FavouritesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [favoriteStylists, setFavoriteStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getFavorites();
      const stylistsOnly = data.map((fav: any) => fav.stylist);
      setFavoriteStylists(stylistsOnly);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to load favorite stylists.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchFavorites();
    }
  }, [authLoading, fetchFavorites]);

  const handleRemoveFavorite = async (stylistId: string) => {
    try {
      await removeFavorite(Number(stylistId));
      setFavoriteStylists((prev) => prev.filter((s) => String(s.id) !== stylistId));
      toast({
        title: 'Removed from Favorites',
        description: `Stylist has been removed from your favorites.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove from favorites.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading favorites...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-16 text-center text-red-500">Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground">Please log in to view your favorite stylists.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">My Favourites</h1>
            <p className="text-lg text-muted-foreground mt-4">Your favorite stylists for quick re-booking.</p>
        </div>
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Favourite Stylists</CardTitle>
                <CardDescription>A list of stylists you have marked as your favourites.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteStylists.length === 0 ? (
                    <p className="text-center col-span-full text-muted-foreground py-8">You have no favorite stylists yet.</p>
                ) : (
                    favoriteStylists.map((stylist: Stylist) => (
                        <StylistCard 
                            key={stylist.id} 
                            stylist={stylist}
                            isFavorited={true}
                            onToggleFavorite={() => handleRemoveFavorite(String(stylist.id))}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    </div>
  );
}
