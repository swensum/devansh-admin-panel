import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/Layout';
import { useCollection } from '../hooks/useCollection';
import { Button, Card, EmptyState, Modal, Spinner } from '../components/ui';

export default function BlogsPage() {
  const navigate = useNavigate();
  const { data: posts, loading, service } = useCollection('blogs', { orderByField: 'createdAt' });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    await service.remove(pendingDelete.id);
    setDeleting(false);
    setPendingDelete(null);
  }

  if (loading) {
    return <div className="py-16 flex justify-center"><Spinner /></div>;
  }

  return (
    <>
      <PageHeader
        title="Blog"
        description="Write and publish posts shown on the site."
        action={<Button onClick={() => navigate('/blogs/new')}>Add Blog</Button>}
      />

      {posts.length === 0 ? (
        <EmptyState title="No posts yet" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="font-medium px-4 py-3 w-16"></th>
                <th className="font-medium px-4 py-3">Title</th>
                <th className="font-medium px-4 py-3">Category</th>
                <th className="font-medium px-4 py-3">Status</th>
                <th className="font-medium px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50">
                  <td className="px-4 py-3">
                    <img
                      src={post.coverImage}
                      alt=""
                      className="w-10 h-10 rounded-md object-cover bg-surface-alt"
                      onError={(e) => (e.target.style.visibility = 'hidden')}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{post.title}</p>
                    <p className="text-xs text-muted">{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{post.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        className="px-3 py-1.5"
                        onClick={() => navigate(`/blogs/${post.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="px-3 py-1.5"
                        onClick={() => setPendingDelete(post)}
                      >
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

      <Modal open={!!pendingDelete} onClose={() => setPendingDelete(null)} title="Delete post?">
        <p className="text-sm text-muted mb-6">
          <span className="text-white">{pendingDelete?.title}</span> will be removed from the site.
          This can't be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" disabled={deleting} onClick={confirmDelete}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
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