import { useMemo } from 'react';
import { PageHeader } from '../components/Layout';
import { useCollection } from '../hooks/useCollection';
import { Card, Spinner } from '../components/ui';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#F5AB1E',
  confirmed: '#6B8CFF',
  shipped: '#9C9CA3',
  delivered: '#4CAF50',
  cancelled: '#E5484D',
};

export default function DashboardPage() {
  const { data: products, loading: loadingProducts } = useCollection('products');
  const { data: orders, loading: loadingOrders } = useCollection('orders');
  const { data: categories } = useCollection('categories');

  const loading = loadingProducts || loadingOrders;

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    const outOfStock = products.filter((p) => /out/i.test(p.availability || '')).length;
    return {
      revenue,
      orderCount: orders.length,
      productCount: products.length,
      outOfStock,
    };
  }, [orders, products]);

  const productsByCategory = useMemo(() => {
    return categories.map((c) => ({
      name: c.name,
      count: products.filter((p) => p.categoryId === c.id).length,
    }));
  }, [categories, products]);

  const ordersByStatus = useMemo(() => {
    const counts = {};
    for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1;
    return Object.entries(counts).map(([status, value]) => ({ status, value }));
  }, [orders]);

  if (loading) {
    return <div className="py-16 flex justify-center"><Spinner /></div>;
  }

  return (
    <>
      <PageHeader title="Analytics" description="Live snapshot of your catalog and orders." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} accent />
        <StatCard label="Orders" value={stats.orderCount} />
        <StatCard label="Products" value={stats.productCount} />
        <StatCard label="Out of Stock" value={stats.outOfStock} warn={stats.outOfStock > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <p className="text-sm font-medium text-white mb-4">Products by Category</p>
          {productsByCategory.length === 0 ? (
            <p className="text-sm text-muted">Add categories to see this chart.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={productsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2B30" />
                <XAxis dataKey="name" stroke="#9C9CA3" fontSize={12} />
                <YAxis stroke="#9C9CA3" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1D1E22', border: '1px solid #2A2B30', borderRadius: 8 }}
                  labelStyle={{ color: '#F5F5F5' }}
                />
                <Bar dataKey="count" fill="#F5AB1E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-white mb-4">Orders by Status</p>
          {ordersByStatus.length === 0 ? (
            <p className="text-sm text-muted">No orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={ordersByStatus} dataKey="value" nameKey="status" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {ordersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#9C9CA3'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1D1E22', border: '1px solid #2A2B30', borderRadius: 8 }}
                  labelStyle={{ color: '#F5F5F5' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </>
  );
}

function StatCard({ label, value, accent, warn }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-muted mb-2">{label}</p>
      <p className={`font-display text-2xl font-semibold ${accent ? 'text-amber' : warn ? 'text-danger' : 'text-white'}`}>
        {value}
      </p>
    </Card>
  );
}
