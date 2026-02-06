const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";

export async function paystackRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: any
): Promise<T> {
  console.log(`[Paystack] ${method} ${PAYSTACK_BASE_URL}${endpoint}`);
  
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseData = await response.json();
  
  if (!response.ok) {
    console.error("[Paystack Error]", {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    });
    throw new Error(responseData.message || "Paystack request failed");
  }

  console.log("[Paystack Success]", responseData);
  return responseData;
}

export function validateCardNumber(number: string): boolean {
  // Basic Luhn algorithm
  const cleaned = number.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(cleaned[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export function formatAmount(amount: number): number {
  // Convert to kobo (multiply by 100)
  return Math.round(amount * 100);
}
