import Image from "next/image";
import { Star } from "lucide-react";
import type { Review } from "@/lib/placeholder-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="bg-secondary/50">
      <CardHeader className="flex flex-row justify-between items-start">
        <div className="flex items-center gap-4">
          <Image
            src={review.avatarUrl}
            alt={`Avatar of ${review.author}`}
            data-ai-hint="user avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="font-semibold">{review.author}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80">{review.comment}</p>
      </CardContent>
    </Card>
  );
}
