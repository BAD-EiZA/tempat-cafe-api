import { ConfigService } from '@nestjs/config';
export declare class MidtransService {
    private readonly config;
    constructor(config: ConfigService);
    get isEnabled(): boolean;
    get clientKey(): string;
    private get serverKey();
    private get baseUrl();
    private get apiBase();
    private authHeader;
    createSnapToken(input: {
        orderId: string;
        amount: number;
        customerName: string;
        customerEmail?: string;
        customerPhone?: string;
        itemDetails?: {
            id: string;
            name: string;
            price: number;
            quantity: number;
        }[];
    }): Promise<{
        token: string;
        redirect_url: string;
    }>;
    getStatus(orderId: string): Promise<Record<string, any>>;
    refund(orderId: string, amount: number, reason?: string): Promise<any>;
    verifySignature(payload: Record<string, any>): boolean;
}
