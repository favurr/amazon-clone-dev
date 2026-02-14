"use client";

import { useState } from "react";
import { Star, Trash2, ExternalLink, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteReview } from "@/actions/reviews";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  product: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ReviewsPageClientProps {
  reviews: Review[];
}

export function ReviewsPageClient({ reviews }: ReviewsPageClientProps) {
  const router = useRouter();
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter === "all") return true;
    if (ratingFilter === "low") return review.rating <= 3;
    if (ratingFilter === "high") return review.rating >= 4;
    return review.rating === parseInt(ratingFilter);
  });

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteReview(reviewToDelete, "", true); // isAdmin = true
      if (result.success) {
        toast.success("Review deleted successfully");
        router.refresh();
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
      } else {
        toast.error(result.error || "Failed to delete review");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4) {
      return <Badge className="bg-green-500">Positive</Badge>;
    } else if (rating === 3) {
      return <Badge className="bg-yellow-500">Neutral</Badge>;
    } else {
      return <Badge className="bg-red-500">Negative</Badge>;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reviews Management</h1>
        <p className="text-slate-500 mt-2">
          Moderate and manage customer reviews
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Reviews</CardDescription>
            <CardTitle className="text-3xl">{reviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Rating</CardDescription>
            <CardTitle className="text-3xl">
              {reviews.length > 0
                ? (
                    reviews.reduce((acc, r) => acc + r.rating, 0) /
                    reviews.length
                  ).toFixed(1)
                : "0.0"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Positive (4-5★)</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {reviews.filter((r) => r.rating >= 4).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Needs Attention (1-3★)</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {reviews.filter((r) => r.rating <= 3).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Reviews</CardTitle>
              <CardDescription>
                {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="high">High (4-5★)</SelectItem>
                  <SelectItem value="low">Low (1-3★)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No reviews found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/products/${review.product.slug}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {review.product.title}
                        </Link>
                        {getRatingBadge(review.rating)}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
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
                        <span className="text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                          &quot;{review.comment}&quot;
                        </p>
                      )}
                      <div className="text-xs text-slate-500">
                        By: <span className="font-medium">{review.user.name}</span> (
                        {review.user.email})
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/products/${review.product.slug}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the review
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
