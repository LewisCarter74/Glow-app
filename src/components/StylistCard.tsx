import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import type { Stylist } from "@/lib/placeholder-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StylistCardProps {
  stylist: Stylist;
}

export default function StylistCard({ stylist }: StylistCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center gap-4">
        <Image
          src={stylist.avatarUrl}
          data-ai-hint="professional headshot"
          alt={`Portrait of ${stylist.name}`}
          width={80}
          height={80}
          className="rounded-full border-2 border-primary"
        />
        <div>
          <CardTitle>{stylist.name}</CardTitle>
          <CardDescription className="text-accent font-medium">
            {stylist.specialty}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {stylist.bio}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="font-bold">{stylist.rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({stylist.reviewCount} reviews)</span>
        </div>
        <Button asChild size="sm">
          <Link href={`/stylists/${stylist.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
