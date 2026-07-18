"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
let PricingService = class PricingService {
    calculate(input) {
        const lines = input.lines.map((l) => {
            const modSum = (l.modifiers || []).reduce((s, m) => s + m.priceDelta, 0);
            const unitPrice = l.unitPrice + modSum;
            return {
                name: l.name,
                quantity: l.quantity,
                unitPrice,
                lineTotal: unitPrice * l.quantity,
                modifiers: l.modifiers || [],
                notes: l.notes,
                menuItemId: l.menuItemId,
                stationId: l.stationId,
            };
        });
        const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
        const itemDiscount = Math.min(input.itemDiscount || 0, subtotal);
        const afterItem = subtotal - itemDiscount;
        const orderDiscount = Math.min(input.orderDiscount || 0, afterItem);
        const taxable = Math.max(0, afterItem - orderDiscount);
        const taxBps = input.taxBps || 0;
        const serviceChargeBps = input.serviceChargeBps || 0;
        const taxTotal = Math.floor((taxable * taxBps) / 10_000);
        const serviceChargeTotal = Math.floor((taxable * serviceChargeBps) / 10_000);
        const tipTotal = Math.max(0, input.tipAmount || 0);
        const grandTotal = taxable + taxTotal + serviceChargeTotal + tipTotal;
        const components = [
            { type: 'SUBTOTAL', label: 'Subtotal', amount: subtotal },
        ];
        if (itemDiscount)
            components.push({ type: 'ITEM_DISCOUNT', label: 'Diskon item', amount: -itemDiscount });
        if (orderDiscount)
            components.push({ type: 'ORDER_DISCOUNT', label: 'Diskon order', amount: -orderDiscount });
        if (taxTotal)
            components.push({ type: 'TAX', label: 'Pajak', amount: taxTotal, meta: { bps: taxBps } });
        if (serviceChargeTotal)
            components.push({
                type: 'SERVICE_CHARGE',
                label: 'Service charge',
                amount: serviceChargeTotal,
                meta: { bps: serviceChargeBps },
            });
        if (tipTotal)
            components.push({ type: 'TIP', label: 'Tip', amount: tipTotal });
        components.push({ type: 'GRAND_TOTAL', label: 'Total', amount: grandTotal });
        return {
            lines,
            subtotal,
            itemDiscount,
            orderDiscount,
            taxTotal,
            serviceChargeTotal,
            tipTotal,
            grandTotal,
            components,
        };
    }
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)()
], PricingService);
//# sourceMappingURL=pricing.service.js.map