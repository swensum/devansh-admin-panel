import { useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { Button, Card, Input, Modal, Select, EmptyState, Spinner } from './ui';

/**
 * Generic add/rename/delete list for simple reference collections.
 * If `scopedToCategory` is true, each item also belongs to a category
 * (used for productTypes & materials, which are scoped like on the
 * storefront sidebar).
 */
export default function LookupManager({ collectionPath, itemLabel, scopedToCategory = false }) {
  const { data: items, loading, service } = useCollection(collectionPath, { orderByField: 'name' });
  const { data: categories } = useCollection('categories', { orderByField: 'name' });

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? '—';

  function startEdit(item) {
    setEditingId(item.id);
    setName(item.name);
    setCategoryId(item.categoryId ?? '');
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setCategoryId('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (scopedToCategory && !categoryId) return;

    setSaving(true);
    const payload = scopedToCategory ? { name: name.trim(), categoryId } : { name: name.trim() };
    if (editingId) {
      await service.update(editingId, payload);
    } else {
      await service.add(payload);
    }
    setSaving(false);
    resetForm();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await service.remove(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-5 md:col-span-1 h-fit">
        <p className="text-sm font-medium text-white mb-4">
          {editingId ? `Rename ${itemLabel}` : `Add ${itemLabel}`}
        </p>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder={`${itemLabel} name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3"
          />
          {scopedToCategory && (
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mb-3">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {editingId ? 'Save' : 'Add'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <div className="md:col-span-2">
        {loading ? (
          <div className="py-16 flex justify-center"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState title={`No ${itemLabel.toLowerCase()}s yet`} />
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted border-b border-border">
                  <th className="font-medium px-4 py-3">Name</th>
                  {scopedToCategory && <th className="font-medium px-4 py-3">Category</th>}
                  <th className="font-medium px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50">
                    <td className="px-4 py-3 text-white">{item.name}</td>
                    {scopedToCategory && (
                      <td className="px-4 py-3 text-muted">{categoryName(item.categoryId)}</td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="px-3 py-1.5" onClick={() => startEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="danger" className="px-3 py-1.5" onClick={() => setPendingDelete(item)}>
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
      </div>

      <Modal open={!!pendingDelete} onClose={() => setPendingDelete(null)} title={`Delete ${itemLabel.toLowerCase()}?`}>
        <p className="text-sm text-muted mb-6">
          Products already assigned to <span className="text-white">{pendingDelete?.name}</span> will
          keep showing it until you edit them. This can't be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
