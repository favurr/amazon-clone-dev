import React from "react";
import { cn } from "@/lib/utils";

interface PriceProps {
  className?: string;
  children: React.ReactNode;
}

export const Price = ({ className, children }: PriceProps) => {
  return <div className={cn("font-semibold", className)}>{children}</div>;
};

interface PriceValueProps {
  price: number;
  currency: string;
  variant?: "regular" | "sale";
  className?: string;
}

export const PriceValue = ({ price, currency, variant = "regular", className }: PriceValueProps) => {
  const formatPrice = (amount: number, curr: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
    }).format(amount);
  };

  return (
    <span className={cn(variant === "sale" && "text-red-600", className)}>
      {formatPrice(price, currency)}
    </span>
  );
};
