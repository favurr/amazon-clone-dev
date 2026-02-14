"use client";

import { Star, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    image: string | null;
    initials: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
}

export function ReviewList({ reviews, currentUserId }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <p className="text-slate-600 text-sm">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className={`bg-white border rounded-lg p-6 ${
            review.user.id === currentUserId
              ? "border-blue-200 bg-blue-50/30"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={review.user.image || undefined} alt={review.user.name} />
              <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">
                {review.user.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {review.user.name}
                    {review.user.id === currentUserId && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-slate-300 fill-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {review.comment && (
                <p className="text-slate-700 text-sm leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
