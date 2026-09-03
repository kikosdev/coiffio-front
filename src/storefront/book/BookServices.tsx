import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, Plus } from 'lucide-react';
import { useBookStore, fmtDuration, audienceAllows, type Audience } from './bookStore';
import { useMoneyFormatter } from '@/utils/money';

const AUDIENCES: { id: Audience; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
];

/** Étape 1 — composition de la visite (services genrés + catégories). */
export function BookServices() {
  const formatMoney = useMoneyFormatter();
  const salonSlug = useBookStore((s) => s.salonSlug);
  const catalog = useBookStore((s) => s.catalog);
  const fetchCatalog = useBookStore((s) => s.fetchCatalog);
  const selected = useBookStore((s) => s.selectedServiceIds);
  const toggle = useBookStore((s) => s.toggleService);

  const [cat, setCat] = useState('all');
  const [aud, setAud] = useState<Audience>('all');

  useEffect(() => { if (salonSlug && catalog.length === 0) void fetchCatalog(); }, [salonSlug, catalog.length, fetchCatalog]);

  const categories = useMemo(() => {
    const set = new Map<string, number>();
    catalog.forEach((s) => set.set(s.category || 'Autres', (set.get(s.category || 'Autres') ?? 0) + 1));
    return [{ id: 'all', label: 'All Services', count: catalog.length }, ...[...set.entries()].map(([id, count]) => ({ id, label: id, count }))];
  }, [catalog]);

  const filtered = catalog.filter((s) => {
    if (cat !== 'all' && (s.category || 'Autres') !== cat) return false;
    return audienceAllows(aud, s.gender);
  });

  return (
    <div>
      <div className="book-eyebrow">Step One · Choose your services</div>
      <h1 className="book-h1">Compose your <em>visit</em>.</h1>
      <p className="book-lead">Pick anything you'd like — we'll calculate the total time and find one stylist who can do it all in a single continuous appointment.</p>

      <div className="audience-row">
        {AUDIENCES.map((a) => (
          <button key={a.id} className={`audience-pill${aud === a.id ? ' on' : ''}`} onClick={() => setAud(a.id)}>{a.label}</button>
        ))}
      </div>

      <nav className="cat-nav">
        {categories.map((c) => (
          <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>
            {c.label} <span className="count">{c.count}</span>
          </button>
        ))}
      </nav>

      <div className="svc-cards">
        {filtered.map((s) => {
          const isSel = selected.includes(s._id);
          return (
            <div key={s._id} className={`svc-card${isSel ? ' selected' : ''}`} onClick={() => toggle(s._id)}>
              <div className="svc-top">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="svc-card-name">{s.name}</div>
                  <div className="svc-card-desc" style={{ marginTop: 6 }}>{s.category || '—'}{s.gender !== 'universal' ? ` · ${s.gender === 'men' ? 'Homme' : 'Femme'}` : ''}</div>
                </div>
                <button className="svc-add-btn">{isSel ? <Check size={14} /> : <Plus size={14} />}</button>
              </div>
              <div className="svc-meta-row">
                <div className="svc-stat"><Clock size={12} /><span className="v">{fmtDuration(s.durationMin)}</span></div>
                <div className="svc-stat"><span className="v"><em>{formatMoney(s.price)}</em></span></div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20 }}>Nothing here yet — try another category.</div>
        </div>
      )}
    </div>
  );
}
