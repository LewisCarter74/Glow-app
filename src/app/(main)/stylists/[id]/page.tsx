'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ReviewCard from "@/components/ReviewCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStylist, getReviews, addFavorite, removeFavorite } from '@/lib/api';
import { Stylist, Review } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface StylistDetailPageProps {
  params: {
    id: string;
  };
}

export default function StylistDetailPage({ params }: StylistDetailPageProps) {
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStylistAndReviews = async () => {
      try {
        setLoading(true);
        const stylistData = await getStylist(Number(params.id));
        setStylist(stylistData);
        setIsFavorited(stylistData.is_favorited);

        const reviewsData = await getReviews(Number(params.id));
        setReviews(reviewsData);
      } catch (error) {
        console.error("Failed to fetch stylist or reviews", error);
        setStylist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStylistAndReviews();
  }, [params.id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add a stylist to your favorites.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite(stylist!.id);
        toast({
          title: "Removed from Favorites",
          description: `${stylist!.user.name} has been removed from your favorites.`,
        });
      } else {
        await addFavorite(stylist!.id);
        toast({
          title: "Added to Favorites",
          description: `${stylist!.user.name} has been added to your favorites.`,
        });
      }
      setIsFavorited(!isFavorited);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isFavorited ? 'remove' : 'add'} favorite.`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading stylist details...</div>;
  }

  if (!stylist) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="items-center text-center">
              <Image
                src={stylist.imageUrl || '/default-avatar.png'}
                alt={`Portrait of ${stylist.user.name}`}
                width={120}
                height={120}
                className="rounded-full border-4 border-primary mb-4 object-cover"
              />
              <CardTitle className="text-3xl font-headline">{stylist.user.name}</CardTitle>
              <div className="flex items-center justify-center space-x-2">
                <p className="text-accent font-semibold text-lg">{stylist.specialties.join(', ')}</p>
                {isAuthenticated && (
                  <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                    <Heart className={`w-6 h-6 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{stylist.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({stylist.reviewCount} reviews)</span>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">{stylist.bio}</p>
              <Button size="lg" className="w-full" asChild>
                <Link href={`/booking?stylist=${stylist.id}`}>Book with {stylist.user.name}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <section>
            <h2 className="text-3xl font-bold font-headline mb-6">Portfolio</h2>
            {stylist.portfolio && stylist.portfolio.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {stylist.portfolio.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card className="overflow-hidden">
                          <CardContent className="flex aspect-[4/3] items-center justify-center p-0">
                            <Image
                              src={img}
                              alt={`${stylist.user.name}'s work ${index + 1}`}
                              width={800}
                              height={600}
                              className="object-cover w-full h-full"
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="ml-16" />
                <CarouselNext className="mr-16" />
              </Carousel>
            ) : (
                <p className="text-muted-foreground">No portfolio images to display.</p>
            )}
          </section>

          <section className="mt-16">
            <h2 className="text-3xl font-bold font-headline mb-6">What Clients Are Saying</h2>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
                <p className="text-muted-foreground">This stylist has not received any reviews yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
