"use server";

import { getFlutterwaveToken } from "@/actions/paymentToken";
import { encryptAES } from "@/actions/flutterwave/encrypt";

export async function tokenizeCard({
  email,
  card_number,
  cvv,
  expiryDate,
  nonce,
  traceId,
}: {
  email?: string;
  card_number: string;
  cvv: string;
  expiryDate?: string;
  nonce: string;
  traceId?: string;
}) {
  const token = await getFlutterwaveToken();
  const traceHeader =
    traceId ?? `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (!nonce || nonce.length !== 12) {
    throw new Error("Nonce must be exactly 12 characters long");
  }

  const encryptionToken = process.env.FLUTTERWAVE_ENCRYPTION_KEY ?? token;
  if (process.env.FLUTTERWAVE_ENCRYPTION_KEY) {
    console.log(
      "Using FLUTTERWAVE_ENCRYPTION_KEY for client-side encryption (from env)",
    );
  } else {
    console.warn(
      "FLUTTERWAVE_ENCRYPTION_KEY not set; attempting to use OAuth access token as AES key. This only works if the access token is a base64-encoded 16/24/32-byte key.",
    );
  }

  const [mm, yy] = (expiryDate || "").split("/");
  const expiry_month = mm || "01";
  const expiry_year = yy || new Date().getFullYear().toString().slice(-2);

  // Encrypt individual card fields
  const encrypted_card_number = await encryptAES(
    card_number,
    encryptionToken,
    nonce,
  );
  const encrypted_expiry_month = await encryptAES(
    expiry_month,
    encryptionToken,
    nonce,
  );
  const encrypted_expiry_year = await encryptAES(
    expiry_year,
    encryptionToken,
    nonce,
  );
  const encrypted_cvv = await encryptAES(cvv, encryptionToken, nonce);

  const res = await fetch(
    "https://developersandbox-api.flutterwave.com/payment-methods",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Trace-Id": traceHeader,
        "X-Idempotency-Key": nonce,
      },
      body: JSON.stringify({
        type: "card",
        card: {
          encrypted_card_number,
          encrypted_expiry_month,
          encrypted_expiry_year,
          encrypted_cvv,
          nonce,
        },
      }),
    },
  );

  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    try {
      data = await res.text();
    } catch (ee) {
      data = null;
    }
  }

  const payment_method_id = data?.data?.id ?? data?.id;

  if (!res.ok || !payment_method_id) {
    console.error("Flutterwave /payment-methods error", {
      status: res.status,
      trace: traceHeader,
      request: { nonce },
      response: data,
    });

    const message =
      data?.message ||
      data?.error?.message ||
      (typeof data === "string" ? data : JSON.stringify(data ?? {}));

    const err = new Error(message || "Card tokenization failed");
    (err as any).raw = data;
    throw err;
  }

  return { payment_method_id, data };
}
