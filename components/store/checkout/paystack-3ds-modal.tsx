"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface Paystack3DSModalProps {
  isOpen: boolean;
  url: string;
  reference: string;
  orderId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function Paystack3DSModal({
  isOpen,
  url,
  reference,
  orderId,
  onSuccess,
  onClose,
}: Paystack3DSModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      return;
    }

    // Wait 10 seconds before starting to poll (give Paystack time to create transaction)
    const startDelay = setTimeout(() => {
      // Start polling for payment status
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/payments/check-status?reference=${reference}`
          );
          const data = await response.json();

          console.log("[3DS Modal] Payment status:", data.data?.status);

          if (data.data?.status === "success") {
            clearInterval(pollingIntervalRef.current!);
            setIsVerifying(true);

            // Complete order with card details
            await fetch(`/api/orders/${orderId}/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paystackId: reference,
                cardNetwork: data.data?.authorization?.brand || data.data?.authorization?.card_type?.split(' ')[0],
                cardLast4: data.data?.authorization?.last4,
              }),
            });

            onSuccess();
          } else if (
            data.data?.status === "failed" &&
            data.data?.message !== "No transaction found"
          ) {
            // Only fail if it's a real failure, not "No transaction found"
            clearInterval(pollingIntervalRef.current!);
            onClose();
          }
        } catch (error) {
          console.error("[3DS Modal] Polling error:", error);
        }
      }, 5000); // Poll every 5 seconds (better for slow connections)
    }, 10000); // Start after 10 seconds

    return () => {
      clearTimeout(startDelay);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isOpen, reference, orderId, onSuccess, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Complete Payment Authentication</DialogTitle>
        </DialogHeader>

        {isVerifying ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Verifying payment...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              title="3D Secure Authentication"
            />
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">
          Please complete the authentication to continue
        </div>
      </DialogContent>
    </Dialog>
  );
}
