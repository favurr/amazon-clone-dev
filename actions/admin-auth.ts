"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function checkAdminAccess() {
  try {
    // Try standard headers() method first
    let session = await auth.api.getSession({
      headers: await headers(),
    });

    // Fallback: sometimes headers() may not expose cookies in certain contexts
    // Try using cookies() to construct a cookie header if session is not found
    if (!session?.user?.id) {
      try {
        const { cookies } = await import("next/headers");
        const cookieHeader = (await cookies()).toString();
        if (cookieHeader) {
          session = await auth.api.getSession({
            headers: { cookie: cookieHeader } as any,
          });
        }
      } catch (e) {
        // ignore fallback errors
        console.debug("checkAdminAccess: cookies fallback failed", e);
      }
    }

    if (!session?.user?.id) {
      console.debug("checkAdminAccess: no session found");
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      console.debug("checkAdminAccess: user not found in db", {
        userId: session.user.id,
      });
      return null;
    }

    if (user.role !== "ADMIN") {
      console.debug("checkAdminAccess: user is not admin", {
        userId: user.id,
        role: user.role,
      });
      return null;
    }

    return user;
  } catch (error) {
    console.error("Admin access check error:", error);
    return null;
  }
}

export async function requireAdmin() {
  const admin = await checkAdminAccess();

  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }

  return admin;
}

// Admin sign-in helper: sign in and verify role
export async function adminSignIn(values: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  try {
    await auth.api.signInEmail({
      body: {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      },
    });

    // Attempt to fetch session
    const { headers } = await import("next/headers");
    let session = await auth.api.getSession({ headers: await headers() });

    // Fallback to cookie header if necessary
    if (!session?.user?.id) {
      try {
        const { cookies } = await import("next/headers");
        const cookieHeader = (await cookies()).toString();
        if (cookieHeader) {
          session = await auth.api.getSession({
            headers: { cookie: cookieHeader } as any,
          });
        }
      } catch (e) {
        console.debug("adminSignIn: cookies fallback failed", e);
      }
    }

    if (!session?.user?.id) {
      return { success: false, error: "Authentication failed" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      // sign out non-admin user
      try {
        const { cookies } = await import("next/headers");
        const cookieHeader = (await cookies()).toString();
        await auth.api.signOut({ headers: { cookie: cookieHeader } });
      } catch (e) {
        console.debug("adminSignIn: signOut failed", e);
      }
      return {
        success: false,
        error: "You do not have administrator privileges",
      };
    }

    return { success: true };
  } catch (err: any) {
    if (err?.name === "APIError" || err?.message) {
      return { success: false, error: err.message || String(err) };
    }
    return { success: false, error: "Invalid email or password" };
  }
}
