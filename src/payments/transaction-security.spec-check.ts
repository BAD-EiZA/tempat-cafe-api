import assert from 'node:assert/strict';
import { isValidPayoutAmount, paymentAmountMatches } from './transaction-security';

assert.equal(paymentAmountMatches('10000.00', 10_000), true);
assert.equal(paymentAmountMatches('9999.00', 10_000), false);
assert.equal(paymentAmountMatches(undefined, 10_000), false);
assert.equal(isValidPayoutAmount(1), true);
assert.equal(isValidPayoutAmount(0), false);
assert.equal(isValidPayoutAmount(1.5), false);

console.log('transaction security checks passed');
