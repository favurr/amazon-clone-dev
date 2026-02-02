"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { updateCartItem, removeCartItem } from "@/actions/store";
import { useState } from "react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: any[];
  total: number;
}

export function CartDrawer({ open, onClose, items, total }: CartDrawerProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdating(itemId);
    await updateCartItem(itemId, newQuantity);
    setUpdating(null);
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    await removeCartItem(itemId);
    setUpdating(null);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <ShoppingBag className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="font-semibold text-lg text-slate-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Start adding products to see them here!
            </p>
            <Button
              onClick={onClose}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-slate-200 last:border-0"
                  >
                    {/* Image */}
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={onClose}
                      className="relative h-20 w-20 rounded-lg bg-slate-100 overflow-hidden shrink-0"
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
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={onClose}
                        className="font-medium text-sm text-slate-900 hover:text-orange-600 line-clamp-2 mb-1"
                      >
                        {item.title}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-slate-500 mb-2">
                          {item.variant.type}: {item.variant.value}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">
                          ${item.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            disabled={updating === item.id}
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            disabled={updating === item.id}
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={updating === item.id}
                      onClick={() => handleRemove(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-slate-700">Subtotal:</span>
                <span className="font-bold text-slate-900">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="space-y-2">
                <Button
                  asChild
                  className="w-full bg-orange-500 hover:bg-orange-600 h-11 font-semibold"
                >
                  <Link href="/cart" onClick={onClose}>
                    View Cart
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 font-semibold"
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
