import { NextRequest, NextResponse } from 'next/server';
import { getTemporalClient } from '@/lib/temporal';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: workflowId } = await ctx.params;
  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    const desc: any = await handle.describe();
    let status: string = desc?.workflowExecutionInfo?.status?.name || desc?.status?.name || 'UNKNOWN';
    let result: unknown | undefined;
    if (status === 'COMPLETED') {
      try {
        result = await handle.result();
      } catch (e) {
        // ignore if already completed but result fetch fails for any reason
      }
    }
    return NextResponse.json({ workflowId, status, result });
  } catch (err: any) {
    console.error(`GET /api/orders/${workflowId} error:`, err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch status' }, { status: 500 });
  }
}


