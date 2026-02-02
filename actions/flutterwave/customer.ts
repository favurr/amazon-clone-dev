"use server";

import { getFlutterwaveToken } from "@/actions/paymentToken";

type ContactInfo = { email?: string };
type Address = {
  country?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  firstName?: string;
  lastName?: string;
};

export async function createCustomer({
  contactInfo,
  address,
  traceId,
}: {
  contactInfo: ContactInfo;
  address: Address;
  traceId?: string;
}) {
  const token = await getFlutterwaveToken();
  const traceHeader =
    traceId ?? `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Normalization helpers (kept small and deterministic)
  const normalizeCountry = (input: any) => {
    if (!input) return null;
    const s = String(input).trim().toLowerCase();
    const map: Record<string, string> = {
      nigeria: "NG",
      "nigeria (federal republic of)": "NG",
      "united states": "US",
      usa: "US",
      us: "US",
      "united kingdom": "GB",
      uk: "GB",
      "great britain": "GB",
      canada: "CA",
      ghana: "GH",
    };
    if (s.length === 2) return s.toUpperCase();
    if (map[s]) return map[s];
    for (const key of Object.keys(map)) {
      if (s.includes(key)) return map[key];
    }
    return null;
  };

  const getCountryDialCode = (iso?: string) => {
    const map: Record<string, string> = {
      NG: "234",
      US: "1",
      CA: "1",
      GB: "44",
      GH: "233",
    };
    if (!iso) return "";
    return map[iso] ?? "";
  };

  const countryIso = normalizeCountry(address.country);
  const rawPhone = (address.phone ?? "").toString().replace(/\D/g, "");
  let phoneNumber = rawPhone;

  if (phoneNumber.startsWith("234")) {
    phoneNumber = phoneNumber.slice(phoneNumber.length - 10);
  } else if (phoneNumber.startsWith("0")) {
    phoneNumber = phoneNumber.replace(/^0+/, "");
  }

  if (phoneNumber.length > 10) {
    phoneNumber = phoneNumber.slice(-10);
  }

  if (phoneNumber.length < 7 || phoneNumber.length > 10) {
    throw new Error(
      "Invalid phone number. Must be 7-10 digits (local number).",
    );
  }

  if (!countryIso) {
    throw new Error(
      'Invalid country. Provide a valid ISO2 country code or common country name (e.g., "NG" or "Nigeria").',
    );
  }

  const countryDialCode = getCountryDialCode(countryIso);

  const res = await fetch(
    "https://developersandbox-api.flutterwave.com/customers",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Trace-Id": traceHeader,
      },
      body: JSON.stringify({
        name: {
          first: address.firstName || "N/A",
          middle: address.firstName ? address.firstName[0] + "." : "N/A",
          last: address.lastName || "N/A",
        },
        email: contactInfo.email || "noemail@example.com",
        phone: {
          country_code: countryDialCode || "234",
          number: phoneNumber,
        },
        address: {
          line1: address.address || "N/A",
          line2: `${address.address || "N/A"}, ${address.city || "N/A"}`,
          city: address.city || "N/A",
          state: address.state || "N/A",
          country: countryIso,
          postal_code: address.postalCode || "00000",
        },
      }),
    },
  );

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.status !== "success") {
    const validationErrors = data?.error?.validation_errors;
    let errMsg = data?.message ?? "Customer creation failed";
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      const details = validationErrors
        .map((ve: any) => ve?.message ?? JSON.stringify(ve))
        .join("; ");
      errMsg += `: ${details}`;
    }
    const debug = JSON.stringify(
      data ?? { status: res.status, statusText: res.statusText },
      null,
      2,
    );
    const err = new Error(`${errMsg} - ${debug}`);
    // attach raw response for callers that want to inspect
    (err as any).raw = data;
    throw err;
  }

  const customer_id =
    data?.data?.id ?? data?.data?.customer_id ?? data?.customer_id ?? data?.id;

  if (!customer_id) {
    const err = new Error("Customer creation failed - missing customer id");
    (err as any).raw = data;
    throw err;
  }

  return { customer_id, data };
}

// Try to find an existing customer by email or phone. Returns { customer_id, data } or null
export async function findCustomer({
  email,
  phone,
  traceId,
}: {
  email?: string;
  phone?: string;
  traceId?: string;
}) {
  const token = await getFlutterwaveToken();
  const traceHeader =
    traceId ?? `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Prefer searching by email
  if (email) {
    const url = `https://developersandbox-api.flutterwave.com/customers?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Trace-Id": traceHeader,
      },
    });

    const data = await res.json().catch(() => null);
    if (
      res.ok &&
      (Array.isArray(data?.data) ? data.data.length > 0 : data?.data)
    ) {
      // If API returns list or single object, normalize
      const candidate = Array.isArray(data.data) ? data.data[0] : data.data;
      const customer_id =
        candidate?.id ?? candidate?.customer_id ?? candidate?.cus_id ?? null;
      if (customer_id) return { customer_id, data };
    }
  }

  // Fallback: search by phone (local digits only)
  if (phone) {
    const digits = phone.toString().replace(/\D/g, "");
    const url = `https://developersandbox-api.flutterwave.com/customers?phone=${encodeURIComponent(digits)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Trace-Id": traceHeader,
      },
    });

    const data = await res.json().catch(() => null);
    if (
      res.ok &&
      (Array.isArray(data?.data) ? data.data.length > 0 : data?.data)
    ) {
      const candidate = Array.isArray(data.data) ? data.data[0] : data.data;
      const customer_id =
        candidate?.id ?? candidate?.customer_id ?? candidate?.cus_id ?? null;
      if (customer_id) return { customer_id, data };
    }
  }

  return null;
}
