"use client";

import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { requestPasswordResetAction, resetPasswordWithOtpAction } from "@/actions/auth";
import { GlobalAlert } from "@/components/tools/global-alert";
import { useAlert } from "@/store/use-alert-store";

const emailSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({
  otp: z.string().min(4, "Enter the 4-8 digit code"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export default function ForgotPasswordPage() {
  const alert = useAlert();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", newPassword: "" },
  });

  const onSendCode = async (values: z.infer<typeof emailSchema>) => {
    setIsSending(true);
    const res = await requestPasswordResetAction(values.email);
    setIsSending(false);
    if (res.success) {
      setEmail(values.email);
      alert.success("We sent a verification code to your email");
      setStep("verify");
    } else {
      alert.error(res.error || "Failed to send code");
    }
  };

  const onReset = async (values: z.infer<typeof resetSchema>) => {
    setIsResetting(true);
    const res = await resetPasswordWithOtpAction({ email, otp: values.otp, newPassword: values.newPassword });
    setIsResetting(false);
    if (res.success) {
      alert.success("Password reset successfully");
      router.push("/auth/login");
    } else {
      alert.error(res.error || "Failed to reset password");
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen p-8">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <Link href="/" className="mb-6 text-2xl font-semibold text-gray-900">Amazon</Link>
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Forgot your password?
            </h1>
            <GlobalAlert />

            {step === "request" && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSendCode)} className="space-y-6">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSending} className="w-full bg-orange-500 hover:bg-orange-600">
                    {isSending ? "Sending..." : "Send code"}
                  </Button>
                </form>
              </Form>
            )}

            {step === "verify" && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-6">
                  <div className="text-sm text-gray-600">We sent a code to <span className="font-medium">{email}</span></div>
                  <FormField
                    control={resetForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification code (OTP)</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" placeholder="Enter the code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isResetting} className="w-full bg-orange-500 hover:bg-orange-600">
                    {isResetting ? "Resetting..." : "Reset password"}
                  </Button>
                  <div className="text-xs text-gray-500">Didn’t get the code? <button type="button" onClick={() => onSendCode({ email })} className="text-blue-600 hover:underline">Resend</button></div>
                </form>
              </Form>
            )}

            <div className="text-sm text-gray-600">
              <Link href="/auth/login" className="text-blue-600 hover:underline">Back to login</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
