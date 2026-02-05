"use client";

import { useState, useCallback } from "react";
import type {
  ChargeResponse,
  ModalState,
  CardDetails,
  CustomerDetails,
  PaymentMetadata,
} from "@/lib/paystack-types";

interface UsePaymentProps {
  amount: number;
  metadata?: PaymentMetadata;
  onSuccess: (reference: string, authorizationCode?: string) => void;
  onError: (error: string) => void;
}

export function usePayment({
  amount,
  metadata,
  onSuccess,
  onError,
}: UsePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    isOpen: false,
  });

  // Store current transaction state
  const [currentTransaction, setCurrentTransaction] = useState<{
    reference: string;
    email: string;
    address: string;
    card: CardDetails;
  } | null>(null);

  /**
   * Handle the response from any charge endpoint
   * This determines which modal to show or if payment is complete
   */
  const handleChargeResponse = useCallback(
    (response: ChargeResponse) => {
      const { status, reference, display_text, url } = response.data;

      switch (status) {
        case "success":
          // Payment successful!
          setModalState({ type: null, isOpen: false });
          setLoading(false);
          onSuccess(
            reference,
            response.data.authorization?.authorization_code
          );
          break;

        case "send_pin":
          // Show PIN modal
          setModalState({
            type: "pin",
            isOpen: true,
            reference,
            displayText: display_text || "Please enter your card PIN",
          });
          setLoading(false);
          break;

        case "send_otp":
          // Show OTP modal
          setModalState({
            type: "otp",
            isOpen: true,
            reference,
            displayText: display_text || "Please enter the OTP sent to you",
          });
          setLoading(false);
          break;

        case "send_birthday":
          // Show birthday modal
          setModalState({
            type: "birthday",
            isOpen: true,
            reference,
            displayText:
              display_text ||
              "Please enter your date of birth (YYYY-MM-DD)",
          });
          setLoading(false);
          break;

        case "open_url":
          // Redirect to 3D Secure URL
          if (url) {
            setModalState({ type: null, isOpen: false });
            window.location.href = url;
          } else {
            setLoading(false);
            onError("3D Secure URL not provided");
          }
          break;

        case "pending":
          // Still processing, might need to check status again
          setLoading(false);
          onError("Transaction is pending. Please try again.");
          break;

        case "failed":
          // Transaction failed
          setModalState({ type: null, isOpen: false });
          setLoading(false);
          onError(response.message || "Transaction failed");
          break;

        default:
          setLoading(false);
          onError("Unknown transaction status");
      }
    },
    [onSuccess, onError]
  );

  /**
   * Initialize payment - First API call
   */
  const initializePayment = useCallback(
    async (customerDetails: CustomerDetails, cardDetails: CardDetails) => {
      setLoading(true);

      try {
        const response = await fetch("/api/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: customerDetails.email,
            address: customerDetails.address,
            amount,
            card: cardDetails,
            metadata: metadata || {},
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to initialize payment");
        }

        const data: ChargeResponse = await response.json();

        // Store transaction details for later use (PIN/OTP submission)
        setCurrentTransaction({
          reference: data.data.reference,
          email: customerDetails.email,
          address: customerDetails.address,
          card: cardDetails,
        });

        handleChargeResponse(data);
      } catch (error: any) {
        setLoading(false);
        onError(error.message);
      }
    },
    [amount, metadata, handleChargeResponse, onError]
  );

  /**
   * Submit PIN when modal is filled
   */
  const submitPin = useCallback(
    async (pin: string) => {
      if (!currentTransaction) {
        onError("No active transaction");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/payments/submit-pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentTransaction.email,
            address: currentTransaction.address,
            amount,
            card: currentTransaction.card,
            pin,
            reference: currentTransaction.reference,
            metadata: metadata || {},
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to submit PIN");
        }

        const data: ChargeResponse = await response.json();
        handleChargeResponse(data);
      } catch (error: any) {
        setLoading(false);
        onError(error.message);
      }
    },
    [currentTransaction, amount, metadata, handleChargeResponse, onError]
  );

  /**
   * Submit OTP when modal is filled
   */
  const submitOtp = useCallback(
    async (otp: string) => {
      if (!modalState.reference) {
        onError("No reference available");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/payments/submit-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            otp,
            reference: modalState.reference,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to submit OTP");
        }

        const data: ChargeResponse = await response.json();
        handleChargeResponse(data);
      } catch (error: any) {
        setLoading(false);
        onError(error.message);
      }
    },
    [modalState.reference, handleChargeResponse, onError]
  );

  /**
   * Submit birthday when modal is filled
   */
  const submitBirthday = useCallback(
    async (birthday: string) => {
      if (!modalState.reference) {
        onError("No reference available");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("/api/payments/submit-birthday", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birthday,
            reference: modalState.reference,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to submit birthday");
        }

        const data: ChargeResponse = await response.json();
        handleChargeResponse(data);
      } catch (error: any) {
        setLoading(false);
        onError(error.message);
      }
    },
    [modalState.reference, handleChargeResponse, onError]
  );

  /**
   * Check transaction status (useful after 3D Secure redirect)
   */
  const checkStatus = useCallback(
    async (reference: string) => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/payments/check-status?reference=${reference}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to check status");
        }

        const data: ChargeResponse = await response.json();
        handleChargeResponse(data);
      } catch (error: any) {
        setLoading(false);
        onError(error.message);
      }
    },
    [handleChargeResponse, onError]
  );

  /**
   * Close modal
   */
  const closeModal = useCallback(() => {
    setModalState({ type: null, isOpen: false });
  }, []);

  return {
    loading,
    modalState,
    initializePayment,
    submitPin,
    submitOtp,
    submitBirthday,
    checkStatus,
    closeModal,
  };
}
