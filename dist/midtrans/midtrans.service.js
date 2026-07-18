"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidtransService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
let MidtransService = class MidtransService {
    constructor(config) {
        this.config = config;
    }
    get isEnabled() {
        return this.config.get('MIDTRANS_ENABLED') === 'true' && !!this.config.get('MIDTRANS_SERVER_KEY');
    }
    get clientKey() {
        return this.config.get('MIDTRANS_CLIENT_KEY') || '';
    }
    get serverKey() {
        return this.config.get('MIDTRANS_SERVER_KEY') || '';
    }
    get baseUrl() {
        return this.config.get('MIDTRANS_IS_PRODUCTION') === 'true'
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }
    get apiBase() {
        return this.config.get('MIDTRANS_IS_PRODUCTION') === 'true'
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';
    }
    authHeader() {
        return 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64');
    }
    async createSnapToken(input) {
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
        return res.json();
    }
    async getStatus(orderId) {
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
        return res.json();
    }
    async refund(orderId, amount, reason) {
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
    verifySignature(payload) {
        const orderId = payload.order_id || '';
        const statusCode = payload.status_code || '';
        const grossAmount = payload.gross_amount || '';
        const signature = payload.signature_key || '';
        const expected = (0, crypto_1.createHash)('sha512')
            .update(`${orderId}${statusCode}${grossAmount}${this.serverKey}`)
            .digest('hex');
        return expected === signature;
    }
};
exports.MidtransService = MidtransService;
exports.MidtransService = MidtransService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MidtransService);
//# sourceMappingURL=midtrans.service.js.map