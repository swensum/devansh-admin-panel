import { useMemo, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { useCollection } from '../hooks/useCollection';
import { Card, Spinner } from '../components/ui';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

const CATEGORY_OPTIONS = ['Buying Guide', 'Trends', 'Maintenance', 'News'];

const EMPTY_FORM = {
  title: '',
  slug: '',
  category: CATEGORY_OPTIONS[0],
  coverImage: '',
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

export default function BlogsPage() {
  const { data: blogs, loading } = useCollection('blogs');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const sortedBlogs = useMemo(() => {
    return [...blogs].sort((a, b) => {
      const aTime = a.createdAt?.seconds ?? 0;
      const bTime = b.createdAt?.seconds ?? 0;
      return bTime - aTime;
    });
  }, [blogs]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setPanelOpen(true);
  }

  function openEdit(post) {
    setEditingId(post.id);
    setForm({
      title: post.title ?? '',
      slug: post.slug ?? '',
      category: post.category ?? CATEGORY_OPTIONS[0],
      coverImage: post.coverImage ?? '',
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      status: post.status ?? 'draft',
    });
    setError('');
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  function handleTitleChange(value) {
    setForm((f) => ({
      ...f,
      title: value,
      // Only auto-fill the slug while creating, or if the user hasn't
      // customized it away from the auto-generated version yet.
      slug: editingId && f.slug ? f.slug : slugify(value),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        slug: form.slug.trim() || slugify(form.title),
        updatedAt: serverTimestamp(),
      };
      if (editingId) {
        await updateDoc(doc(db, 'blogs', editingId), payload);
      } else {
        await addDoc(collection(db, 'blogs'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      closePanel();
    } catch (err) {
      setError(err?.message ?? 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post) {
    const confirmed = window.confirm(`Delete "${post.title}"? This can't be undone.`);
    if (!confirmed) return;
    await deleteDoc(doc(db, 'blogs', post.id));
  }

  if (loading) {
    return <div className="py-16 flex justify-center"><Spinner /></div>;
  }

  return (
    <>
      <PageHeader title="Blog" description="Write and publish posts shown on the site.">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-amber text-black hover:bg-amber/90 transition-colors"
        >
          <PlusIcon />
          Add Blog
        </button>
      </PageHeader>

      {sortedBlogs.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-muted">No posts yet. Add your first one to get it live on the site.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBlogs.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <p className="text-white font-medium">{post.title}</p>
                    <p className="text-xs text-muted">{post.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-muted">{post.category}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(post)}
                        className="px-3 py-1.5 rounded-md text-xs text-muted hover:text-white hover:bg-surface-alt transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        className="px-3 py-1.5 rounded-md text-xs text-danger hover:bg-danger/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {panelOpen && (
        <BlogFormPanel
          form={form}
          editingId={editingId}
          saving={saving}
          error={error}
          onTitleChange={handleTitleChange}
          onFieldChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
          onSubmit={handleSubmit}
          onClose={closePanel}
        />
      )}
    </>
  );
}

function StatusBadge({ status }) {
  const isPublished = status === 'published';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isPublished ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-muted'
      }`}
    >
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

function BlogFormPanel({ form, editingId, saving, error, onTitleChange, onFieldChange, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md h-full bg-surface border-l border-border flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="font-display font-semibold text-white">
            {editingId ? 'Edit Post' : 'Add Blog'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-white transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 rounded-md px-3 py-2">{error}</p>
          )}

          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="input"
              placeholder="How to Choose the Right Cabinet Handles"
              required
            />
          </Field>

          <Field label="Slug">
            <input
              value={form.slug}
              onChange={(e) => onFieldChange('slug', e.target.value)}
              className="input"
              placeholder="how-to-choose-the-right-cabinet-handles"
            />
          </Field>

          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => onFieldChange('category', e.target.value)}
              className="input"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cover image URL">
            <input
              value={form.coverImage}
              onChange={(e) => onFieldChange('coverImage', e.target.value)}
              className="input"
              placeholder="https://..."
            />
          </Field>

          <Field label="Excerpt">
            <textarea
              value={form.excerpt}
              onChange={(e) => onFieldChange('excerpt', e.target.value)}
              className="input min-h-[70px]"
              placeholder="A short one or two sentence summary shown on the blog card."
            />
          </Field>

          <Field label="Content">
            <textarea
              value={form.content}
              onChange={(e) => onFieldChange('content', e.target.value)}
              className="input min-h-[180px]"
              placeholder="Write the full post here."
            />
          </Field>

          <Field label="Status">
            <div className="flex gap-2">
              {['draft', 'published'].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => onFieldChange('status', option)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm capitalize transition-colors ${
                    form.status === option
                      ? 'bg-amber/10 text-amber border border-amber'
                      : 'bg-surface-alt text-muted border border-border'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-md text-sm text-muted border border-border hover:text-white hover:bg-surface-alt transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-md text-sm font-medium bg-amber text-black hover:bg-amber/90 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Blog'}
          </button>
        </div>
      </form>

      {/* Scoped input styling so this file doesn't depend on a shared Input component. */}
      <style>{`
        .input {
          width: 100%;
          background: rgb(29 30 34);
          border: 1px solid #2A2B30;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: white;
        }
        .input::placeholder { color: #6b6b72; }
        .input:focus { outline: none; border-color: #F5AB1E; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}