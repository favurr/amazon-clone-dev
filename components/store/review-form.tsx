"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitReview, updateReview } from "@/actions/reviews";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
  userId: string;
  eligibilityStatus: "can_review" | "already_reviewed" | "not_purchased" | "error";
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

export function ReviewForm({
  productId,
  userId,
  eligibilityStatus,
  existingReview,
}: ReviewFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (existingReview && isEditing) {
        result = await updateReview(existingReview.id, userId, rating, comment);
      } else {
        result = await submitReview(userId, productId, rating, comment);
      }

      if (result.success) {
        toast.success(
          existingReview ? "Review updated successfully!" : "Review submitted successfully!"
        );
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || "");
  };

  // If user already reviewed and not editing, show their review with edit button
  if (eligibilityStatus === "already_reviewed" && !isEditing && existingReview) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Your Review</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit Review
          </Button>
        </div>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= existingReview.rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-slate-300 fill-slate-300"
              }`}
            />
          ))}
        </div>
        {existingReview.comment && (
          <p className="text-slate-700 text-sm italic">&quot;{existingReview.comment}&quot;</p>
        )}
      </div>
    );
  }

  // If user can't review, show appropriate message
  if (eligibilityStatus === "not_purchased") {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
        <p className="text-slate-600 text-sm">
          Purchase this product to leave a review
        </p>
      </div>
    );
  }

  // Show the review form
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        {isEditing ? "Edit Your Review" : "Write a Review"}
      </h3>
      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 cursor-pointer ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-300 fill-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Comment (Optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || rating === 0}>
            {isSubmitting
              ? "Submitting..."
              : isEditing
              ? "Update Review"
              : "Submit Review"}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
