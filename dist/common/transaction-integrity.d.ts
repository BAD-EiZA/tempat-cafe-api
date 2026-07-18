import { KitchenTicketStatus } from '@prisma/client';
export declare function checkoutInputError(dto: {
    items?: {
        quantity: number;
    }[];
    tipAmount?: number;
    type?: string;
}): "At least one item required" | "Item quantity must be a positive integer" | "Tip must be a non-negative integer" | "Invalid order type" | null;
export declare function isValidRefundAmount(amount: number): boolean;
export declare function canTransitionKitchenTicket(from: KitchenTicketStatus, to: KitchenTicketStatus): boolean;
