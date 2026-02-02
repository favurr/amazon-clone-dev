"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { updateCartItem, removeCartItem } from "@/actions/store";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Currency, CurrencyValue } from "@/components/currency";

interface CartPageClientProps {
  cartData: {
    items: any[];
    total: number;
  };
  userId: string;
}

export function CheckoutCartPageClient({
  cartData,
  userId,
}: CartPageClientProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const { items } = cartData;

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdating(itemId);
    const result = await updateCartItem(itemId, newQuantity);
    if (!result.success) {
      toast.error(result.error || "Failed to update cart");
    }
    setUpdating(null);
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    const result = await removeCartItem(itemId);
    if (result.success) {
      toast.success("Item removed");
    } else {
      toast.error(result.error || "Failed to remove item");
    }
    setUpdating(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-slate-100 p-8 rounded-full inline-block mb-6">
            <ShoppingBag className="h-16 w-16 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Your cart is empty
          </h1>
          <p className="text-slate-600 mb-6">
            Looks like you haven't added anything to your cart yet
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 space-y-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="bg-white rounded-lg border border-slate-200"
        >
          <CardHeader className="flex w-full items-center justify-between">
            <div className="gap-4 flex items-center">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-12 w-12 rounded-lg bg-slate-100 overflow-hidden shrink-0"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </Link>
              <div className="ml-4">
                <CardTitle className="font-semibold text-lg text-slate-900">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-semibold text-lg text-slate-900 hover:text-orange-600 line-clamp-2"
                  >
                    {item.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  {item.variant?.type}: {item.variant?.value}
                </CardDescription>
              </div>
            </div>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={updating === item.id}
                onClick={() => handleRemove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Quantity:</span>
              <div className="flex items-center gap-2 border border-slate-300 rounded-lg">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  disabled={updating === item.id || item.quantity <= 1}
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity - 1)
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-7 text-center font-medium">
                  {item.quantity}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  disabled={
                    updating === item.id ||
                    (item.variant && item.quantity >= item.variant.stock)
                  }
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity + 1)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xl font-normal text-slate-900">
                <Currency>
                  <CurrencyValue value={item.subtotal} />
                </Currency>
              </p>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
