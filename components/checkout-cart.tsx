import { CheckoutCartPageClient } from "@/components/store/checkout-cart-page-client";
import { Currency, CurrencyValue } from "@/components/currency";

interface CartPageClientProps {
  cartData: {
    items: any[];
    total: number;
  };
}

export default function CheckOutCart({ cartData }: CartPageClientProps) {
  if (!cartData) {
    return <div>Loading...</div>;
  }

  const { total } = cartData;

  const TAX_RATE = 0.00312;

  const roundTo2 = (value: number) => Math.round(value * 100) / 100;

  const taxAmount = roundTo2(total * TAX_RATE);
  const grandTotal = roundTo2(total + taxAmount);

  return (
    <div>
      <div className="border-b py-7">
        <h2 className="text-lg leading-relaxed font-semibold">Your Cart</h2>
      </div>
      <CheckoutCartPageClient cartData={cartData} userId="" />
      <div>
        <div className="space-y-3.5 border-y py-7">
          <div className="flex justify-between gap-3">
            <p className="text-sm">Subtotal</p>
            <Currency className="text-sm font-normal">
              <CurrencyValue value={total} />
            </Currency>
          </div>
          <div className="flex justify-between gap-3">
            <p className="text-sm">Shipping</p>
            <p className="text-sm">Free</p>
          </div>
          <div className="flex justify-between gap-3">
            <p className="text-sm">Estimated Tax</p>
            <Currency className="text-sm font-normal">
              <CurrencyValue value={taxAmount} />
            </Currency>
          </div>
        </div>
        <div className="py-7">
          <div className="flex justify-between gap-3">
            <p className="text-lg leading-tight font-medium">Total</p>
            <Currency className="text-xl font-medium">
              <CurrencyValue value={grandTotal} />
            </Currency>
          </div>
        </div>
      </div>
    </div>
  );
}
