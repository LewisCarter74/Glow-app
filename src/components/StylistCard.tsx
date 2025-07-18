'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Trash2 } from "lucide-react";
import type { Stylist } from "@/lib/placeholder-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth"; // Add this import

interface StylistCardProps {
  stylist: Stylist;
  showRemoveButton?: boolean;
}

export default function StylistCard({ stylist, showRemoveButton = false }: StylistCardProps) {
  const { toast } = useToast();
  const { user } = useAuth(); // Get user to access the token

  const handleRemove = async () => { // Make it async
    if (!user || !user.jwt) {
      toast({
        title: "Error",
        description: "You must be logged in to remove favourites.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Replace 'YOUR_SUPABASE_GRAPHQL_ENDPOINT' with your actual Supabase GraphQL API endpoint
      // This is typically found in your Supabase project settings -> API -> GraphQL
      const SUPABASE_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_SUPABASE_GRAPHQL_URL || 'YOUR_SUPABASE_GRAPHQL_ENDPOINT';

      const response = await fetch(SUPABASE_GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.jwt}`, // Assuming user.jwt holds the JWT token
        },
        body: JSON.stringify({
          query: `
            mutation DeleteFavoritedStylist($stylistId: UUID!) {
              favorite_stylist_delete(key: { userId: "${user.id}", stylistId: $stylistId }) // Assuming userId is user.id from useAuth()
            }
          `,
          variables: {
            stylistId: stylist.id, // Pass the stylist ID to the mutation
          },
        }),
      });

      const data = await response.json();

      if (response.ok && !data.errors) {
        toast({
          title: "Stylist Removed",
          description: `${stylist.name} has been removed from your favourites.`,
        });
        // You might want to refresh the list of stylists on the Favourites page
        // or update the state in a parent component after successful removal.
        // For now, this just shows the toast.
      } else {
        throw new Error(data.errors?.[0]?.message || "Failed to remove stylist.");
      }
    } catch (error: any) {
      console.error("Error removing stylist:", error);
      toast({
        title: "Error",
        description: `Failed to remove stylist: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="relative w-full h-48 mb-4">
            <Image
                src={stylist.imageUrl}
                alt={`Photo of ${stylist.name}`}
                layout="fill"
                objectFit="cover"
                className="rounded-t-lg"
                data-ai-hint="professional stylist portrait"
            />
        </div>
        <CardTitle>{stylist.name}</CardTitle>
        <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" /> {stylist.location}
        </CardDescription>
        <div className="flex items-center gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < stylist.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({stylist.reviewCount} reviews)</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {(stylist.specialties || []).map((specialty) => (
            <Badge key={specialty} variant="secondary">{specialty}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/stylists/${stylist.id}`}>View Profile</Link>
        </Button>
        {showRemoveButton && (
           <Button variant="destructive" size="icon" onClick={handleRemove} aria-label="Remove from favourites">
             <Trash2 className="h-4 w-4" />
           </Button>
        )}
      </CardFooter>
    </Card>
  );
}
