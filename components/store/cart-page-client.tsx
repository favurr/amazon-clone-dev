"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { updateCartItem, removeCartItem } from "@/actions/store";
import { useAlert } from "@/store/use-alert-store";

interface CartPageClientProps {
  cartData: {
    items: any[];
    total: number;
  };
  userId: string;
}

export function CartPageClient({ cartData, userId }: CartPageClientProps) {
  const [updating, setUpdating] = useState<string | null>(null);
  const alert = useAlert();

  const { items, total } = cartData;

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdating(itemId);
    const result = await updateCartItem(itemId, newQuantity);
    if (!result.success) {
      alert.error(result.error || "Failed to update cart", "floating");
    }
    setUpdating(null);
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    const result = await removeCartItem(itemId);
    if (result.success) {
      alert.success("Item removed", "floating");
    } else {
      alert.error(result.error || "Failed to remove item", "floating");
    }
    setUpdating(null);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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
        <div
          key={item.id}
          className="bg-white rounded-lg border border-slate-200 p-6"
        >
          <div className="flex gap-6">
            {/* Image */}
            <Link
              href={`/product/${item.slug}`}
              className="relative h-32 w-32 rounded-lg bg-slate-100 overflow-hidden shrink-0"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </Link>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-semibold text-lg text-slate-900 hover:text-orange-600 line-clamp-2"
                >
                  {item.title}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={updating === item.id}
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {item.variant && (
                <p className="text-sm text-slate-600 mb-3">
                  {item.variant.type}: {item.variant.value}
                </p>
              )}

              {/* Quantity Input */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">Quantity:</span>
                  <div className="flex items-center gap-2 border border-slate-300 rounded-lg">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0"
                      disabled={updating === item.id || item.quantity <= 1}
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0"
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
                  <p className="text-2xl font-bold text-slate-900">
                    ${item.subtotal.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-500">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CartPageWrapper({ cartData }: CartPageClientProps) {
  const { items, total } = cartData;

  const TAX_RATE = 0.00312;
  const roundTo2 = (value: number) => Math.round(value * 100) / 100;

  const taxAmount = roundTo2(total * TAX_RATE);
  const grandTotal = roundTo2(total + taxAmount);
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-slate-600">{items.length} items</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <CartPageClient cartData={cartData} userId="" />

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 top-20">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Estimated Tax</span>
                  <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between text-xl font-bold text-slate-900 mb-6">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>

              <Button
                asChild
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg mb-3"
              >
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 text-center">
                  Secure checkout powered by Flutterwave. Your payment
                  information is protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
