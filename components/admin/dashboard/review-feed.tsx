import { Star, MessageSquareOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getUrgentReviews } from "@/actions/dashboard";
import Link from "next/link";

export async function ReviewFeed() {
  const reviews = await getUrgentReviews();

  return (
    <Card className="h-full flex flex-col border-none shadow-sm ring-1 ring-slate-200 border-l-4 border-l-yellow-400 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-white px-6">
        <div className="">
          <CardTitle className="text-base font-semibold">
            Needs Attention
          </CardTitle>
          <CardDescription>Recent low-rating reviews</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href="/admin/reviews">View All</Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-60">
          <div className="p-4 space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate max-w-[150px]">
                    {review.product}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-200 fill-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic mb-3">
                  "{review.comment}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-medium text-slate-500">
                    — {review.user}
                  </span>
                  <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tight">
                    Reply to User
                  </button>
                </div>
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <Star className="h-5 w-5 text-emerald-500 fill-emerald-500" />
                </div>
                <p className="text-sm font-medium">
                  Customer satisfaction is high!
                </p>
                <p className="text-xs">No low-rated reviews to display.</p>
              </div>
            )}
          </div>
          <ScrollBar />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
