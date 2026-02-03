const CACHE_KEY = 'flw_token';

export class PaymentService {
  private baseUrl: string;
  private publicKey: string;
  private secretKey: string;

  constructor() {
    this.baseUrl = process.env.PAYMENTS_API_BASE_URL!;
    this.publicKey = process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY!;
    this.secretKey = process.env.FLW_SECRET_KEY!;
  }

  async getToken(): Promise<string> {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { token, expires } = JSON.parse(cached);
      if (expires > Date.now()) return token;
    }

    const res = await fetch(`${this.baseUrl}/flutterwave/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_key: this.publicKey,
        secret_key: this.secretKey
      })
    });

    if (!res.ok) throw new Error('Failed to get token');

    const data = await res.json();
    const token = data.token;

    // Cache token with 23 hour expiry (tokens last 24 hours)
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      token,
      expires: Date.now() + 23 * 60 * 60 * 1000
    }));

    return token;
  }

  async createCustomer(params: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) {
    const token = await this.getToken();
    const res = await fetch(`${this.baseUrl}/flutterwave/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });

    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  }

  async tokenizeCard(params: {
    customerId: string;
    cardNumber: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
  }) {
    const token = await this.getToken();
    // Generate a 12 digit number for nonce
    const nonce = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');

    const res = await fetch(`${this.baseUrl}/flutterwave/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...params,
        nonce
      })
    });

    if (!res.ok) throw new Error('Failed to tokenize card');
    return res.json();
  }

  async chargeCard(params: {
    customerId: string;
    paymentMethodId: string;
    amount: number;
    reference: string;
  }) {
    const token = await this.getToken();
    const res = await fetch(`${this.baseUrl}/flutterwave/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...params,
        currency: 'NGN',
        meta: {
          orderId: params.reference
        }
      })
    });

    if (!res.ok) throw new Error('Failed to charge card');
    return res.json();
  }
}

export const paymentService = new PaymentService();