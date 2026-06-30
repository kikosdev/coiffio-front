import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message = 'Une erreur est survenue.', onRetry, className = '' }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-error/30 bg-error/5 text-error">
        <AlertCircle size={22} strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-serif text-base text-ink">Impossible de charger</p>
        <p className="mt-0.5 text-sm text-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={13} />} onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}
