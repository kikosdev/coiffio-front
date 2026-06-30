import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Modal centrée en desktop, devient bottom-sheet plein-largeur en < 768px
 * (contrat responsive SKILL.md). Ferme sur Escape et clic backdrop.
 */
export function Modal({ open, onClose, title, children, footer, className = '' }: ModalProps) {
  const { t } = useTranslation('common');
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm md:items-center"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={[
          'w-full bg-surface shadow-card',
          'rounded-t-card md:w-[440px] md:rounded-card',
          'max-h-[90vh] overflow-y-auto',
          className,
        ].join(' ')}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div className="font-serif text-xl font-medium text-ink">{title}</div>
          <button
            onClick={onClose}
            aria-label={t('actions.close')}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-line/60 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export { Modal as Sheet };
