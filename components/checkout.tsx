"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";
import z from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import { CartPageClient } from "./store/cart-page-client";
import Cart from "./checkout-cart";
import CheckOutCart from "./checkout-cart";
import { getCart } from "@/actions/store";
import { authClient } from "@/lib/auth-client";
import { PaymentModal } from "./store/checkout/payment-modals";
import { Paystack3DSModal } from "./store/checkout/paystack-3ds-modal";

interface ProductPrice {
  regular: number;
  sale?: number;
  currency: string;
}

type CartItem = {
  id: string;
  product_id: string;
  link: string;
  name: string;
  image: string;
  price: ProductPrice;
  quantity: number;
  details: {
    label: string;
    value: string;
  }[];
};

interface CartItemProps extends CartItem {
  index: number;
  onRemoveClick: () => void;
  onQuantityChange: (newQty: number) => void;
  disabled?: boolean;
}

interface CartProps {
  cartItems: CartItem[];
  form: UseFormReturn<CheckoutFormType>;
}

const PAYMENT_METHODS = {
  creditCard: "creditCard",
  payOnDelivery: "payOnDelivery",
};

type PaymentMethod = keyof typeof PAYMENT_METHODS;

const removeSpaces = (val: string) => val.replace(/\s/g, "");

const CreditCardPayment = z.object({
  method: z.literal(PAYMENT_METHODS.creditCard),
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .transform(removeSpaces)
    .refine((val) => /^\d{16,19}$/.test(val), {
      message: "Card number must be 16-19 digits",
    }),
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
  cvc: z
    .string()
    .min(3, "CVV must be 3-4 digits")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d+$/, "Must contain only numbers"),
});

const PaymentSchema = z.discriminatedUnion("method", [CreditCardPayment]);

