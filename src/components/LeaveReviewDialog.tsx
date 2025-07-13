
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface LeaveReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: { rating: number; comment: string }) => void;
  appointment: {
    service: string;
    stylist: string;
  };
}

export default function LeaveReviewDialog({ isOpen, onClose, onSubmit, appointment }: LeaveReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit({ rating, comment });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Share your experience about your {appointment.service} with {appointment.stylist}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className='space-y-2'>
                <Label>Your Rating</Label>
                <div 
                    className="flex items-center gap-1"
                    onMouseLeave={() => setHoverRating(0)}
                >
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                        <Star
                            key={starValue}
                            className={cn(
                                "h-8 w-8 cursor-pointer transition-colors",
                                starValue <= (hoverRating || rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-muted-foreground/50"
                            )}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                        />
                        );
                    })}
                </div>
            </div>
            <div className='space-y-2'>
                <Label htmlFor="comment">Your Comments (optional)</Label>
                <Textarea
                    id="comment"
                    placeholder="Tell us more about your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0}>
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
