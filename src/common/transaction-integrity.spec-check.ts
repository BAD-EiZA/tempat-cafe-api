import assert from 'node:assert/strict';
import {
  canTransitionKitchenTicket,
  checkoutInputError,
  isValidRefundAmount,
} from './transaction-integrity';

assert.equal(checkoutInputError({ items: [] }), 'At least one item required');
assert.equal(checkoutInputError({ items: [{ quantity: 1.5 }] }), 'Item quantity must be a positive integer');
assert.equal(checkoutInputError({ items: [{ quantity: 1 }], tipAmount: -1 }), 'Tip must be a non-negative integer');
assert.equal(checkoutInputError({ items: [{ quantity: 1 }], type: 'UNKNOWN' }), 'Invalid order type');
assert.equal(checkoutInputError({ items: [{ quantity: 1 }], tipAmount: 0, type: 'TAKEAWAY_POS' }), null);
assert.equal(isValidRefundAmount(1), true);
assert.equal(isValidRefundAmount(0), false);
assert.equal(isValidRefundAmount(1.5), false);
assert.equal(canTransitionKitchenTicket('QUEUED', 'PREPARING'), true);
assert.equal(canTransitionKitchenTicket('READY', 'PREPARING'), false);

console.log('transaction integrity checks passed');