const checkoutFormSchema = z.object({
  contactInfo: z.object({
    email: z.string().email("Please enter a valid email"),
    subscribe: z.boolean().optional(),
  }),
  address: z.object({
    country: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    postalCode: z.string(),
    city: z.string(),
    phone: z.string(),
  }),
  payment: PaymentSchema,
  products: z
    .object({
      product_id: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
    .array(),
});

type CheckoutFormType = z.infer<typeof checkoutFormSchema>;

interface CheckoutProps {
  cartItemData: {
    items: any[];
    total: number;
  };
  userId?: string;
  onComplete?: () => void;
  disabled?: boolean;
}

const Checkout = ({
  cartItemData,
  userId,
  onComplete,
  disabled = false,
}: CheckoutProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState("item-1");
  const [cartData, setCartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "pin" | "otp" | "birthday" | null;
    displayText?: string;
    reference?: string;
    orderId?: string;
  }>({
    isOpen: false,
    type: null,
  });
  const [threeDSState, setThreeDSState] = useState<{
    isOpen: boolean;
    url?: string;
    reference?: string;
    orderId?: string;
  }>({
    isOpen: false,
  });

  const { items, total } = cartItemData;

  const defaultProducts = cartItemData.items.map((item) => ({
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
  }));

  const form = useForm({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      payment: {
        method: PAYMENT_METHODS.creditCard,
        cardNumber: "",
        expiryDate: "",
        cvc: "",
      },
      contactInfo: {
        email: "",
        subscribe: false,
      },
      address: {
        country: "",
        firstName: "",
        lastName: "",
        address: "",
        postalCode: "",
        city: "",
        phone: "",
      },
      products: defaultProducts,
    },
  });

  const TAX_RATE = 0.00312;
  const roundTo2 = (value: number) => Math.round(value * 100) / 100;

  const taxAmount = roundTo2(total * TAX_RATE);
  const grandTotal = roundTo2(total + taxAmount);

  const handleModalSubmit = async (value: string) => {
    setIsSubmitting(true);
    try {
      const endpoint =
        modalState.type === "pin"
          ? "/api/payments/submit-pin"
          : modalState.type === "otp"
            ? "/api/payments/submit-otp"
            : "/api/payments/submit-birthday";

      const body: any = {
        reference: modalState.reference,
      };

      if (modalState.type === "pin") {
        body.pin = value;
      } else if (modalState.type === "otp") {
        body.otp = value;
      } else if (modalState.type === "birthday") {
        body.birthday = value;
      }

      console.log(`[Modal] Submitting ${modalState.type}:`, {
        reference: modalState.reference,
        valueLength: value?.length,
      });

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const respJson = await resp.json().catch(() => null);

      if (respJson?.requiresAction && respJson?.redirectUrl) {
        window.location.href = respJson.redirectUrl;
        return;
      }

      if (respJson?.data?.status === "success") {
        // Update order status
        await fetch(`/api/orders/${modalState.orderId}/complete`, {
          method: "POST",
        });

        setModalState({ isOpen: false, type: null });
        toast.success("Payment successful!");
        router.push("/orders");
        return;
      }

      // Check if requires another auth step
      if (respJson?.data?.status === "send_otp") {
        setModalState({
          isOpen: true,
          type: "otp",
          displayText: respJson.data.display_text,
          reference: respJson.data.reference,
          orderId: modalState.orderId,
        });
        setIsSubmitting(false);
        return;
      }

      if (respJson?.data?.status === "send_birthday") {
        setModalState({
          isOpen: true,
          type: "birthday",
          displayText: respJson.data.display_text,
          reference: respJson.data.reference,
          orderId: modalState.orderId,
        });
        setIsSubmitting(false);
        return;
      }

      if (respJson?.data?.status === "send_phone") {
        setModalState({ isOpen: false, type: null });
        toast.info("Please authorize the payment on your phone", {
          duration: 5000,
        });
        // Poll for status
        pollPaymentStatus(respJson.data.reference, modalState.orderId);
        return;
      }

      if (respJson?.data?.status === "pending") {
        setModalState({ isOpen: false, type: null });
        toast.loading("Processing payment...", {
          duration: Infinity,
          id: "payment-processing",
        });
        // Poll for status
        pollPaymentStatus(respJson.data.reference, modalState.orderId);
        return;
      }

      toast.error(respJson?.message || "Payment could not be completed.");
      setModalState({ isOpen: false, type: null });
    } catch (error: any) {
      console.error("Modal submit error:", error);
      toast.error(error.message || "An error occurred");
      setModalState({ isOpen: false, type: null });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollPaymentStatus = async (
    reference: string,
    orderId: string | undefined,
    attempts = 0,
  ) => {
    const maxAttempts = 24; // 24 attempts = 2 minutes (5 second intervals)

    if (attempts >= maxAttempts) {
      setIsSubmitting(false);
      setModalState({ isOpen: false, type: null });
      toast.dismiss("payment-processing");
      toast.error(
        "Payment verification timeout. Please check your orders page.",
        {
          duration: 5000,
        },
      );
      return;
    }

    try {
      // Add initial delay before first poll (10 seconds), then 5 seconds between polls
      const delay = attempts === 0 ? 10000 : 5000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      const response = await fetch(
        `/api/payments/check-status?reference=${reference}`,
      );
      const data = await response.json();

      console.log(
        `[Poll ${attempts + 1}/${maxAttempts}] Payment status:`,
        data.data?.status,
        data.data?.message,
      );

      if (data.data?.status === "success") {
        // Complete order
        if (orderId) {
          await fetch(`/api/orders/${orderId}/complete`, {
            method: "POST",
          });
        }

        setModalState({ isOpen: false, type: null });
        setIsSubmitting(false);
        toast.dismiss("payment-processing");
        toast.success("Payment successful!");
        router.push("/orders");
        return;
      }

      if (data.data?.status === "failed") {
        setModalState({ isOpen: false, type: null });
        setIsSubmitting(false);
        toast.dismiss("payment-processing");

        // Get the most specific error message available
        const errorMessage =
          data.data?.gateway_response ||
          data.data?.message ||
          data.message ||
          "Payment failed";

        toast.error(errorMessage, { duration: 5000 });
        return;
      }

      // Still pending, continue polling
      pollPaymentStatus(reference, orderId, attempts + 1);
    } catch (error) {
      console.error("Polling error:", error);
      setIsSubmitting(false);
      setModalState({ isOpen: false, type: null });
      toast.dismiss("payment-processing");
      toast.error("Failed to verify payment status");
    }
  };

  const handleModalClose = () => {
    setModalState({ isOpen: false, type: null });
    setIsSubmitting(false);
  };

  const onSubmit = async (data: CheckoutFormType) => {
    if (!userId) {
      toast.error("You must be signed in to complete checkout");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactInfo: data.contactInfo,
          address: data.address,
          payment: {
            ...data.payment,
            cardNumber: removeSpaces(data.payment.cardNumber),
          },
          totalPrice: grandTotal,
          userId,
          products: data.products,
        }),
      });

      const json = await res.json().catch(() => null);

      if (json?.requiresAction && json?.redirectUrl) {
        // Show 3DS modal instead of redirecting
        console.log("[Checkout] Opening 3DS modal:", json.redirectUrl);

        setThreeDSState({
          isOpen: true,
          url: json.redirectUrl,
          reference: json.reference,
          orderId: json.orderId,
        });
        setIsSubmitting(false);
        return;
      }

      if (json?.requiresAuth) {
        // Show modal instead of window.prompt
        setModalState({
          isOpen: true,
          type: json.authType,
          displayText: json.displayText,
          reference: json.reference,
          orderId: json.orderId,
        });
        setIsSubmitting(false);
        return;
      }

      if (res.ok && json?.success) {
        toast.success("Payment successful!");
        router.push("/orders");
        return;
      }

      // Show helpful message if server returned charge data
      if (json) {
        console.error("Checkout response:", json);
        toast.error(json.message || "Payment failed");
        return;
      }

      throw new Error("Payment failed");
    } catch (err) {
      console.error("Checkout submit error:", err);
      toast.error((err as Error).message || "Payment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onContinue = (value: string) => {
    setActiveAccordion(value);
  };

  const handleOnValueChange = (value: string) => {
    setActiveAccordion(value);
  };

  React.useEffect(() => {
    const initializeCheckout = async () => {
      try {
        const session = await authClient.getSession();

        if (!session || !session.data?.user) {
          redirect("/auth/login");
        }

        const data = await getCart(session.data.user.id);
        setCartData(data);
      } catch (error) {
        console.error("Failed to initialize checkout:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCheckout();
  }, []);

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <section>
      <div className="container">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 lg:gap-17.5">
              <div>
                <CheckOutCart cartData={cartData} />
              </div>
              <div>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full"
                  value={activeAccordion}
                  onValueChange={handleOnValueChange}
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="px-1 py-7 text-lg font-semibold hover:no-underline [&>svg:last-child]:hidden [&[data-state=closed]>svg:nth-of-type(2)]:hidden [&[data-state=open]>svg:nth-of-type(1)]:hidden [&[data-state=open]>svg:nth-of-type(2)]:block">
                      Contact Information
                      <Plus className="pointer-events-none size-4 shrink-0 self-center text-muted-foreground" />
                      <Minus className="pointer-events-none hidden size-4 shrink-0 self-center text-muted-foreground" />
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-7">
                      <div className="space-y-7">
                        <ContactFields />
                        <Button
                          type="button"
                          className="w-full"
                          variant="secondary"
                          onClick={() => onContinue("item-2")}
                        >
                          Continue
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="px-1 py-7 text-lg font-semibold hover:no-underline [&>svg:last-child]:hidden [&[data-state=closed]>svg:nth-of-type(2)]:hidden [&[data-state=open]>svg:nth-of-type(1)]:hidden [&[data-state=open]>svg:nth-of-type(2)]:block">
                      Address
                      <Plus className="pointer-events-none size-4 shrink-0 self-center text-muted-foreground" />
                      <Minus className="pointer-events-none hidden size-4 shrink-0 self-center text-muted-foreground" />
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-7">
                      <div className="space-y-7">
                        <AddressFields />
                        <Button
                          type="button"
                          className="w-full"
                          variant="secondary"
                          onClick={() => onContinue("item-3")}
                        >
                          Continue
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="px-1 py-7 text-lg font-semibold hover:no-underline [&>svg:last-child]:hidden [&[data-state=closed]>svg:nth-of-type(2)]:hidden [&[data-state=open]>svg:nth-of-type(1)]:hidden [&[data-state=open]>svg:nth-of-type(2)]:block">
                      Payment
                      <Plus className="pointer-events-none size-4 shrink-0 self-center text-muted-foreground" />
                      <Minus className="pointer-events-none hidden size-4 shrink-0 self-center text-muted-foreground" />
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-7">
                      <div className="space-y-7">
                        <PaymentFieldsByMethod disabled={disabled} />
                        <Button
                          type="submit"
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          disabled={disabled || isSubmitting}
                        >
                          {isSubmitting
                            ? "Processing..."
                            : "Continue to Payment"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Payment Modal for PIN/OTP/Birthday */}
      {modalState.isOpen && modalState.type && (
        <PaymentModal
          isOpen={modalState.isOpen}
          type={modalState.type}
          displayText={modalState.displayText}
          onSubmit={handleModalSubmit}
          onClose={handleModalClose}
          loading={isSubmitting}
        />
      )}

      {/* 3DS Authentication Modal */}
      {threeDSState.isOpen && threeDSState.url && (
        <Paystack3DSModal
          isOpen={threeDSState.isOpen}
          url={threeDSState.url}
          reference={threeDSState.reference!}
          orderId={threeDSState.orderId!}
          onSuccess={() => {
            setThreeDSState({ isOpen: false });
            toast.success("Payment successful!");
            router.push("/orders");
          }}
          onClose={() => {
            setThreeDSState({ isOpen: false });
            toast.error("Payment was not completed");
          }}
        />
      )}
    </section>
  );
};

const ContactFields = () => {
  const form = useFormContext();

  return (
    <FieldGroup className="gap-3.5">
      <Controller
        name="contactInfo.email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="checkout-email"
            >
              Email
            </FieldLabel>
            <Input
              {...field}
              id="checkout-email"
              type="email"
              value={field.value || ""}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="contactInfo.subscribe"
        control={form.control}
        render={({ field }) => (
          <Field orientation="horizontal">
            <Checkbox
              id="checkout-subscribe"
              name={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <FieldLabel htmlFor="checkout-subscribe" className="font-normal">
              Email me with news and offers
            </FieldLabel>
          </Field>
        )}
      />
    </FieldGroup>
  );
};

const AddressFields = () => {
  const form = useFormContext();

  return (
    <FieldGroup className="gap-3.5">
      <Controller
        name="address.country"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="checkout-country"
            >
              Country
            </FieldLabel>
            <Input
              {...field}
              id="checkout-country"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex gap-3.5 max-sm:flex-col">
        <Controller
          name="address.firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                className="text-sm font-normal"
                htmlFor="checkout-firstName"
              >
                First Name
              </FieldLabel>
              <Input
                {...field}
                id="checkout-firstName"
                type="text"
                value={field.value || ""}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="address.lastName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                className="text-sm font-normal"
                htmlFor="checkout-lastName"
              >
                Last Name
              </FieldLabel>
              <Input
                {...field}
                id="checkout-lastName"
                type="text"
                value={field.value || ""}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <Controller
        name="address.address"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="checkout-address"
            >
              Address
            </FieldLabel>
            <Input
              {...field}
              id="checkout-address"
              type="text"
              value={field.value || ""}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex gap-3.5 max-sm:flex-col">
        <Controller
          name="address.postalCode"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                className="text-sm font-normal"
                htmlFor="checkout-postalCode"
              >
                Postal Code
              </FieldLabel>
              <Input
                {...field}
                id="checkout-postalCode"
                type="text"
                value={field.value || ""}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="address.city"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                className="text-sm font-normal"
                htmlFor="checkout-city"
              >
                City
              </FieldLabel>
              <Input
                {...field}
                id="checkout-city"
                type="text"
                value={field.value || ""}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <Controller
        name="address.phone"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="checkout-phone"
            >
              Phone
            </FieldLabel>
            <Input
              {...field}
              id="checkout-phone"
              type="tel"
              value={field.value || ""}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
};

const PaymentFieldsByMethod = ({ disabled }: { disabled?: boolean }) => {
  const form = useFormContext();
  return (
    <div className="space-y-3.5">
      <Controller
        name="payment.cardholderName"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="checkout-payment-cardholderName"
            >
              Cardholder Name
            </FieldLabel>
            <Input
              {...field}
              id="checkout-payment-cardholderName"
              type="text"
              value={field.value || ""}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="payment.cardNumber"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel
              className="text-sm font-normal"
              htmlFor="checkout-payment-cardNumber"
            >
              Card Number
            </FieldLabel>
            <Input
              {...field}
              id="checkout-payment-cardNumber"
              type="text"
              value={field.value || ""}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              placeholder="4111 1111 1111 1111"
              onChange={(e) => {
                let val = e.target.value.replace(/\s/g, "");
                val = val.replace(/(\d{4})/g, "$1 ").trim();
                field.onChange(val);
              }}
              maxLength={19}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex gap-3.5 max-sm:flex-col">
        <DateInput />
        <Controller
          name="payment.cvc"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel
                className="text-sm font-normal"
                htmlFor="checkout-payment-cvc"
              >
                CVV
              </FieldLabel>
              <Input
                {...field}
                id="checkout-payment-cvc"
                type="password"
                value={field.value || ""}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </div>
  );
};

const DateInput = () => {
  const form = useFormContext();

  return (
    <Controller
      name="payment.expiryDate"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel
            className="text-sm font-normal"
            htmlFor="checkout-payment-expiryDate"
          >
            Expiry Date
          </FieldLabel>
          <Input
            {...field}
            onChange={(e) => {
              let val = e.target.value;
              val = val.replace(/[^0-9/]/g, "");

              const prev = field.value ?? "";
              const isDeleting = val.length < prev.length;

              if (!isDeleting) {
                if (val.length === 2 && !val.includes("/")) {
                  val = val + "/";
                }
              }

              if (val.length > 5) {
                val = val.slice(0, 5);
              }

              field.onChange(val);
            }}
            pattern="^(0[1-9]|1[0-2])/[0-9]{2}$"
            placeholder="MM/YY"
            id="checkout-payment-expiryDate"
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default Checkout;
