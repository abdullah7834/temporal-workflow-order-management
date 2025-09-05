import { addBusinessDays, formatISO } from 'date-fns';

export type CalculateShippingInput = {
  reservedQuantity: number;
  totalAmount: number;
  customerAddress: string;
};

export type CalculateShippingOutput = {
  shippingCost: number;
  estimatedDelivery: string;
  finalTotal: number;
};

export async function calculateShippingActivity(input: CalculateShippingInput): Promise<CalculateShippingOutput> {
  const base = 4.99;
  const perItem = 1.5;
  const distanceFactor = input.customerAddress.toLowerCase().includes('remote') ? 2 : 1;
  const shippingCost = Number((base + perItem * input.reservedQuantity * distanceFactor).toFixed(2));
  const days = 3 + Math.floor(Math.random() * 5);
  const estimatedDelivery = formatISO(addBusinessDays(new Date(), days), { representation: 'date' });
  const finalTotal = Number((input.totalAmount + shippingCost).toFixed(2));
  return { shippingCost, estimatedDelivery, finalTotal };
}


