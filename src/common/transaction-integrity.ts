import { KitchenTicketStatus, OrderType } from '@prisma/client';

const ORDER_TYPES = new Set<string>(Object.values(OrderType));
const KITCHEN_TRANSITIONS: Record<KitchenTicketStatus, KitchenTicketStatus[]> = {
  QUEUED: ['ACKNOWLEDGED', 'PREPARING', 'CANCELLED'],
  ACKNOWLEDGED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['SERVED', 'CANCELLED'],
  SERVED: [],
  CANCELLED: [],
};

export function checkoutInputError(dto: {
  items?: { quantity: number }[];
  tipAmount?: number;
  type?: string;
}) {
  if (!Array.isArray(dto.items) || dto.items.length === 0) return 'At least one item required';
  if (dto.items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
    return 'Item quantity must be a positive integer';
  }
  if (dto.tipAmount != null && (!Number.isInteger(dto.tipAmount) || dto.tipAmount < 0)) {
    return 'Tip must be a non-negative integer';
  }
  if (dto.type != null && !ORDER_TYPES.has(dto.type)) return 'Invalid order type';
  return null;
}

export function isValidRefundAmount(amount: number) {
  return Number.isInteger(amount) && amount > 0;
}

export function canTransitionKitchenTicket(from: KitchenTicketStatus, to: KitchenTicketStatus) {
  return KITCHEN_TRANSITIONS[from].includes(to);
}
