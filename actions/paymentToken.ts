"use server";

import prisma from "@/lib/prisma";

export async function getFlutterwaveToken() {
  console.log("Accuiring token");
  const existing = await prisma.flutterwaveToken.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (existing && existing.expiresAt > new Date()) {
    return existing.token;
  }

  if (
    !process.env.FLUTTERWAVE_CLIENT_ID ||
    !process.env.FLUTTERWAVE_SECRET_KEY
  ) {
    throw new Error("Missing Flutterwave credentials");
  }

  const params = new URLSearchParams({
    client_id: process.env.FLUTTERWAVE_CLIENT_ID,
    client_secret: process.env.FLUTTERWAVE_SECRET_KEY,
    grant_type: "client_credentials",
  });

  const tokenRes = await fetch(
    "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error("Flutterwave token error:", errorText);
    throw new Error("Failed to fetch Flutterwave token");
  }

  const data = await tokenRes.json();

  if (!data?.access_token || !data?.expires_in) {
    console.error("Invalid token response:", data);
    throw new Error("Invalid Flutterwave token response");
  }

  await prisma.flutterwaveToken.create({
    data: {
      token: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });

  console.log("Token retrived");
  return data.access_token;
}
