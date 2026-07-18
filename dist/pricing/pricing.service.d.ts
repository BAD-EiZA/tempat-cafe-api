export type LineInput = {
    name: string;
    unitPrice: number;
    quantity: number;
    modifiers?: {
        name: string;
        priceDelta: number;
    }[];
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
        modifiers: {
            name: string;
            priceDelta: number;
        }[];
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
    components: {
        type: string;
        label: string;
        amount: number;
        meta?: object;
    }[];
};
export declare class PricingService {
    calculate(input: {
        lines: LineInput[];
        taxBps?: number;
        serviceChargeBps?: number;
        tipAmount?: number;
        orderDiscount?: number;
        itemDiscount?: number;
    }): PriceResult;
}
