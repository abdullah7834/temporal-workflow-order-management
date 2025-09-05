import { randomUUID } from 'node:crypto';

export type CheckInventoryInput = { productId: string; quantity: number };
export type CheckInventoryOutput = {
  available: boolean;
  reservedQuantity: number;
  unitPrice: number;
};

const INVENTORY: Record<string, { stock: number; price: number }> = {
  'prod-001': { stock: 50, price: 19.99 },
  'prod-002': { stock: 10, price: 49.99 },
  'prod-003': { stock: 0, price: 9.99 },
  'prod-004': { stock: 100, price: 5.0 },
  'prod-005': { stock: 25, price: 99.0 }
};

export async function checkInventoryActivity(input: CheckInventoryInput): Promise<CheckInventoryOutput> {
  const product = INVENTORY[input.productId];
  if (!product) {
    return { available: false, reservedQuantity: 0, unitPrice: 0 };
  }
  const reserved = Math.min(product.stock, input.quantity);
  const available = reserved === input.quantity && reserved > 0;
  // simulate reservation by decrementing (ephemeral for demo)
  INVENTORY[input.productId].stock -= reserved;
  return { available, reservedQuantity: reserved, unitPrice: product.price };
}


