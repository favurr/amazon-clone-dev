"use server";

import { getFlutterwaveToken } from "@/actions/paymentToken";

export async function chargeCard({
  customer_id,
  payment_method_id,
  amount,
  currency = "NGN",
  reference,
  redirect_url,
  meta,
  traceId,
}: {
  customer_id: string;
  payment_method_id: string;
  amount: number;
  currency?: string;
  reference?: string;
  redirect_url?: string;
  meta?: any;
  traceId?: string;
}) {
  const token = await getFlutterwaveToken();
  const traceHeader =
    traceId ?? `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const sanitizeReference = (ref?: string) => {
    if (!ref) return undefined;
    const s = String(ref).replace(/[^a-zA-Z0-9]/g, "");
    return s || undefined;
  };

  const sanitizedReference =
    sanitizeReference(reference) ??
    `charge${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

  const idempotencyKey = sanitizedReference;

  const res = await fetch(
    "https://developersandbox-api.flutterwave.com/charges",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Trace-Id": traceHeader,
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        reference: sanitizedReference,
        currency,
        customer_id,
        payment_method_id,
        redirect_url,
        amount,
        meta,
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

  // Log the raw charge response for debugging/audit
  console.log("FLW_CHARGE_RESPONSE", {
    status: res.status,
    trace: traceHeader,
    request: { customer_id, payment_method_id, amount, currency, reference },
    response: data,
  });

  if (!res.ok) {
    console.error("Flutterwave /charges error", {
      status: res.status,
      trace: traceHeader,
      request: { customer_id, payment_method_id, amount, currency, reference },
      response: data,
    });

    const validationErrors =
      data?.error?.validation_errors ?? data?.validation_errors;
    let errMsg =
      data?.message ||
      data?.error?.message ||
      `Charge failed with status ${res.status}`;

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      const details = validationErrors
        .map(
          (ve: any) =>
            `${ve.field_name ?? ve.field ?? "field"}: ${ve.message ?? JSON.stringify(ve)}`,
        )
        .join("; ");
      errMsg += `: ${details}`;
      console.error("Flutterwave /charges validation details", { details });
    }

    const err = new Error(errMsg);
    (err as any).raw = data;
    throw err;
  }

  const status = data?.status ?? data?.data?.status;
  if (status && status !== "success" && status !== "succeeded") {
    return { data };
  }

  return { data };
}

// Submit (PIN/OTP) auth updates to a charge (supports 'pin' and 'otp')
export async function submitChargeAuth({
  chargeId,
  type,
  pin,
  otp,
  nonce,
  traceId,
}: {
  chargeId: string;
  type: "pin" | "otp";
  pin?: string;
  otp?: string;
  nonce?: string; // optional
  traceId?: string;
}) {
  const token = await getFlutterwaveToken();
  const traceHeader =
    traceId ?? `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  let body: any;

  if (type === "pin") {
    const { encryptAES } = await import("./encrypt");
    const encryptionToken = process.env.FLUTTERWAVE_ENCRYPTION_KEY ?? token;
    const useNonce = nonce || Math.random().toString().slice(2, 14);
    const encrypted_pin = await encryptAES(
      pin ?? "",
      encryptionToken,
      useNonce,
    );
    body = {
      authorization: {
        type: "pin",
        pin: {
          nonce: useNonce,
          encrypted_pin,
        },
      },
    };
  } else {
    // otp path
    body = {
      authorization: {
        type: "otp",
        otp: {
          code: otp,
        },
      },
    };
  }

  const res = await fetch(
    `https://developersandbox-api.flutterwave.com/charges/${chargeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Trace-Id": traceHeader,
      },
      body: JSON.stringify(body),
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

  console.log("FLW_CHARGE_UPDATE_RESPONSE", {
    trace: traceHeader,
    request: body,
    response: data,
  });

  if (!res.ok) {
    console.error("Flutterwave /charges PUT error", {
      status: res.status,
      trace: traceHeader,
      request: { chargeId, body },
      response: data,
    });

    const validationErrors =
      data?.error?.validation_errors ?? data?.validation_errors;
    let errMsg =
      data?.message ||
      data?.error?.message ||
      `Charge update failed with status ${res.status}`;

    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      const details = validationErrors
        .map(
          (ve: any) =>
            `${ve.field_name ?? ve.field ?? "field"}: ${ve.message ?? JSON.stringify(ve)}`,
        )
        .join("; ");
      errMsg += `: ${details}`;
      console.error("Flutterwave /charges PUT validation details", { details });
    }

    const err = new Error(errMsg);
    (err as any).raw = data;
    throw err;
  }

  return { data };
}

// Backwards-compatible wrapper for PIN submissions
export async function submitChargePin({
  chargeId,
  pin,
  nonce,
  traceId,
}: {
  chargeId: string;
  pin: string;
  nonce?: string;
  traceId?: string;
}) {
  return submitChargeAuth({ chargeId, type: "pin", pin, nonce, traceId });
}
