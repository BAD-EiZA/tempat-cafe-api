import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

@Injectable()
export class MidtransService {
  constructor(private readonly config: ConfigService) {}

  get isEnabled() {
    return this.config.get('MIDTRANS_ENABLED') === 'true' && !!this.config.get('MIDTRANS_SERVER_KEY');
  }

  get clientKey() {
    return this.config.get<string>('MIDTRANS_CLIENT_KEY') || '';
  }

  private get serverKey() {
    return this.config.get<string>('MIDTRANS_SERVER_KEY') || '';
  }

  private get baseUrl() {
    return this.config.get('MIDTRANS_IS_PRODUCTION') === 'true'
      ? 'https://app.midtrans.com'
      : 'https://app.sandbox.midtrans.com';
  }

  private get apiBase() {
    return this.config.get('MIDTRANS_IS_PRODUCTION') === 'true'
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com';
  }

  private authHeader() {
    return 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64');
  }

  async createSnapToken(input: {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    itemDetails?: { id: string; name: string; price: number; quantity: number }[];
  }) {
    const res = await fetch(`${this.baseUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: this.authHeader(),
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: input.orderId,
          gross_amount: input.amount,
        },
        customer_details: {
          first_name: input.customerName,
          email: input.customerEmail,
          phone: input.customerPhone,
        },
        item_details: input.itemDetails,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Midtrans Snap error: ${res.status} ${text}`);
    }
    return res.json() as Promise<{ token: string; redirect_url: string }>;
  }

  async getStatus(orderId: string) {
    const res = await fetch(`${this.apiBase}/v2/${orderId}/status`, {
      headers: {
        Accept: 'application/json',
        Authorization: this.authHeader(),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Midtrans status error: ${res.status} ${text}`);
    }
    return res.json() as Promise<Record<string, any>>;
  }

  async refund(orderId: string, amount: number, reason?: string) {
    const res = await fetch(`${this.apiBase}/v2/${orderId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: this.authHeader(),
      },
      body: JSON.stringify({ amount, reason }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Midtrans refund error: ${res.status} ${text}`);
    }
    return res.json();
  }

  verifySignature(payload: Record<string, any>) {
    const orderId = payload.order_id || '';
    const statusCode = payload.status_code || '';
    const grossAmount = payload.gross_amount || '';
    const signature = payload.signature_key || '';
    const expected = createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${this.serverKey}`)
      .digest('hex');
    return expected === signature;
  }
}
