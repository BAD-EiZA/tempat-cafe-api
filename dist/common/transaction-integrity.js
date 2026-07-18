"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutInputError = checkoutInputError;
exports.isValidRefundAmount = isValidRefundAmount;
exports.canTransitionKitchenTicket = canTransitionKitchenTicket;
const client_1 = require("@prisma/client");
const ORDER_TYPES = new Set(Object.values(client_1.OrderType));
const KITCHEN_TRANSITIONS = {
    QUEUED: ['ACKNOWLEDGED', 'PREPARING', 'CANCELLED'],
    ACKNOWLEDGED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['SERVED', 'CANCELLED'],
    SERVED: [],
    CANCELLED: [],
};
function checkoutInputError(dto) {
    if (!Array.isArray(dto.items) || dto.items.length === 0)
        return 'At least one item required';
    if (dto.items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
        return 'Item quantity must be a positive integer';
    }
    if (dto.tipAmount != null && (!Number.isInteger(dto.tipAmount) || dto.tipAmount < 0)) {
        return 'Tip must be a non-negative integer';
    }
    if (dto.type != null && !ORDER_TYPES.has(dto.type))
        return 'Invalid order type';
    return null;
}
function isValidRefundAmount(amount) {
    return Number.isInteger(amount) && amount > 0;
}
function canTransitionKitchenTicket(from, to) {
    return KITCHEN_TRANSITIONS[from].includes(to);
}
//# sourceMappingURL=transaction-integrity.js.map