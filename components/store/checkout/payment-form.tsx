"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldTitle,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { paymentService } from "@/lib/payment-service";

const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number is too long")
    .regex(/^\d+$/, "Must contain only numbers"),
  cardholderName: z.string().min(3, "Please enter the cardholder name"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid format (MM/YY)")
    .refine((value) => {
      const [mm, yy] = value.split("/").map(Number);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear() % 100;
      if (yy < currentYear) return false;
      if (yy === currentYear && mm < currentMonth) return false;
      return true;
    }, "Card has expired"),
  cvv: z
    .string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d+$/, "Must contain only numbers"),
});

type CardFormData = z.infer<typeof cardSchema>;

interface PaymentFormProps {
  amount: number;
  customerId: string;
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: Error) => void;
}

export function PaymentForm({
  amount,
  customerId,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
  });

  const onSubmit = async (data: CardFormData) => {
    try {
      setLoading(true);

      // Extract month and year from expiry date
      const [month, year] = data.expiryDate.split("/");

      const result = await paymentService.tokenizeCard({
        customerId,
        cardNumber: data.cardNumber.replace(/\s/g, ""),
        cvv: data.cvv,
        expiryMonth: month,
        expiryYear: `20${year}`,
      });

      onSuccess(result.paymentMethodId);
    } catch (err) {
      console.error("PAYMENT_ERROR", err);
      onError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="cardNumber">Card Number</FieldLabel>
        <Input
          {...form.register("cardNumber")}
          id="cardNumber"
          placeholder="4111 1111 1111 1111"
          onChange={(e) => {
            // Format card number with spaces
            let val = e.target.value.replace(/\s/g, "");
            val = val.replace(/(\d{4})/g, "$1 ").trim();
            form.setValue("cardNumber", val);
          }}
          maxLength={19}
        />
        {form.formState.errors.cardNumber && (
          <FieldError errors={[form.formState.errors.cardNumber]} />
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="cardholderName">Cardholder Name</FieldLabel>
        <Input
          {...form.register("cardholderName")}
          id="cardholderName"
          placeholder="John Smith"
        />
        {form.formState.errors.cardholderName && (
          <FieldError
            errors={[form.formState.errors.cardholderName]}
          />
        )}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="expiryDate">Expiry Date</FieldLabel>
          <Input
            {...form.register("expiryDate")}
            id="expiryDate"
            placeholder="MM/YY"
            maxLength={5}
            onChange={(e) => {
              let val = e.target.value;
              val = val.replace(/[^0-9]/g, "");
              if (val.length >= 2) {
                val = val.slice(0, 2) + "/" + val.slice(2);
              }
              form.setValue("expiryDate", val);
            }}
          />
          {form.formState.errors.expiryDate && (
            <FieldError errors={[form.formState.errors.expiryDate]} />
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="cvv">CVV</FieldLabel>
          <Input
            {...form.register("cvv")}
            id="cvv"
            type="password"
            placeholder="123"
            maxLength={4}
          />
          {form.formState.errors.cvv && (
            <FieldError errors={[form.formState.errors.cvv]} />
          )}
        </Field>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay NGN ${amount.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Your card information is secure and encrypted
      </p>
    </form>
  );
}
