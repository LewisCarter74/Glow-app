"use client";

import { useEffect, useState } from "react";
import StylistCard from "@/components/StylistCard";
import { getStylists, getFavorites, addFavorite, removeFavorite } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Stylist } from "@/lib/types";

export default function StylistsPage() {
  const { user, isAuthenticated } = useAuth();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [favoriteStylistIds, setFavoriteStylistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [stylistsData, favoritesData] = await Promise.all([
          getStylists(),
          isAuthenticated ? getFavorites() : Promise.resolve([]),
        ]);

        setStylists(stylistsData);

        if (isAuthenticated && favoritesData) {
          const favoriteIds = new Set(favoritesData.map((fav: any) => String(fav.stylist_id)));
          setFavoriteStylistIds(favoriteIds);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, [isAuthenticated, user]);

  const handleToggleFavorite = async (stylistId: string, isCurrentlyFavorited: boolean) => {
    try {
      if (isCurrentlyFavorited) {
        await removeFavorite(Number(stylistId));
        setFavoriteStylistIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(stylistId);
          return newSet;
        });
      } else {
        await addFavorite(Number(stylistId));
        setFavoriteStylistIds((prev) => new Set(prev).add(stylistId));
      }
    } catch (error: any) {
      console.error("Failed to toggle favorite:", error);
      throw error; // Re-throw to be caught by StylistCard's toast
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading stylists...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-16 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">Our Talented Team</h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Meet the artists who will bring your vision to life. Each of our stylists is a master of their craft, dedicated to creating a look you'll love.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stylists.map((stylist: any) => (
          <StylistCard
            key={stylist.id}
            stylist={stylist}
            isFavorited={favoriteStylistIds.has(String(stylist.id))}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
