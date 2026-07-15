import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/Layout';
import { useCollection } from '../hooks/useCollection';
import { createFirestoreService } from '../services/firestoreService';
import { uploadProductImage, deleteProductImage } from '../services/storageService';
import { Button, Card, Field, Input, Select, Textarea, Spinner } from '../components/ui';

const productsService = createFirestoreService('products');

const EMPTY_FORM = {
  name: '',
  price: '',
  categoryId: '',
  companyId: '',
  typeId: '',
  materialId: '',
  thickness: '',
  size: '',
  quantity: '',
  finish: '',
  availability: 'In Stock',
  description: '',
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: categories } = useCollection('categories', { orderByField: 'name' });
  const { data: companies } = useCollection('companies', { orderByField: 'name' });
  const { data: types } = useCollection('productTypes', { orderByField: 'name' });
  const { data: materials } = useCollection('materials', { orderByField: 'name' });

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    productsService.getById(id).then((p) => {
      if (!p) return;
      setForm({
        name: p.name ?? '',
        price: p.price ?? '',
        categoryId: p.categoryId ?? '',
        companyId: p.companyId ?? '',
        typeId: p.typeId ?? '',
        materialId: p.materialId ?? '',
        thickness: p.thickness ?? '',
        size: p.size ?? '',
        quantity: p.quantity ?? '',
        finish: p.finish ?? '',
        availability: p.availability ?? 'In Stock',
        description: p.description ?? '',
      });
      setExistingImageUrl(p.imageUrl ?? null);
      setLoadingProduct(false);
    });
  }, [id, isEdit]);

  // Types & materials are scoped to the selected category, same as the
  // customer-facing storefront.
  const typesForCategory = useMemo(
    () => types.filter((t) => t.categoryId === form.categoryId),
    [types, form.categoryId]
  );
  const materialsForCategory = useMemo(
    () => materials.filter((m) => m.categoryId === form.categoryId),
    [materials, form.categoryId]
  );

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleCategoryChange(categoryId) {
    // Reset dependent fields — same behavior as the storefront sidebar.
    setForm((f) => ({ ...f, categoryId, typeId: '', materialId: '' }));
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.price || !form.categoryId) {
      setError('Name, price, and category are required.');
      return;
    }
    if (!isEdit && !imageFile) {
      setError('Please select a product image.');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
        if (isEdit && existingImageUrl) await deleteProductImage(existingImageUrl);
      }

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        categoryId: form.categoryId,
        companyId: form.companyId || null,
        typeId: form.typeId || null,
        materialId: form.materialId || null,
        thickness: form.thickness || null,
        size: form.size || null,
        quantity: form.quantity || null,
        finish: form.finish || null,
        availability: form.availability || null,
        description: form.description || null,
        imageUrl,
      };

      if (isEdit) {
        await productsService.update(id, payload);
      } else {
        await productsService.add(payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingProduct) {
    return <div className="py-16 flex justify-center"><Spinner /></div>;
  }
console.log('[ProductFormPage] render at', performance.now());
  return (
    <>
      <PageHeader title={isEdit ? 'Edit Product' : 'Add Product'} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <Field label="Product Name">
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price ($)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                required
              />
            </Field>
            <Field label="Availability">
              <Select value={form.availability} onChange={(e) => update('availability', e.target.value)}>
                <option>In Stock</option>
                <option>Out of Stock</option>
                <option>Limited Stock</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.categoryId} onChange={(e) => handleCategoryChange(e.target.value)} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Company">
              <Select value={form.companyId} onChange={(e) => update('companyId', e.target.value)}>
                <option value="">None</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select
                value={form.typeId}
                onChange={(e) => update('typeId', e.target.value)}
                disabled={!form.categoryId}
              >
                <option value="">None</option>
                {typesForCategory.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Material">
              <Select
                value={form.materialId}
                onChange={(e) => update('materialId', e.target.value)}
                disabled={!form.categoryId}
              >
                <option value="">None</option>
                {materialsForCategory.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Thickness">
              <Input value={form.thickness} onChange={(e) => update('thickness', e.target.value)} />
            </Field>
            <Field label="Size">
              <Input value={form.size} onChange={(e) => update('size', e.target.value)} />
            </Field>
            <Field label="Quantity">
              <Input value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
            </Field>
          </div>

          <Field label="Finish">
            <Input value={form.finish} onChange={(e) => update('finish', e.target.value)} />
          </Field>

          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} />
          </Field>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="text-sm font-medium text-muted mb-3">Product Image</p>
            <div className="aspect-square rounded-md bg-surface-alt border border-border overflow-hidden mb-3 flex items-center justify-center">
              {imagePreview || existingImageUrl ? (
                <img src={imagePreview || existingImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted">No image selected</span>
              )}
            </div>
            <label className="block">
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="image-upload" />
              <Button variant="secondary" type="button" className="w-full" onClick={() => document.getElementById('image-upload').click()}>
                {existingImageUrl || imagePreview ? 'Replace Image' : 'Choose Image'}
              </Button>
            </label>
          </Card>

          {error && (
            <p className="text-sm text-danger" role="alert">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
