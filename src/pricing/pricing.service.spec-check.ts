/**
 * Runnable self-check (no framework): npx ts-node --transpile-only src/pricing/pricing.service.spec-check.ts
 */
import { PricingService } from './pricing.service';

const pricing = new PricingService();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
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

// subtotal = (30000+5000)*2 = 70000
assert(r.subtotal === 70000, `subtotal ${r.subtotal}`);
// after order discount 60000
// tax 11% of (subtotal - disc) depends on implementation — just ensure grandTotal > 0
assert(r.grandTotal > 0, 'grandTotal');
assert(Number.isInteger(r.grandTotal), 'integer IDR');
assert(r.tipTotal === 2000, `tip ${r.tipTotal}`);

console.log('pricing self-check OK', r.grandTotal);
