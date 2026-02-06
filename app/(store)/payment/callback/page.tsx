'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Only use dynamic for client component pages
export const dynamic = 'force-dynamic';

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Loading callback...</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please wait...</p>
          </div>
        </div>
      }
    >
      <CallbackBody />
    </Suspense>
  );
}

function CallbackBody() {
  const searchParams = useSearchParams();

  // Prefer URL params; fall back to sessionStorage for 3DS returns
  let reference = searchParams.get('reference');
  let orderId = searchParams.get('orderId');

  if (typeof window !== 'undefined') {
    if (!reference) {
      reference = sessionStorage.getItem('pending_reference') || reference;
      orderId = sessionStorage.getItem('pending_order_id') || orderId;

      sessionStorage.removeItem('pending_reference');
      sessionStorage.removeItem('pending_order_id');
    }
  }

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        window.location.href = '/checkout';
        return;
      }

      try {
        const res = await fetch(`/api/payments/check-status?reference=${reference}`);
        const data = await res.json();

        if (data?.data?.status === 'success') {
          if (orderId) {
            await fetch(`/api/orders/${orderId}/complete`, {
              method: 'POST',
            });
          }
          window.location.href = '/orders';
        } else if (data?.data?.status === 'pending') {
          setTimeout(() => {
            window.location.href = '/orders';
          }, 1500);
        } else {
          window.location.href = '/checkout';
        }
      } catch {
        window.location.href = '/checkout';
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Verifying payment...</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}