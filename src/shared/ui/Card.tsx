import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div className={`rounded-card border border-line bg-surface shadow-soft ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...rest }: CardProps) {
  return (
    <div className={`flex items-center justify-between border-b border-line px-5 py-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`font-serif text-lg font-medium text-ink ${className}`}>{children}</h3>;
}

export function CardBody({ children, className = '', ...rest }: CardProps) {
  return (
    <div className={`px-5 py-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}
