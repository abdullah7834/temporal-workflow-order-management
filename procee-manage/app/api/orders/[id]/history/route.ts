import { NextRequest, NextResponse } from 'next/server';
import { getTemporalClient } from '@/lib/temporal';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: workflowId } = await ctx.params;
  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);
    const iter = handle.fetchHistory();
    const history: any[] = [];
    for await (const page of iter) {
      for (const e of page.events) {
        history.push({ time: e.eventTime, event: e.eventType?.name, data: e.attributes });
      }
    }
    return NextResponse.json({ workflowId, history });
  } catch (err: any) {
    console.error(`GET /api/orders/${workflowId}/history error:`, err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch history' }, { status: 500 });
  }
}


