import { Injectable } from '@nestjs/common';

export type LineInput = {
  name: string;
  unitPrice: number;
  quantity: number;
  modifiers?: { name: string; priceDelta: number }[];
  notes?: string;
  menuItemId?: string;
  stationId?: string;
};

export type PriceResult = {
  lines: {
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    modifiers: { name: string; priceDelta: number }[];
    notes?: string;
    menuItemId?: string;
    stationId?: string;
  }[];
  subtotal: number;
  itemDiscount: number;
  orderDiscount: number;
  taxTotal: number;
  serviceChargeTotal: number;
  tipTotal: number;
  grandTotal: number;
  components: { type: string; label: string; amount: number; meta?: object }[];
};

@Injectable()
export class PricingService {
  /**
   * Order: subtotal → item disc → order disc → tax on (subtotal - discs) → service charge → tip
   * Monetary values are integer IDR.
   */
  calculate(input: {
    lines: LineInput[];
    taxBps?: number;
    serviceChargeBps?: number;
    tipAmount?: number;
    orderDiscount?: number;
    itemDiscount?: number;
  }): PriceResult {
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

    const components: PriceResult['components'] = [
      { type: 'SUBTOTAL', label: 'Subtotal', amount: subtotal },
    ];
    if (itemDiscount) components.push({ type: 'ITEM_DISCOUNT', label: 'Diskon item', amount: -itemDiscount });
    if (orderDiscount) components.push({ type: 'ORDER_DISCOUNT', label: 'Diskon order', amount: -orderDiscount });
    if (taxTotal) components.push({ type: 'TAX', label: 'Pajak', amount: taxTotal, meta: { bps: taxBps } });
    if (serviceChargeTotal)
      components.push({
        type: 'SERVICE_CHARGE',
        label: 'Service charge',
        amount: serviceChargeTotal,
        meta: { bps: serviceChargeBps },
      });
    if (tipTotal) components.push({ type: 'TIP', label: 'Tip', amount: tipTotal });
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
}
