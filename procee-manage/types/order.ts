export type OrderInput = {
  productId: string;
  quantity: number;
  customerId: string;
  customerAddress: string;
};

export type InventoryResult = {
  available: boolean;
  reservedQuantity: number;
  unitPrice: number;
};

export type PaymentResult = {
  paymentSuccessful: boolean;
  transactionId: string;
  totalAmount: number;
};

export type ShippingResult = {
  shippingCost: number;
  estimatedDelivery: string;
  finalTotal: number;
};

export type OrderResult = {
  inventory: InventoryResult;
  payment?: PaymentResult;
  shipping?: ShippingResult;
};

export type OrderStatusResponse = {
  workflowId: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'TERMINATED' | 'CANCELED' | 'TIMED_OUT' | 'UNKNOWN';
  result?: OrderResult;
  errorMessage?: string;
  history?: Array<{ time: string; event: string; data?: unknown }>;
};


