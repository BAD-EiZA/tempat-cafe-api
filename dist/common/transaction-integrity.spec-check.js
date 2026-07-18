"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const transaction_integrity_1 = require("./transaction-integrity");
strict_1.default.equal((0, transaction_integrity_1.checkoutInputError)({ items: [] }), 'At least one item required');
strict_1.default.equal((0, transaction_integrity_1.checkoutInputError)({ items: [{ quantity: 1.5 }] }), 'Item quantity must be a positive integer');
strict_1.default.equal((0, transaction_integrity_1.checkoutInputError)({ items: [{ quantity: 1 }], tipAmount: -1 }), 'Tip must be a non-negative integer');
strict_1.default.equal((0, transaction_integrity_1.checkoutInputError)({ items: [{ quantity: 1 }], type: 'UNKNOWN' }), 'Invalid order type');
strict_1.default.equal((0, transaction_integrity_1.checkoutInputError)({ items: [{ quantity: 1 }], tipAmount: 0, type: 'TAKEAWAY_POS' }), null);
strict_1.default.equal((0, transaction_integrity_1.isValidRefundAmount)(1), true);
strict_1.default.equal((0, transaction_integrity_1.isValidRefundAmount)(0), false);
strict_1.default.equal((0, transaction_integrity_1.isValidRefundAmount)(1.5), false);
strict_1.default.equal((0, transaction_integrity_1.canTransitionKitchenTicket)('QUEUED', 'PREPARING'), true);
strict_1.default.equal((0, transaction_integrity_1.canTransitionKitchenTicket)('READY', 'PREPARING'), false);
console.log('transaction integrity checks passed');
//# sourceMappingURL=transaction-integrity.spec-check.js.map