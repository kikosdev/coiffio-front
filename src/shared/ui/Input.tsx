import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, className = '', id, type, ...rest },
  ref,
) {
  const inputId = id || rest.name;
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPwd ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="pointer-events-none absolute start-3 text-muted">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={[
            'h-10 w-full rounded-xl border bg-surface px-3 text-sm text-ink outline-none transition-colors',
            'placeholder:text-muted/70 focus:border-champagne focus:ring-2 focus:ring-champagne/30',
            icon ? 'ps-9' : '',
            isPassword ? 'pr-10' : '',
            error ? 'border-error' : 'border-lineStrong',
            className,
          ].join(' ')}
          aria-invalid={!!error}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute end-3 text-muted transition-colors hover:text-ink"
            aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
});
