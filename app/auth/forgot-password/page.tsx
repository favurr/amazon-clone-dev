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
import { toast } from "sonner";
import { CheckCircle2, Mail, Lock, ArrowLeft } from "lucide-react";
import Image from "next/image";

const emailSchema = z.object({ 
  email: z.string().email("Please enter a valid email address") 
});

const otpSchema = z.object({
  otp: z.string().min(4, "Code must be at least 4 digits").max(8, "Code must be at most 8 digits"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSendCode = async (values: z.infer<typeof emailSchema>) => {
    setIsSending(true);
    const res = await requestPasswordResetAction(values.email);
    setIsSending(false);
    if (res.success) {
      setEmail(values.email);
      toast.success("We sent a verification code to your email");
      setStep(2);
    } else {
      toast.error(res.error || "Failed to send code");
    }
  };

  const onVerifyOtp = async (values: z.infer<typeof otpSchema>) => {
    setIsVerifying(true);
    setOtp(values.otp);
    setIsVerifying(false);
    toast.success("Code accepted. Please set your new password");
    setStep(3);
  };

  const onResetPassword = async (values: z.infer<typeof passwordSchema>) => {
    setIsResetting(true);
    const res = await resetPasswordWithOtpAction({ 
      email, 
      otp, 
      newPassword: values.newPassword 
    });
    setIsResetting(false);
    if (res.success) {
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 1500);
    } else {
      toast.error(res.error || "Failed to reset password");
    }
  };

  const handleResendCode = async () => {
    setIsSending(true);
    const res = await requestPasswordResetAction(email);
    setIsSending(false);
    if (res.success) {
      toast.success("New code sent to your email");
    } else {
      toast.error(res.error || "Failed to resend code");
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen p-8">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <Link href="/" className="mb-6 text-2xl font-semibold text-gray-900">
          <Image src="/amazon-logo.png" alt="Logo" width={70} height={32} className="inline-block mr-2" />
        </Link>
        
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
                {step === 1 && "Reset your password"}
                {step === 2 && "Enter verification code"}
                {step === 3 && "Create new password"}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {step === 1 && "We'll send a code to your email"}
                {step === 2 && `Code sent to ${email}`}
                {step === 3 && "Choose a strong password"}
              </p>
            </div>

            {/* Step 1: Email */}
            {step === 1 && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSendCode)} className="space-y-6">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email address
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="you@example.com" 
                            {...field} 
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={isSending} 
                    className="w-full h-11 bg-orange-500 hover:bg-orange-600"
                  >
                    {isSending ? "Sending code..." : "Send verification code"}
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-6">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification code</FormLabel>
                        <FormControl>
                          <Input 
                            inputMode="numeric" 
                            placeholder="Enter 6 digit code" 
                            {...field}
                            className="h-11 text-center text-lg tracking-widest"
                            maxLength={8}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      disabled={isVerifying} 
                      className="w-full h-11 bg-orange-500 hover:bg-orange-600"
                    >
                      {isVerifying ? "Verifying..." : "Verify code"}
                    </Button>
                    
                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Change email
                      </button>
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isSending}
                        className="text-blue-600 hover:underline disabled:opacity-50"
                      >
                        {isSending ? "Sending..." : "Resend code"}
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onResetPassword)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          New password
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Confirm password
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      disabled={isResetting} 
                      className="w-full h-11 bg-orange-500 hover:bg-orange-600"
                    >
                      {isResetting ? "Resetting password..." : "Reset password"}
                    </Button>
                    
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to verification
                    </button>
                  </div>
                </form>
              </Form>
            )}

            <div className="text-sm text-center text-gray-600 pt-4 border-t">
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
