import { proxyActivities, defineSignal, setHandler } from '@temporalio/workflow';
import type { CheckInventoryInput, CheckInventoryOutput } from '../activities/inventory';
import type { ProcessPaymentInput, ProcessPaymentOutput } from '../activities/payment';
import type { CalculateShippingInput, CalculateShippingOutput } from '../activities/shipping';

const { checkInventoryActivity } = proxyActivities<{
  checkInventoryActivity(input: CheckInventoryInput): Promise<CheckInventoryOutput>;
}>({ taskQueue: 'order-task-queue', startToCloseTimeout: '10 seconds', retry: { maximumAttempts: 3 } });

const { processPaymentActivity } = proxyActivities<{
  processPaymentActivity(input: ProcessPaymentInput): Promise<ProcessPaymentOutput>;
}>({ taskQueue: 'order-task-queue', startToCloseTimeout: '15 seconds', retry: { maximumAttempts: 3 } });

const { calculateShippingActivity } = proxyActivities<{
  calculateShippingActivity(input: CalculateShippingInput): Promise<CalculateShippingOutput>;
}>({ taskQueue: 'order-task-queue', startToCloseTimeout: '10 seconds', retry: { maximumAttempts: 3 } });

export interface ProcessOrderInput {
  productId: string;
  quantity: number;
  customerId: string;
  customerAddress: string;
}

export interface ProcessOrderResult {
  inventory: CheckInventoryOutput;
  payment?: ProcessPaymentOutput;
  shipping?: CalculateShippingOutput;
  errorMessage?: string;
}

export async function ProcessOrderWorkflow(input: ProcessOrderInput): Promise<ProcessOrderResult> {
  const result: ProcessOrderResult = { inventory: { available: false, reservedQuantity: 0, unitPrice: 0 } };
  const inventory = await checkInventoryActivity({ productId: input.productId, quantity: input.quantity });
  result.inventory = inventory;
  if (!inventory.available || inventory.reservedQuantity <= 0) {
    return result;
  }
  try {
    const payment = await processPaymentActivity({ reservedQuantity: inventory.reservedQuantity, unitPrice: inventory.unitPrice, customerId: input.customerId });
    result.payment = payment;
    const shipping = await calculateShippingActivity({ reservedQuantity: inventory.reservedQuantity, totalAmount: payment.totalAmount, customerAddress: input.customerAddress });
    result.shipping = shipping;
  } catch (err: any) {
    result.errorMessage = err?.message || 'Payment or shipping failed';
    return result;
  }
  return result;
}


