import { useMemo, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { useCollection } from '../hooks/useCollection';
import { Card, Spinner } from '../components/ui';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; // adjust this import path to match your project's Firebase config file

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
];

export default function ReviewsPage() {
  const { data: reviews, loading } = useCollection('reviews');
  const [tab, setTab] = useState('pending');
  const [busyId, setBusyId] = useState(null);

  const filtered = useMemo(() => {
    const wantApproved = tab === 'approved';
    return reviews
      .filter((r) => Boolean(r.approved) === wantApproved)
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  }, [reviews, tab]);

  const pendingCount = useMemo(
    () => reviews.filter((r) => !r.approved).length,
    [reviews]
  );

  async function handleApprove(id) {
    setBusyId(id);
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: true });
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnapprove(id) {
    setBusyId(id);
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: false });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this review permanently?')) return;
    setBusyId(id);
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="py-16 flex justify-center"><Spinner /></div>;
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Approve customer reviews before they appear on the homepage."
      />

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-amber/10 text-amber border border-amber/30'
                : 'text-muted hover:text-white hover:bg-surface-alt border border-transparent'
            }`}
          >
            {t.label}
            {t.key === 'pending' && pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber text-black text-[11px] font-semibold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted">
            {tab === 'pending' ? 'No reviews waiting for approval.' : 'No approved reviews yet.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              busy={busyId === review.id}
              onApprove={() => handleApprove(review.id)}
              onUnapprove={() => handleUnapprove(review.id)}
              onDelete={() => handleDelete(review.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function ReviewCard({ review, busy, onApprove, onUnapprove, onDelete }) {
  const date = review.createdAt?.seconds
    ? new Date(review.createdAt.seconds * 1000).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3 mb-3">
        {review.photoUrl ? (
          <img
            src={review.photoUrl}
            alt={review.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-amber flex items-center justify-center text-black font-semibold text-sm">
            {review.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{review.name}</p>
          <p className="text-xs text-muted truncate">{review.role || 'Customer'}</p>
        </div>
        <div className="flex text-amber text-xs shrink-0">
          {'★'.repeat(review.rating ?? 0)}
          <span className="text-border">{'★'.repeat(5 - (review.rating ?? 0))}</span>
        </div>
      </div>

      <p className="text-sm text-white/90 mb-4 leading-relaxed">{review.message}</p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{date}</span>
        <div className="flex gap-2">
          {review.approved ? (
            <button
              onClick={onUnapprove}
              disabled={busy}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-muted hover:text-white hover:bg-surface-alt transition-colors disabled:opacity-50"
            >
              Unapprove
            </button>
          ) : (
            <button
              onClick={onApprove}
              disabled={busy}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber text-black hover:bg-amber/90 transition-colors disabled:opacity-50"
            >
              Approve
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={busy}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </Card>
  );
}