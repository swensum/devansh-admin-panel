import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Field, Input } from '../components/ui';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    navigate(location.state?.from ?? '/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden px-4">
      {/* Fine technical grid — the one signature touch on this page */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#F5AB1E 1px, transparent 1px), linear-gradient(90deg, #F5AB1E 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/40 to-transparent" />

      <div className="relative w-full max-w-sm">
        {/* Corner brackets — blueprint / spec-sheet framing */}
        <Bracket className="-top-3 -left-3" />
        <Bracket className="-top-3 -right-3 rotate-90" />
        <Bracket className="-bottom-3 -left-3 -rotate-90" />
        <Bracket className="-bottom-3 -right-3 rotate-180" />

        <div className="bg-surface border border-border rounded-xl p-8">
          <div className="mb-8">
            <p className="font-mono text-[11px] tracking-widest text-amber uppercase mb-2">
              Restricted Access
            </p>
            <h1 className="font-display text-2xl font-semibold text-white">
              Devansh Admin
            </h1>
            <p className="text-sm text-muted mt-1">Sign in to manage the catalog</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field label="Email">
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {error && (
              <p className="text-sm text-danger mb-4" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted mt-6 font-mono">
          Accounts are created manually in Firebase Console
        </p>
      </div>
    </div>
  );
}

function Bracket({ className }) {
  return (
    <svg
      className={`absolute w-6 h-6 text-amber ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 8V2h6" />
    </svg>
  );
}
