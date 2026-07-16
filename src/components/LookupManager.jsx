import { useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { uploadProductImage } from '../services/storageService';
import { Button, Card, Input, Modal, Select, EmptyState, Spinner } from './ui';

export default function LookupManager({ collectionPath, itemLabel, scopedToCategory = false, hasImage = false }) {
  const { data: items, loading, service } = useCollection(collectionPath, { orderByField: 'name' });
  const { data: categories } = useCollection('categories', { orderByField: 'name' });

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? '—';

  function startEdit(item) {
    setEditingId(item.id);
    setName(item.name);
    setCategoryId(item.categoryId ?? '');
    setExistingImageUrl(item.imageUrl ?? null);
    setImageFile(null);
    setImagePreview(null);
  }

  function resetForm() {
    setEditingId(null);
    setName('');
    setCategoryId('');
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (scopedToCategory && !categoryId) return;

    setSaving(true);
    const payload = { name: name.trim() };
    if (scopedToCategory) payload.categoryId = categoryId;
    if (hasImage) {
      payload.imageUrl = imageFile ? await uploadProductImage(imageFile) : existingImageUrl ?? null;
    }

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
          {editingId ? `Edit ${itemLabel}` : `Add ${itemLabel}`}
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
          {hasImage && (
            <div className="mb-3">
              <div className="w-full aspect-video rounded-md bg-surface-alt border border-border overflow-hidden mb-2 flex items-center justify-center">
                {imagePreview || existingImageUrl ? (
                  <img src={imagePreview || existingImageUrl} alt="" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs text-muted">No image</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id={`${collectionPath}-image-upload`}
              />
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => document.getElementById(`${collectionPath}-image-upload`).click()}
              >
                {imagePreview || existingImageUrl ? 'Replace Image' : 'Choose Image'}
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : editingId ? 'Save' : 'Add'}
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
                  {hasImage && <th className="font-medium px-4 py-3 w-16"></th>}
                  <th className="font-medium px-4 py-3">Name</th>
                  {scopedToCategory && <th className="font-medium px-4 py-3">Category</th>}
                  <th className="font-medium px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50">
                    {hasImage && (
                      <td className="px-4 py-3">
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-md object-contain bg-surface-alt"
                          onError={(e) => (e.target.style.visibility = 'hidden')}
                        />
                      </td>
                    )}
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
