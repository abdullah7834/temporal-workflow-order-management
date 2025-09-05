import { NextRequest, NextResponse } from 'next/server';
import { getTemporalClient } from '@/lib/temporal';
import type { OrderInput } from '@/types/order';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OrderInput;
    const client = await getTemporalClient();
    const handle = await client.workflow.start('ProcessOrderWorkflow' as any, {
      taskQueue: 'order-task-queue',
      workflowId: `order-${Date.now()}`,
      args: [body]
    });
    return NextResponse.json({ workflowId: handle.workflowId }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to start workflow' }, { status: 500 });
  }
}


