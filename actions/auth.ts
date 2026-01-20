"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth";

export async function signUpAction(values: any) {
  const { email, password, firstName, lastName } = values;

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        role: "USER",
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function loginAction(values: any) {
  try {
    await auth.api.signInEmail({
      body: {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      },
    });

    return { success: true };
  } catch (error: any) {
    if (error instanceof APIError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Invalid email or password",
    };
  }
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: {
      cookie: (await import("next/headers")).cookies().toString(),
    },
  });
}
