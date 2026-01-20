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
import { loginAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/zod";
import { PasswordInput } from "@/components/auth/password-input";
import { useAlert } from "@/store/use-alert-store";
import { GlobalAlert } from "@/components/tools/global-alert";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const alert = useAlert();

  async function onSubmit(values: any) {
    const result = await loginAction(values);

    if (result.success) {
      alert.success("Welcome back!", "floating");
      router.push("/");
    } else {
      alert.error(result.error ?? "An unexpected error occurred");
    }
  }

  return (
    <section className="bg-gray-50 p-8">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
        <Link href="/">
          <Image
            src="/amazon-logo.png"
            alt="Amazon logo"
            height={150}
            width={150}
          />
        </Link>
        <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Login your Account
            </h1>
            <GlobalAlert />
            <div className="space-y-4 md;space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg p-2.5 block w-full focus:ring-orange-500/50! focus:border-orange-600/50!"
                            type="email"
                            placeholder="john@example.com"
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
                            className="h-4 w-4 bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg p-2.5 block focus:ring-orange-500/50! focus:border-orange-600/50!"
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
                    className="w-full bg-orange-400 hover:bg-orange-500 font-medium text-sm rounded-xl px-5 text-center"
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
              <p className="text-sm font-light text-gray-500">
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Signup here
                </Link>
              </p>
            </div>
            <div className="text-xs text-gray-600 mt-4 leading-relaxed">
              By continuing, you agree to Amazon's{" "}
              <Link
                href="/terms"
                className="text-blue-600 hover:underline hover:text-orange-600"
              >
                Conditions of Use
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:underline hover:text-orange-600"
              >
                Privacy Notice
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
