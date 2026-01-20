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
import { signUpAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/auth/password-input";
import { useAlert } from "@/store/use-alert-store";
import { GlobalAlert } from "@/components/tools/global-alert";

const formSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long"),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long"),

    email: z
      .string()
      .email("Please enter a valid email address")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      // Optional: Add regex for stronger security
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Sets the error to the confirmPassword field
  });

export default function SignUpPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const alert = useAlert();

  async function onSubmit(values: any) {
    const result = await signUpAction(values);

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
              Create your Account
            </h1>
            <GlobalAlert />
            <div className="space-y-4 md;space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg p-2.5 block w-full focus:ring-orange-500/50! focus:border-orange-600/50!"
                              placeholder="John"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg p-2.5 block w-full focus:ring-orange-500/50! focus:border-orange-600/50!"
                              placeholder="Doe"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                  <PasswordInput
                    control={form.control}
                    name="password"
                    label="Password"
                  />

                  {/* Confirm Password */}
                  <PasswordInput
                    control={form.control}
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="********"
                    autoComplete="new-password"
                  />
                  <Button
                    className="w-full bg-orange-400 hover:bg-orange-500 font-medium text-sm rounded-xl px-5 text-center"
                    type="submit"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Creating Account..."
                      : "Sign Up"}
                  </Button>
                </form>
              </Form>
              <p className="text-sm font-light text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
