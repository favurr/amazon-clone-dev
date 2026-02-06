export interface CardDetails {
  number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
}

export interface CustomerDetails {
  email: string;
  address: string;
}

export interface PaymentMetadata {
  custom_fields: Array<{
    display_name: string;
    variable_name: string;
    value: string;
  }>;
  // Add any other metadata you need
  order_id?: string;
  product_name?: string;
  customer_name?: string;
}

export type ChargeStatus =
  | "success"
  | "send_otp"
  | "send_pin"
  | "send_birthday"
  | "open_url"
  | "pending"
  | "failed";

export interface ChargeResponse {
  status: boolean;
  message: string;
  data: {
    status: ChargeStatus;
    reference: string;
    amount: number;
    display_text?: string;
    url?: string; // For 3D Secure
    gateway_response?: string; // Paystack gateway response
    message?: string; // Transaction message
    authorization?: {
      authorization_code: string;
    };
  };
}

export interface ModalState {
  type: "pin" | "otp" | "birthday" | null;
  isOpen: boolean;
  displayText?: string;
  reference?: string;
}
