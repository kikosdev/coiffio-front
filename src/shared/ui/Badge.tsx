import type { ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'pending' | 'error' | 'champagne';

const tones: Record<Tone, string> = {
  neutral: 'bg-line/60 text-muted',
  success: 'bg-success/12 text-success',
  pending: 'bg-pending/15 text-pending',
  error: 'bg-error/12 text-error',
  champagne: 'bg-champagne/15 text-champagne-deep',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}

/** Status chip — confirmed/pending/error/… (cf. tokens de statut SKILL.md). */
export function Badge({ children, tone = 'neutral', dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
