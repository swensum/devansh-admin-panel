import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/Layout';
import { createFirestoreService } from '../services/firestoreService';
import { uploadProductImage, deleteProductImage } from '../services/storageService';
import { Button, Card, Field, Input, Select, Textarea, Spinner } from '../components/ui';

const blogsService = createFirestoreService('blogs');

const CATEGORY_OPTIONS = ['Buying Guide', 'Trends', 'Maintenance', 'News'];

const EMPTY_FORM = {
  title: '',
  slug: '',
  category: CATEGORY_OPTIONS[0],
  excerpt: '',
  content: '',
  status: 'draft',
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function BlogFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [loadingPost, setLoadingPost] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    blogsService.getById(id).then((post) => {
      if (!post) return;
      setForm({
        title: post.title ?? '',
        slug: post.slug ?? '',
        category: post.category ?? CATEGORY_OPTIONS[0],
        excerpt: post.excerpt ?? '',
        content: post.content ?? '',
        status: post.status ?? 'draft',
      });
      setSlugTouched(true);
      setExistingImageUrl(post.coverImage ?? null);
      setLoadingPost(false);
    });
  }, [id, isEdit]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleTitleChange(value) {
    setForm((f) => ({
      ...f,
      title: value,
      // Keep auto-generating the slug until the person edits it directly.
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  function handleSlugChange(value) {
    setSlugTouched(true);
    update('slug', value);
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

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    try {
      let coverImage = existingImageUrl;
      if (imageFile) {
        coverImage = await uploadProductImage(imageFile);
        if (isEdit && existingImageUrl) await deleteProductImage(existingImageUrl);
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        category: form.category,
        excerpt: form.excerpt || null,
        content: form.content || null,
        status: form.status,
        coverImage,
      };

      if (isEdit) {
        await blogsService.update(id, payload);
      } else {
        await blogsService.add(payload);
      }
      navigate('/blogs');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingPost) {
    return <div className="py-16 flex justify-center"><Spinner /></div>;
  }

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Post' : 'Add Blog'} />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
          </Field>

          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category} onChange={(e) => update('category', e.target.value)}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </div>

          <Field label="Excerpt">
            <Textarea
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              placeholder="A short one or two sentence summary shown on the blog card."
            />
          </Field>

          <Field label="Content">
            <Textarea
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              className="min-h-[220px]"
              placeholder="Write the full post here."
            />
          </Field>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <p className="text-sm font-medium text-muted mb-3">Cover Image</p>
            <div className="aspect-video rounded-md bg-surface-alt border border-border overflow-hidden mb-3 flex items-center justify-center">
              {imagePreview || existingImageUrl ? (
                <img src={imagePreview || existingImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted">No image selected</span>
              )}
            </div>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="blog-image-upload"
              />
              <Button
                variant="secondary"
                type="button"
                className="w-full"
                onClick={() => document.getElementById('blog-image-upload').click()}
              >
                {existingImageUrl || imagePreview ? 'Replace Image' : 'Choose Image'}
              </Button>
            </label>
          </Card>

          {error && (
            <p className="text-sm text-danger" role="alert">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Blog'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/blogs')}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}