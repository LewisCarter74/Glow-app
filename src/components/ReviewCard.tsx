'use client';

import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Review } from '@/lib/types';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={'/placeholder.svg'} alt={review.customer_name} />
            <AvatarFallback>{getInitials(review.customer_name)}</AvatarFallback>
          </Avatar>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{review.customer_name}</h3>
              <div className="flex items-center gap-0.5 ml-auto">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'fill-primary' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm/relaxed">
          {review.comment}
        </p>
      </CardContent>
    </Card>
  );
}
