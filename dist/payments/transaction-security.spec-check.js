"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const transaction_security_1 = require("./transaction-security");
strict_1.default.equal((0, transaction_security_1.paymentAmountMatches)('10000.00', 10_000), true);
strict_1.default.equal((0, transaction_security_1.paymentAmountMatches)('9999.00', 10_000), false);
strict_1.default.equal((0, transaction_security_1.paymentAmountMatches)(undefined, 10_000), false);
strict_1.default.equal((0, transaction_security_1.isValidPayoutAmount)(1), true);
strict_1.default.equal((0, transaction_security_1.isValidPayoutAmount)(0), false);
strict_1.default.equal((0, transaction_security_1.isValidPayoutAmount)(1.5), false);
console.log('transaction security checks passed');
//# sourceMappingURL=transaction-security.spec-check.js.map