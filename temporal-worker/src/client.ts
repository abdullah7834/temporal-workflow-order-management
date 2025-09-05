import { Client } from '@temporalio/client';
import { ProcessOrderWorkflow, ProcessOrderInput } from './workflows/processOrder';

export async function startOrder(input: ProcessOrderInput) {
  const client = new Client();
  const handle = await client.workflow.start(ProcessOrderWorkflow, {
    taskQueue: 'order-task-queue',
    workflowId: `order-${Date.now()}`,
    args: [input]
  });
  return handle.workflowId;
}

export async function getOrderResult(workflowId: string) {
  const client = new Client();
  const handle = client.workflow.getHandle(workflowId);
  const result = await handle.result();
  return result;
}

export async function getOrderStatus(workflowId: string) {
  const client = new Client();
  const handle = client.workflow.getHandle(workflowId);
  const desc = await handle.describe();
  return desc;
}


