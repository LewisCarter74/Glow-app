'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import { Stylist } from '@/lib/types'; // Using the centralized type

interface StylistCardProps {
  stylist: Stylist;
  isFavorited?: boolean;
  onToggleFavorite?: (stylistId: string, isFavorited: boolean) => void;
}

export default function StylistCard({
  stylist,
  isFavorited: initialIsFavorited = false,
  onToggleFavorite,
}: StylistCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add stylists to your favorites.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (onToggleFavorite) {
        await onToggleFavorite(String(stylist.id), isFavorited);
        // The parent component will manage the state, but we can reflect the change immediately
        setIsFavorited(!isFavorited);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update favorites.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="relative w-full h-48 mb-4">
          <Image
            src={stylist.imageUrl || '/default-stylist.png'}
            alt={`Photo of ${stylist.user.name}`}
            fill 
            style={{ objectFit: 'cover' }} 
            className="rounded-t-lg"
          />
        </div>
        <CardTitle>
          {stylist.user.name}
        </CardTitle>
        <div className="flex items-center gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < stylist.rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-muted-foreground/50'
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({stylist.reviewCount} reviews)
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
            {stylist.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary">
                {specialty}
              </Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/stylists/${stylist.id}`}>View Profile</Link>
        </Button>
        <Button
            variant="outline"
            size="icon"
            onClick={handleToggleFavorite}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart className={isFavorited ? "h-4 w-4 text-red-500 fill-red-500" : "h-4 w-4"} />
        </Button>
      </CardFooter>
    </Card>
  );
}
