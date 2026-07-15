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

export default function OrdersPage() {
  const { data: orders, loading, service } = useCollection('orders', { orderByField: 'createdAt' });

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
              <tr className="text-left text-muted border-b border-border">
                <th className="font-medium px-4 py-3">Customer</th>
                <th className="font-medium px-4 py-3">Items</th>
                <th className="font-medium px-4 py-3">Total</th>
                <th className="font-medium px-4 py-3">Placed</th>
                <th className="font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50 align-top">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{o.customerName}</p>
                    <p className="text-xs text-muted">{o.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {(o.items || []).map((item) => (
                      <div key={item.productId}>{item.qty}× {item.name}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3 font-mono text-amber">${Number(o.total ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted">
                    {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '—'}
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
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
