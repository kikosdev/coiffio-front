import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, MapPin, Phone, Store } from 'lucide-react';
import './platform.css';
import { useSalonProfileStore } from './salonProfileStore';
import { useMoneyFormatter } from '@/utils/money';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

const DOW = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

interface LocationOpeningHour { day: number; open: string; close: string; closed: boolean; }

function isLocationOpeningHour(h: unknown): h is LocationOpeningHour {
  return !!h && typeof h === 'object' && 'day' in h && 'open' in h && 'close' in h && 'closed' in h;
}

function formatOpeningHours(hours: unknown[]): string[] {
  if (!Array.isArray(hours)) return [];
  return hours
    .filter(isLocationOpeningHour)
    .sort((a, b) => a.day - b.day)
    .map((h) => `${DOW[h.day] ?? h.day} · ${h.closed ? 'Fermé' : `${h.open} – ${h.close}`}`);
}

export function SalonPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const formatMoney = useMoneyFormatter();
  const { profile, loading, error, fetchProfile, reset } = useSalonProfileStore();

  useEffect(() => {
    if (slug) void fetchProfile(slug);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="plt">
      <nav className="plt-nav">
        <Link to="/" className="plt-brand"><span className="mark">Coiffio</span><span className="dot" /><span className="sub">L'annuaire des salons</span></Link>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-soft)', textDecoration: 'none' }}>
          <ArrowLeft size={14} />Retour à l'annuaire
        </Link>
      </nav>

      {loading && (
        <div style={{ padding: '56px 56px' }}>
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!loading && error && (
        <div style={{ padding: '56px' }}>
          <ErrorState message={error} onRetry={() => void fetchProfile(slug)} />
        </div>
      )}

      {!loading && !error && !profile && (
        <div style={{ padding: '56px' }}>
          <EmptyState icon={Store} label="Salon introuvable" sub="Ce salon n'existe pas ou n'est plus actif." />
        </div>
      )}

      {!loading && !error && profile && (
        <>
          <header className="plt-salon-header">
            <div className="plt-salon-header-ph plt-ph"><Store size={40} /></div>
            <div className="plt-salon-header-info">
              <h1>{profile.name}</h1>
              {profile.locations[0] && (
                <div className="plt-salon-header-meta">
                  {(profile.locations[0].address?.city || profile.locations[0].address?.line1) && (
                    <span><MapPin size={13} />{[profile.locations[0].address?.line1, profile.locations[0].address?.city].filter(Boolean).join(', ')}</span>
                  )}
                  {profile.locations[0].phone && <span><Phone size={13} />{profile.locations[0].phone}</span>}
                </div>
              )}
              <Link to={`/salons/${profile.slug}/book`} className="plt-cta" style={{ marginTop: 18, padding: '13px 26px', fontSize: 14 }}>
                Réserver un rendez-vous
                <ArrowRight size={14} />
              </Link>
            </div>
          </header>

          <section className="plt-salon-body">
            {profile.locations.length > 0 && (
              <div className="plt-salon-block">
                <h3><Clock size={14} />Horaires & emplacements</h3>
                {profile.locations.map((loc) => (
                  <div className="plt-salon-location" key={loc.name}>
                    <div className="loc-name">{loc.name}</div>
                    {formatOpeningHours(loc.openingHours).map((h, i) => <div className="loc-hours" key={i}>{h}</div>)}
                  </div>
                ))}
              </div>
            )}

            <div className="plt-salon-block">
              <h3>Services</h3>
              {profile.services.length === 0 ? (
                <EmptyState label="Aucun service publié pour l'instant" />
              ) : (
                <div className="plt-salon-services">
                  {profile.services.map((s) => (
                    <div className="plt-salon-service-row" key={s.name}>
                      <div>
                        <div className="svc-name">{s.name}</div>
                        <div className="svc-cat">{s.category} · {fmtDuration(s.durationMin)}</div>
                      </div>
                      <div className="svc-price">{formatMoney(s.price)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {profile.team.length > 0 && (
              <div className="plt-salon-block">
                <h3>L'équipe</h3>
                <div className="plt-salon-team">
                  {profile.team.map((t) => (
                    <div className="plt-salon-team-tile" key={t.name}>
                      <div className="init">{t.name[0]}</div>
                      <div className="name">{t.name}</div>
                      <div className="role">{t.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.testimonials.length > 0 && (
              <div className="plt-salon-block">
                <h3>Avis clients</h3>
                <div className="plt-salon-testimonials">
                  {profile.testimonials.map((t, i) => (
                    <div className="plt-salon-testimonial" key={i}>
                      <q>{t.quote}</q>
                      <div className="who">{t.authorFirstName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
