"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { OrderInput, OrderResult } from '../../types/order';

const PRODUCTS = [
  { id: 'prod-001', name: 'Widget Basic', price: 19.99 },
  { id: 'prod-002', name: 'Gadget Pro', price: 49.99 },
  { id: 'prod-003', name: 'Accessory', price: 9.99 },
  { id: 'prod-004', name: 'Bundle Pack', price: 5.0 },
  { id: 'prod-005', name: 'Premium Device', price: 99.0 }
];

function StatusBadge({ status }: { status?: string | null }) {
  const map: Record<string, string> = {
    RUNNING: 'bg-amber-100 text-amber-800 ring-1 ring-amber-300',
    COMPLETED: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300',
    FAILED: 'bg-rose-100 text-rose-800 ring-1 ring-rose-300',
    TERMINATED: 'bg-gray-200 text-gray-800 ring-1 ring-gray-300',
    CANCELED: 'bg-gray-200 text-gray-800 ring-1 ring-gray-300',
    TIMED_OUT: 'bg-gray-200 text-gray-800 ring-1 ring-gray-300'
  };
  const cls = status ? map[status] || 'bg-blue-100 text-blue-800 ring-1 ring-blue-300' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-300';
  return <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${cls}`}>{status || 'Pending'}</span>;
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function OrderPage() {
  const [form, setForm] = useState<OrderInput>({ productId: PRODUCTS[0].id, quantity: 1, customerId: '', customerAddress: '' });
  const [submitting, setSubmitting] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = useMemo(() => PRODUCTS.find(p => p.id === form.productId), [form.productId]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    setStatus(null);
    try {
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Failed to start order');
      const data = await res.json();
      setWorkflowId(data.workflowId);
    } catch (e: any) {
      setError(e.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  useEffect(() => {
    if (!workflowId) return;
    let timer: any;
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${workflowId}`);
        const data = await res.json();
        if (res.ok) {
          setStatus(data.status);
          if (data.result) setResult(data.result);
          if (['COMPLETED', 'FAILED', 'TERMINATED', 'CANCELED', 'TIMED_OUT'].includes(data.status)) {
            clearInterval(timer);
          }
        } else {
          setError(data.error || 'Failed to fetch status');
        }
      } catch (e: any) {
        setError(e.message || 'Network error');
      }
    };
    poll();
    timer = setInterval(poll, 2500);
    return () => clearInterval(timer);
  }, [workflowId]);

  const isTerminal = ['COMPLETED', 'FAILED', 'TERMINATED', 'CANCELED', 'TIMED_OUT'].includes(String(status));

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50">
      <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Process Manager</h1>
            <p className="text-indigo-100 text-sm">Temporal + Next.js Order Processing</p>
          </div>
          <a href="http://localhost:8080" target="_blank" className="hidden sm:inline-flex text-xs bg-white/10 hover:bg-white/20 transition rounded px-3 py-1">Temporal UI</a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {status === 'FAILED' && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 flex items-center gap-2">
            <XIcon />
            <span>Payment randomly fails for demo. Try again or change quantity.</span>
          </div>
        )}
        {status === 'COMPLETED' && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 flex items-center gap-2">
            <CheckIcon />
            <span>Order completed successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow border border-slate-200 p-5">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Create Order</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm text-slate-700">
                <span className="block mb-1">Product</span>
                <div className="relative">
                  <select name="productId" value={form.productId} onChange={onChange} className="w-full rounded-lg border-slate-300 pr-10 py-3 pl-3 appearance-none bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} {typeof p.price === 'number' ? `(₹${p.price})` : ''}</option>
                  ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
                </div>
              </label>
              <label className="text-sm text-slate-700">
                <span className="block mb-1">Quantity</span>
                <input type="number" name="quantity" min={1} value={form.quantity} onChange={onChange} className="w-full rounded-lg border-slate-300 py-3 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </label>
              <label className="text-sm text-slate-700 sm:col-span-2">
                <span className="block mb-1">Customer ID</span>
                <input name="customerId" value={form.customerId} onChange={onChange} placeholder="cust-123" className="w-full rounded-lg border-slate-300 py-3 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </label>
              <label className="text-sm text-slate-700 sm:col-span-2">
                <span className="block mb-1">Customer Address</span>
                <textarea name="customerAddress" value={form.customerAddress} onChange={onChange} rows={3} placeholder="123 Main St, City, Country" className="w-full rounded-lg border-slate-300 py-3 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </label>
            </div>
            <button onClick={submit} disabled={submitting} className="mt-4 inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Order'
              )}
            </button>
            {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
          </div>

          <div className="bg-white rounded-xl shadow border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-slate-900">Status</h2>
              <StatusBadge status={status} />
            </div>
            <div className="text-sm text-slate-700">
              <div className="mb-2"><span className="text-slate-500">Workflow ID:</span> {workflowId || '—'}</div>
              <div className="mb-2"><span className="text-slate-500">Selected:</span> {selectedProduct?.name} × {form.quantity}</div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Progress</h3>
              <ol className="space-y-2">
                <li className={`p-3 rounded-md border ${result?.inventory ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium inline-flex items-center gap-2">
                      {result?.inventory ? <CheckIcon className="w-4 h-4 text-emerald-600" /> : <ClockIcon className="w-4 h-4 text-slate-500" />}
                      Inventory Check
                    </span>
                    <span className={`text-xs ${result?.inventory ? 'text-emerald-700' : 'text-slate-500'}`}>{result?.inventory ? 'Done' : 'Pending'}</span>
                  </div>
                  {result?.inventory && (
                    <div className="text-sm text-slate-700 mt-1">
                      available={String(result.inventory.available)} reserved={result.inventory.reservedQuantity} unitPrice=₹{result.inventory.unitPrice}
                    </div>
                  )}
                </li>
                <li className={`p-3 rounded-md border ${result?.payment ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium inline-flex items-center gap-2">
                      {result?.payment ? <CheckIcon className="w-4 h-4 text-emerald-600" /> : <ClockIcon className="w-4 h-4 text-slate-500" />}
                      Payment
                    </span>
                    <span className={`text-xs ${result?.payment ? 'text-emerald-700' : 'text-slate-500'}`}>{result?.payment ? 'Done' : 'Pending'}</span>
                  </div>
                  {result?.payment && (
                    <div className="text-sm text-slate-700 mt-1">
                      success={String(result.payment.paymentSuccessful)} txn={result.payment.transactionId} total=₹{result.payment.totalAmount}
                    </div>
                  )}
                </li>
                <li className={`p-3 rounded-md border ${result?.shipping ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium inline-flex items-center gap-2">
                      {result?.shipping ? <CheckIcon className="w-4 h-4 text-emerald-600" /> : <ClockIcon className="w-4 h-4 text-slate-500" />}
                      Shipping
                    </span>
                    <span className={`text-xs ${result?.shipping ? 'text-emerald-700' : 'text-slate-500'}`}>{result?.shipping ? 'Done' : 'Pending'}</span>
                  </div>
                  {result?.shipping && (
                    <div className="text-sm text-slate-700 mt-1">
                      cost=₹{result.shipping.shippingCost} eta={result.shipping.estimatedDelivery} final=₹{result.shipping.finalTotal}
                    </div>
                  )}
                </li>
              </ol>
            </div>

            {isTerminal && result?.shipping && (
              <div className="mt-5 p-4 rounded-lg border border-indigo-200 bg-indigo-50">
                <div className="text-slate-800 font-medium mb-1">Final Total</div>
                <div className="text-2xl font-semibold text-indigo-700">₹{result.shipping.finalTotal}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


