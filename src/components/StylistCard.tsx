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
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Stylist {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
  location: string; // This field is not in the API, so we'll use a placeholder
}

interface StylistCardProps {
  stylist: Stylist;
  showRemoveButton?: boolean;
}

export default function StylistCard({
  stylist,
  showRemoveButton = false,
}: StylistCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRemove = async () => {
    // This function will be implemented later
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="relative w-full h-48 mb-4">
          <Image
            src={stylist.imageUrl}
            alt={`Photo of ${stylist.user.first_name}`}
            fill 
            style={{ objectFit: 'cover' }} 
            className="rounded-t-lg"
            data-ai-hint="professional stylist portrait"
          />
        </div>
        <CardTitle>
          {stylist.user.first_name} {stylist.user.last_name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />{' '}
          {stylist.location || 'Location not available'}
        </CardDescription>
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
          {(stylist.specialties || []).map((specialty) => (
            <Badge key={specialty} variant="secondary">
              {specialty}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/stylists/${stylist.id}`}>View Profile</Link>
        </Button>
        {showRemoveButton && (
          <Button
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            aria-label="Remove from favourites"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
