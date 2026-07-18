"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pricing_service_1 = require("./pricing.service");
const pricing = new pricing_service_1.PricingService();
function assert(cond, msg) {
    if (!cond)
        throw new Error(msg);
}
const r = pricing.calculate({
    lines: [
        { name: 'Latte', unitPrice: 30000, quantity: 2, modifiers: [{ name: 'Oat', priceDelta: 5000 }] },
    ],
    taxBps: 1100,
    serviceChargeBps: 500,
    tipAmount: 2000,
    orderDiscount: 10000,
});
assert(r.subtotal === 70000, `subtotal ${r.subtotal}`);
assert(r.grandTotal > 0, 'grandTotal');
assert(Number.isInteger(r.grandTotal), 'integer IDR');
assert(r.tipTotal === 2000, `tip ${r.tipTotal}`);
console.log('pricing self-check OK', r.grandTotal);
//# sourceMappingURL=pricing.service.spec-check.js.map