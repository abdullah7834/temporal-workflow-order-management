import { randomUUID } from 'node:crypto';

export type ProcessPaymentInput = {
  reservedQuantity: number;
  unitPrice: number;
  customerId: string;
};

export type ProcessPaymentOutput = {
  paymentSuccessful: boolean;
  transactionId: string;
  totalAmount: number;
};

export async function processPaymentActivity(input: ProcessPaymentInput): Promise<ProcessPaymentOutput> {
  const totalAmount = Number((input.reservedQuantity * input.unitPrice).toFixed(2));
  // Simulate payment: 80% success
  const paymentSuccessful = Math.random() < 0.8;
  const transactionId = randomUUID();
  if (!paymentSuccessful) {
    // Throw to trigger workflow retry policy
    throw new Error('Payment processing failed');
  }
  return { paymentSuccessful, transactionId, totalAmount };
}


