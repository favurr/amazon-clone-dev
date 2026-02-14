"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth";
import { createNotification } from "@/actions/notifications";

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

    // Create notification for new user signup
    await createNotification(
      "NEW_USER",
      "New User Registered",
      `${firstName} ${lastName} (${email}) just signed up`,
      `/admin/customers`
    );

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
  const { cookies } = await import("next/headers");
  const cookieHeader = (await cookies()).toString();

  await auth.api.signOut({
    headers: {
      cookie: cookieHeader,
    },
  });
}

// 1) Request an OTP to reset password (sends email)
export async function requestPasswordResetAction(email: string) {
  try {
    await auth.api.sendVerificationOTP({
      body: { email, type: "forget-password" },
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof APIError ? error.message : "Failed to send code";
    return { success: false, error: message };
  }
}

export async function resetPasswordWithOtpAction(params: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  const { email, otp, newPassword } = params;
  try {
    await auth.api.checkVerificationOTP({
      body: { email, type: "forget-password", otp },
    });

    await auth.api.changePassword({
      body: {  },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof APIError ? error.message : "Failed to reset password";
    return { success: false, error: message };
  }
}
