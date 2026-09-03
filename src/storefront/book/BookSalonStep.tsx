import { useEffect } from 'react';
import { MapPin, Store, ArrowRight } from 'lucide-react';
import { useBookStore } from './bookStore';
import { usePlatformStore } from '@/storefront/platform/platformStore';
import { TUNISIA_GOVERNORATES } from '@/config/governorates';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';

/** Étape I — région puis salon (nouvelle étape prépendue au flow existant). */
export function BookSalonStep() {
  const region = useBookStore((s) => s.region);
  const salonSlug = useBookStore((s) => s.salonSlug);
  const setRegion = useBookStore((s) => s.setRegion);
  const setSalon = useBookStore((s) => s.setSalon);

  const { directory, directoryLoading, directoryError, fetchDirectory } = usePlatformStore();

  useEffect(() => { void fetchDirectory(region || undefined); }, [region, fetchDirectory]);

  const pick = (slug: string, name: string) => setSalon(slug, name);

  return (
    <div>
      <div className="book-eyebrow">Étape I · Choisissez votre salon</div>
      <h1 className="book-h1">Où souhaitez-vous <em>être reçu</em> ?</h1>
      <p className="book-lead">Sélectionnez une région pour affiner la liste, puis choisissez le salon de votre choix.</p>

      <div className="salon-region-row">
        <button className={`region-pill${!region ? ' on' : ''}`} onClick={() => setRegion('')}>Toute la Tunisie</button>
        {TUNISIA_GOVERNORATES.map((g) => (
          <button key={g.value} className={`region-pill${region === g.value ? ' on' : ''}`} onClick={() => setRegion(g.value)}>
            {g.label}
          </button>
        ))}
      </div>

      {directoryLoading ? (
        <div className="salon-pick-grid">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : directoryError ? (
        <ErrorState message={directoryError} onRetry={() => fetchDirectory(region || undefined)} />
      ) : directory.length === 0 ? (
        <EmptyState icon={Store} label="Aucun salon dans cette région" sub="Essayez une autre région." />
      ) : (
        <div className="salon-pick-grid">
          {directory.map((s) => (
            <div
              key={s.slug}
              className={`salon-pick-card${salonSlug === s.slug ? ' selected' : ''}`}
              onClick={() => pick(s.slug, s.name)}
            >
              <div className="salon-pick-ph"><Store size={22} /></div>
              <div className="salon-pick-info">
                <div className="name">{s.name}</div>
                {(s.city || s.region) && <div className="meta"><MapPin size={11} />{s.city || s.region}</div>}
              </div>
              <ArrowRight size={16} className="salon-pick-arrow" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
