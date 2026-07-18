"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentAmountMatches = paymentAmountMatches;
exports.isValidPayoutAmount = isValidPayoutAmount;
function paymentAmountMatches(grossAmount, expected) {
    const gross = Number(grossAmount);
    return Number.isFinite(gross) && gross === expected;
}
function isValidPayoutAmount(amount) {
    return Number.isInteger(amount) && amount > 0;
}
//# sourceMappingURL=transaction-security.js.map