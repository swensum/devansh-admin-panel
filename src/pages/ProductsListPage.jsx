import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/Layout';
import { useCollection } from '../hooks/useCollection';
import { deleteProductImage } from '../services/storageService';
import { Button, Card, Input, Modal, EmptyState, Spinner, Badge } from '../components/ui';

export default function ProductsListPage() {
  const { data: products, loading, service } = useCollection('products', { orderByField: 'name' });
  const { data: categories } = useCollection('categories');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? '—';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, search]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    if (pendingDelete.imageUrl) await deleteProductImage(pendingDelete.imageUrl);
    await service.remove(pendingDelete.id);
    setDeleting(false);
    setPendingDelete(null);
  }

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? '' : 's'} in the catalog`}
        action={
          <Link to="/products/new">
            <Button>+ Add Product</Button>
          </Link>
        }
      />

      <Input
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5 max-w-xs"
      />

      {loading ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No products match your search' : 'No products yet'}
          description={!search && 'Add your first product to get the catalog started.'}
          action={
            !search && (
              <Link to="/products/new">
                <Button>+ Add Product</Button>
              </Link>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="font-medium px-4 py-3">Product</th>
                <th className="font-medium px-4 py-3">Category</th>
                <th className="font-medium px-4 py-3">Price</th>
                <th className="font-medium px-4 py-3">Availability</th>
                <th className="font-medium px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded-md object-cover bg-surface-alt shrink-0"
                        onError={(e) => (e.target.style.visibility = 'hidden')}
                      />
                      <span className="text-white font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{categoryName(p.categoryId)}</td>
                  <td className="px-4 py-3 font-mono text-amber">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={/out/i.test(p.availability || '') ? 'danger' : 'success'}>
                      {p.availability || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to={`/products/${p.id}/edit`}>
                        <Button variant="secondary" className="px-3 py-1.5">Edit</Button>
                      </Link>
                      <Button variant="danger" className="px-3 py-1.5" onClick={() => setPendingDelete(p)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={!!pendingDelete} onClose={() => setPendingDelete(null)} title="Delete product?">
        <p className="text-sm text-muted mb-6">
          This will permanently remove <span className="text-white">{pendingDelete?.name}</span> and
          its image. This can't be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
