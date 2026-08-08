import { useState } from 'react';
import { PageHeader } from '../components/Layout';
import { useCollection } from '../hooks/useCollection';
import { Badge, Card, EmptyState, Select, Spinner } from '../components/ui';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_TONE = {
  pending: 'warning',
  confirmed: 'default',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'danger',
};

function calcTotal(items = []) {
  return items.reduce((sum, item) => {
    const price = Number(item?.product?.price ?? 0);
    const qty = Number(item?.quantity ?? 0);
    return sum + price * qty;
  }, 0);
}

// Turns a variant map ({ model, width, depth, height, availability })
// into a readable string. Returns null if there's nothing to show.
function formatVariant(variant) {
  if (!variant) return null;
  const parts = [];
  if (variant.model) parts.push(`Model ${variant.model}`);
  if (variant.width && variant.depth && variant.height) {
    parts.push(`${variant.width}×${variant.depth}×${variant.height}mm`);
  }
  return parts.length ? parts.join(' · ') : null;
}

export default function OrdersPage() {
  const { data: orders, loading, service } = useCollection('orders', { orderByField: 'createdAt' });
  const [selected, setSelected] = useState(null);

  const sorted = [...orders].sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta; // newest first
  });

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${orders.length} order${orders.length === 1 ? '' : 's'} placed`}
      />

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : sorted.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders placed on the storefront will show up here." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border bg-surface-alt/40">
                <th className="font-medium px-4 py-3">Product</th>
                <th className="font-medium px-4 py-3 text-right">Total</th>
                <th className="font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => {
                const items = o.items || [];
                const firstItem = items[0];

                return (
                  <tr
                    key={o.id}
                    className="border-b border-border last:border-0 hover:bg-surface-alt/50"
                  >
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => setSelected(o)}
                    >
                      <div className="flex items-center gap-3">
                        {firstItem?.product?.imageUrl ? (
                          <img
                            src={firstItem.product.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg border border-border bg-surface-alt shrink-0" />
                        )}
                        <span className="text-white truncate max-w-[240px]">
                          {firstItem?.product?.name ?? '—'}
                          {items.length > 1 && (
                            <span className="text-muted"> +{items.length - 1} more</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-right text-white font-mono cursor-pointer"
                      onClick={() => setSelected(o)}
                    >
                      {o.totalUnits ?? 0} unit{Number(o.totalUnits) === 1 ? '' : 's'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge tone={STATUS_TONE[o.status] ?? 'default'}>{o.status}</Badge>
                        <Select
                          value={o.status}
                          onChange={(e) => service.update(o.id, { status: e.target.value })}
                          className="!w-auto !py-1 !px-2 text-xs"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {selected && (
        <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function OrderDetailModal({ order, onClose }) {
  const items = order.items || [];
  const priceTotal = calcTotal(items);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-white font-semibold">{order.ownerName || 'Unknown'}</p>
            <p className="text-xs text-muted">{order.shopName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-white text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-border text-sm">
          <div>
            <p className="text-xs uppercase text-muted mb-1">Contact</p>
            <p className="text-white">{order.phone || '—'}</p>
            <p className="text-muted">{order.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted mb-1">Address</p>
            <p className="text-white">{order.address || '—'}</p>
            <p className="text-muted">{order.city}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted mb-1">Placed</p>
            <p className="text-white">
              {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted mb-1">Status</p>
            <Badge tone={STATUS_TONE[order.status] ?? 'default'}>{order.status}</Badge>
          </div>
          {order.taxId && (
            <div>
              <p className="text-xs uppercase text-muted mb-1">Tax ID</p>
              <p className="text-white">{order.taxId}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="px-6 py-4 flex flex-col gap-3">
          <p className="text-xs uppercase text-muted">Items</p>
          {items.map((item, idx) => {
            const variantText = formatVariant(item.variant);
            return (
              <div key={`${item.product?.id ?? idx}-${idx}`} className="flex items-center gap-3">
                {item.product?.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg border border-border bg-surface-alt shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{item.product?.name}</p>
                  <p className="text-xs text-muted truncate">
                    {item.categoryName}
                    {variantText && ` · ${variantText}`}
                    {!variantText && item.product?.finish && ` · Finish: ${item.product.finish}`}
                    {!variantText && item.product?.size && ` · Size: ${item.product.size}`}
                  </p>
                </div>
                <div className="text-sm text-muted shrink-0">× {item.quantity}</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted">Total units: {order.totalUnits ?? '—'}</span>
          {order.note && <span className="text-muted italic">Note: {order.note}</span>}
          {priceTotal > 0 && (
            <span className="text-white font-semibold">${priceTotal.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}