export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium px-4 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-amber text-black hover:bg-amber/90',
    secondary: 'bg-surface-alt text-white border border-border hover:bg-border',
    danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
    ghost: 'text-muted hover:text-white hover:bg-surface-alt',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Field({ label, error, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-muted mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

const inputBase =
  'w-full bg-surface-alt border border-border rounded-md px-3 py-2.5 text-sm text-white placeholder:text-muted/60 focus:border-amber transition-colors';

export function Input({ className = '', ...props }) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${inputBase} resize-none ${className}`} rows={4} {...props} />;
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${inputBase} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Card({ className = '', ...props }) {
  return <div className={`bg-surface border border-border rounded-xl ${className}`} {...props} />;
}

export function Badge({ tone = 'default', children }) {
  const tones = {
    default: 'bg-surface-alt text-muted',
    success: 'bg-success/10 text-success',
    warning: 'bg-amber/10 text-amber',
    danger: 'bg-danger/10 text-danger',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-xl w-full max-w-md p-6">
        <h3 className="font-display text-lg font-semibold text-white mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-border rounded-xl">
      <p className="text-white font-medium mb-1">{title}</p>
      {description && <p className="text-sm text-muted mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export function Spinner({ className = '' }) {
  return (
    <div className={`w-6 h-6 border-2 border-border border-t-amber rounded-full animate-spin ${className}`} />
  );
}
