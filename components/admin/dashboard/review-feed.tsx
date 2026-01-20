import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reviews = [
  { user: "John D.", rating: 1, comment: "Item never arrived!", product: "Gaming Mouse" },
  { user: "Sarah M.", rating: 3, comment: "Good but color is off.", product: "Yoga Mat" },
];

export function ReviewFeed() {
  return (
    <Card className="h-full border-l-4 border-l-yellow-400">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Needs Attention (Reviews)</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review, i) => (
            <div key={i} className="bg-slate-50 p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">{review.product}</span>
                    <div className="flex">
                        {[...Array(5)].map((_, starIndex) => (
                            <Star 
                                key={starIndex} 
                                className={`w-3 h-3 ${starIndex < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} 
                            />
                        ))}
                    </div>
                </div>
                <p className="text-sm text-slate-600 mb-2">"{review.comment}"</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">- {review.user}</span>
                    <button className="text-xs text-blue-600 font-medium hover:underline">Reply</button>
                </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}