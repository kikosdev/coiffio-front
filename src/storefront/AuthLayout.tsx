import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Cadre éditorial partagé des écrans d'auth (sign-in / register / reset).
 * Split deux colonnes > 768px (panneau marque ink + formulaire), empilé en mobile.
 * Tokens Ivory Éditorial stricts.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-ivory">
      {/* Panneau marque — masqué < 768px */}
      <aside className="relative hidden w-[44%] flex-col justify-between bg-ink p-10 text-ivory md:flex lg:w-1/2">
        <div className="flex items-center gap-2">
          <span className="font-serif text-3xl italic">SalonOS</span>
          <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
        </div>
        <div className="max-w-md">
          <p className="font-serif text-4xl leading-tight lg:text-5xl">
            Salon Haire
            <span className="mt-2 block text-champagne">l'art du rendez-vous.</span>
          </p>
          <p className="mt-4 text-sm text-ivory/70">
            Réservation en ligne, boutique et suivi — pensés pour une expérience éditoriale.
          </p>
        </div>
        <p className="text-xs uppercase tracking-widest text-ivory/40">18 rue de Sévigné · Tunis</p>
      </aside>

      {/* Colonne formulaire */}
      <main className="flex w-full flex-1 items-center justify-center px-5 py-10 md:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <span className="font-serif text-2xl italic text-ink">SalonOS</span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
