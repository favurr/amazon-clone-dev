"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    let reference = searchParams.get("reference");
    let orderId = searchParams.get("orderId");

    // If not in URL params, try sessionStorage (for 3DS returns)
    if (!reference) {
      reference = sessionStorage.getItem("pending_reference");
      orderId = sessionStorage.getItem("pending_order_id");
      
      // Clear from storage
      sessionStorage.removeItem("pending_reference");
      sessionStorage.removeItem("pending_order_id");
    }

    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found");
      return;
    }

    verifyPayment(reference, orderId);
  }, [searchParams]);

  const verifyPayment = async (reference: string, orderId: string | null) => {
    try {
      // Check payment status
      const response = await fetch(
        `/api/payments/check-status?reference=${reference}`
      );
      const data = await response.json();

      console.log("[Callback] Payment status:", data);

      if (data.data?.status === "success") {
        // Complete the order
        if (orderId) {
          await fetch(`/api/orders/${orderId}/complete`, {
            method: "POST",
          });
        }

        setStatus("success");
        setMessage("Payment successful! Redirecting...");

        setTimeout(() => {
          router.push("/orders");
        }, 2000);
      } else {
        setStatus("failed");
        setMessage(data.message || "Payment verification failed");

        setTimeout(() => {
          router.push("/checkout");
        }, 3000);
      }
    } catch (error: any) {
      console.error("[Callback] Verification error:", error);
      setStatus("failed");
      setMessage("Failed to verify payment");

      setTimeout(() => {
        router.push("/checkout");
      }, 3000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-4 text-xl font-semibold">{message}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-green-600">
              {message}
            </h2>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-red-600">
              {message}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Redirecting back to checkout...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
