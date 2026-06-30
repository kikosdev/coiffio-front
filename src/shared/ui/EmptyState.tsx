import { type LucideIcon, InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  label: string;
  sub?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ label, sub, icon: Icon = InboxIcon, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-muted">
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-serif text-base text-ink">{label}</p>
        {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
