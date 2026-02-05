"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  type: "pin" | "otp" | "birthday";
  displayText?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export function PaymentModal({
  isOpen,
  type,
  displayText,
  onSubmit,
  onClose,
  loading = false,
}: PaymentModalProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value);
      setValue("");
    }
  };

  const getTitle = () => {
    switch (type) {
      case "pin":
        return "Enter Card PIN";
      case "otp":
        return "Enter OTP";
      case "birthday":
        return "Enter Date of Birth";
      default:
        return "Additional Information Required";
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case "pin":
        return "Enter your 4-digit PIN";
      case "otp":
        return "Enter OTP code";
      case "birthday":
        return "YYYY-MM-DD";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {displayText || "Please provide the required information to complete your payment."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            type={type === "birthday" ? "date" : type === "pin" ? "password" : "text"}
            placeholder={getPlaceholder()}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={type === "pin" ? 4 : type === "otp" ? 6 : undefined}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!value.trim() || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
