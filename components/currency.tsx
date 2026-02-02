"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CurrencyContextValue = {
  currency: string;
  locale: string;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "NGN",
  locale: "en-NG",
});

export const useCurrency = () => useContext(CurrencyContext);

const formatterCache = new Map<string, Intl.NumberFormat>();

function formatCurrency(
  value: number,
  currency: string,
  locale: string,
) {
  const key = `${locale}-${currency}`;

  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  }

  return formatterCache.get(key)!.format(value);
}

interface CurrencyProps {
  children: ReactNode;
  currency?: string;
  locale?: string;
  className?: string;
}

const Currency = ({
  children,
  currency = "NGN",
  locale = "en-NG",
  className,
}: CurrencyProps) => {
  return (
    <CurrencyContext.Provider value={{ currency, locale }}>
      <span className={cn("inline-flex items-center gap-1", className)}>
        {children}
      </span>
    </CurrencyContext.Provider>
  );
};

interface CurrencyValueProps {
  value?: number | null;
  className?: string;
}

const CurrencyValue = ({ value, className }: CurrencyValueProps) => {
  const { currency, locale } = useCurrency();

  if (value == null) return null;

  return (
    <span className={cn("leading-tight", className)}>
      {formatCurrency(value, currency, locale)}
    </span>
  );
};

export { Currency, CurrencyValue };
