"use client";

import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema } from "@/lib/zod";
import { PasswordInput } from "@/components/auth/password-input";
import { AlertCircle } from "lucide-react";
import { adminSignIn } from "@/actions/admin-auth";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: any) {
    const result = await adminSignIn(values);

    if (result.success) {
      toast.success("Welcome back, Admin!");
      router.push("/admin/dashboard");
    } else {
      toast.error(
        result.error ?? "Invalid credentials or insufficient permissions",
      );
    }
  }

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen p-8">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <Link href="/">
          <Image
            src="/amazon-logo-white.png"
            alt="Amazon logo"
            height={150}
            width={150}
            className="mb-6"
          />
        </Link>

        <div className="w-full bg-white rounded-lg shadow-xl md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 md:text-3xl">
                Admin Portal
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Sign in to access the dashboard
              </p>
            </div>

            {/* Unauthorized Error */}
            {error === "unauthorized" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800 mb-1">
                    Access Denied
                  </h3>
                  <p className="text-sm text-red-700">
                    You do not have administrator privileges. Please contact
                    your system administrator.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4 md:space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Admin Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg p-2.5 block w-full focus:ring-slate-500/50 focus:border-slate-600/50"
                            type="email"
                            placeholder="admin@example.com"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <PasswordInput control={form.control} name="password" />
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md">
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4 bg-gray-50 border border-gray-300 text-slate-900 sm:text-sm rounded-lg p-2.5 block focus:ring-slate-500/50 focus:border-slate-600/50"
                            {...field}
                            checked={!!field.value}
                            value={undefined}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium text-gray-700">
                            Keep me signed in
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button
                    className="w-full bg-slate-900 hover:bg-slate-800 font-medium text-sm rounded-xl px-5 py-6 text-center text-white"
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Signing in..."
                      : "Sign In as Admin"}
                  </Button>
                </form>
              </Form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Link href="/">
                <Button variant="outline" className="w-full py-6">
                  Back to Store
                </Button>
              </Link>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Only accounts with administrator
                privileges can access this portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
