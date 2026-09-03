import { useEffect, useMemo, useState, type FormEvent } from 'react';
import './platform.css';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, Search, MapPin, Store, Smartphone, Check, Menu, X, Instagram, Music, Bookmark, Mail, UserRound,
} from 'lucide-react';
import { usePlatformStore, type DirectoryEntry, type SponsoredEntry } from './platformStore';
import { TUNISIA_GOVERNORATES } from '@/config/governorates';
import { LanguageSwitcher } from '@/shared/i18n/LanguageSwitcher';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useMoneyFormatter } from '@/utils/money';

const PH_TONES = ['tone-a', 'tone-b', 'tone-c'] as const;

// ─── Nav ─────────────────────────────────────────────────────────────────────

function BrandMark() {
  return (
    <Link to="/" className="plt-brand">
      <span className="mark">Coiffio</span>
      <span className="dot" />
      <span className="sub">L'annuaire des salons</span>
    </Link>
  );
}

function PlatformNav() {
  const { t } = useTranslation('landing');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  const close = () => setOpen(false);

  return (
    <nav className={`plt-nav${open ? ' menu-open' : ''}`}>
      <BrandMark />
      <div className="plt-nav-links">
        <a href="#annuaire">Annuaire</a>
        <a href="#app">Application</a>
        <a href="#pricing">Pour les salons</a>
      </div>
      <div className="plt-nav-right">
        <LanguageSwitcher variant="inline" />
        <Link to="/sign-in" className="plt-signin">
          <UserRound size={14} />
          <span>{t('nav.signIn')}</span>
        </Link>
        <Link to="/book" className="plt-cta">
          {t('nav.bookVisit')}
          <ArrowRight size={13} />
        </Link>
        <button className="plt-burger" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
        </button>
      </div>
      <div className={`plt-drawer${open ? ' on' : ''}`} onClick={close}>
        <div className="plt-drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div className="plt-drawer-links">
            <a href="#annuaire" onClick={close}>Annuaire</a>
            <a href="#app" onClick={close}>Application</a>
            <a href="#pricing" onClick={close}>Pour les salons</a>
          </div>
          <div className="plt-drawer-foot">
            <Link to="/sign-in" onClick={close}><UserRound size={15} /><span>{t('nav.signIn')}</span></Link>
            <Link to="/book" className="plt-cta" onClick={close}>{t('nav.bookVisit')}<ArrowRight size={13} /></Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection({ q, region, onSubmit }: { q: string; region: string; onSubmit: (q: string, region: string) => void }) {
  const { t } = useTranslation('landing');
  const [qLocal, setQLocal] = useState(q);
  const [regionLocal, setRegionLocal] = useState(region);
  useEffect(() => setQLocal(q), [q]);
  useEffect(() => setRegionLocal(region), [region]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(qLocal.trim(), regionLocal);
  };

  return (
    <section className="plt-hero">
      <div className="plt-hero-eyebrow">{t('platform.hero.eyebrow')}</div>
      <h1>
        <span className="line">{t('platform.hero.title1')} <em>{t('platform.hero.title1Em')}</em> {t('platform.hero.title1Rest')}</span>
        <span className="line">{t('platform.hero.title2')} <em>{t('platform.hero.title2Em')}</em>.</span>
      </h1>
      <p>{t('platform.hero.subtitle')}</p>

      <form className="plt-search" onSubmit={submit}>
        <div className="plt-search-field">
          <Search size={16} />
          <input
            type="text"
            placeholder={t('platform.hero.searchPlaceholder') ?? undefined}
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
          />
        </div>
        <div className="plt-search-divider" />
        <div className="plt-search-field select">
          <MapPin size={16} />
          <select value={regionLocal} onChange={(e) => setRegionLocal(e.target.value)}>
            <option value="">{t('platform.hero.regionAll')}</option>
            {TUNISIA_GOVERNORATES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="plt-cta">
          {t('platform.hero.searchCta')}
          <ArrowRight size={14} />
        </button>
      </form>
    </section>
  );
}

// ─── Showcase (promo / sponsorisé) ───────────────────────────────────────────

function ShowcaseSkeleton() {
  return (
    <div className="plt-showcase-grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="plt-showcase-card" style={{ pointerEvents: 'none' }}>
          <Skeleton className="h-22 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-1" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/** GET /discovery/sponsored dédié (Prompt 6) — plus une dérivation de l'annuaire : la
 * Showcase et l'annuaire ont des cycles de vie indépendants (sponsoring vs présence). */
function ShowcaseSection({ entries, loading, error, onRetry }: { entries: SponsoredEntry[]; loading: boolean; error: string | null; onRetry: () => void }) {
  const { t } = useTranslation('landing');

  // Liste vide (succès, juste personne de sponsorisé) → section entièrement masquée, pas
  // d'état vide visible sur la home. Une ERREUR reste affichée : sinon une panne réseau se
  // confondrait avec "aucun sponsor", ce que le brief interdit explicitement.
  if (!loading && !error && entries.length === 0) return null;

  return (
    <section className="plt-showcase">
      <div className="plt-section-head">
        <div className="left">
          <div className="eyebrow">{t('platform.showcase.eyebrow')}</div>
          <h2>{t('platform.showcase.title')} <em>{t('platform.showcase.titleEm')}</em></h2>
        </div>
        <div className="right">
          <p>{t('platform.showcase.subtitle')}</p>
        </div>
      </div>
      {loading ? (
        <ShowcaseSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <div className="plt-showcase-grid">
          {entries.map((s, i) => (
            <Link to={`/salons/${s.slug}/book`} className="plt-showcase-card" key={s.slug}>
              <span className="plt-badge-sponsored">{t('platform.showcase.badge')}</span>
              <div className={`plt-showcase-ph plt-ph ${PH_TONES[i % PH_TONES.length]}`}>
                {s.coverImage ? <img src={s.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} /> : <Store size={28} />}
              </div>
              <div className="name">{s.name}</div>
              {s.city && <div className="city"><MapPin size={11} />{s.city}</div>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Annuaire ────────────────────────────────────────────────────────────────

function DirectorySkeleton() {
  return (
    <div className="plt-directory-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="plt-salon-card" style={{ pointerEvents: 'none' }}>
          <Skeleton className="h-32 w-full" />
          <div style={{ padding: '14px 16px' }}>
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

const MAX_VISIBLE_TAGS = 3;

function SalonCard({ entry, tone }: { entry: DirectoryEntry; tone: (typeof PH_TONES)[number] }) {
  const { t } = useTranslation('landing');
  const formatMoney = useMoneyFormatter();
  const visibleTags = entry.serviceTags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = entry.serviceTags.length - visibleTags.length;

  return (
    <Link to={`/salons/${entry.slug}`} className="plt-salon-card">
      <div className={`plt-salon-card-ph plt-ph ${tone}`}>
        {entry.coverImage ? <img src={entry.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={26} />}
      </div>
      <div className="plt-salon-card-body">
        <div className="name">{entry.name}</div>
        {(entry.city || entry.region) && (
          <div className="meta"><MapPin size={11} />{entry.city || entry.region}</div>
        )}
        {entry.priceRange && (
          <div className="plt-salon-card-price">{t('platform.directory.priceFrom')} {formatMoney(entry.priceRange.min)}</div>
        )}
        {visibleTags.length > 0 && (
          <div className="plt-salon-card-tags">
            {visibleTags.map((tag) => <span key={tag} className="plt-chip">{tag}</span>)}
            {extraTagCount > 0 && <span className="plt-chip more">+{extraTagCount}</span>}
          </div>
        )}
        {entry.isOpen !== null && (
          <span className={`plt-status${entry.isOpen ? ' open' : ''}`}>
            {entry.isOpen ? t('platform.directory.statusOpen') : t('platform.directory.statusClosed')}
          </span>
        )}
        <span className="plt-salon-card-cta">{t('platform.directory.cta')}<ArrowRight size={12} /></span>
      </div>
    </Link>
  );
}

function DirectorySection({
  entries, loading, error, region, q, onRegionChange, onRetry,
}: {
  entries: DirectoryEntry[]; loading: boolean; error: string | null; region: string; q: string;
  onRegionChange: (region: string) => void; onRetry: () => void;
}) {
  const { t } = useTranslation('landing');
  const filtered = useMemo(() => {
    if (!q) return entries;
    const needle = q.toLocaleLowerCase();
    return entries.filter((e) => e.name.toLocaleLowerCase().includes(needle));
  }, [entries, q]);

  return (
    <section className="plt-directory" id="annuaire">
      <div className="plt-section-head">
        <div className="left">
          <div className="eyebrow">{t('platform.directory.eyebrow')}</div>
          <h2>{t('platform.directory.title')} <em>{t('platform.directory.titleEm')}</em></h2>
        </div>
        <div className="right">
          <p>{q ? `« ${q} »` : t('platform.directory.subtitleDefault')}</p>
        </div>
      </div>

      <div className="plt-filters">
        <select value={region} onChange={(e) => onRegionChange(e.target.value)}>
          <option value="">{t('platform.hero.regionAll')}</option>
          {TUNISIA_GOVERNORATES.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        {region && <button type="button" className="plt-filter-clear" onClick={() => onRegionChange('')}>{t('platform.directory.resetFilters')}</button>}
      </div>

      {loading ? (
        <DirectorySkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          label={region || q ? t('platform.directory.emptyFiltered') : t('platform.directory.emptyDefault')}
          sub={(region || q ? t('platform.directory.emptyFilteredSub') : undefined) ?? undefined}
        />
      ) : (
        <div className="plt-directory-grid">
          {filtered.map((e, i) => <SalonCard key={e.slug} entry={e} tone={PH_TONES[i % PH_TONES.length]} />)}
        </div>
      )}
    </section>
  );
}

// ─── App mobile (accent ambre, exception BLACK BOX) ──────────────────────────

function AppDownloadSection() {
  const { t } = useTranslation('landing');
  return (
    <section className="plt-app-band" id="app">
      <div className="plt-app-content">
        <div className="eyebrow">{t('platform.app.eyebrow')}</div>
        <h2>{t('platform.app.title')} <em>{t('platform.app.titleEm')}</em></h2>
        <p>{t('platform.app.subtitle')}</p>
        <div className="plt-app-buttons">
          <a href="#" className="plt-app-btn"><Smartphone size={16} />{t('platform.app.appStore')}</a>
          <a href="#" className="plt-app-btn"><Smartphone size={16} />{t('platform.app.googlePlay')}</a>
        </div>
      </div>
      <div className="plt-app-visual"><Smartphone size={64} strokeWidth={1} /></div>
    </section>
  );
}

// ─── Pricing SaaS ────────────────────────────────────────────────────────────

interface Tier { name: string; price: number; tag?: string; features: string[]; }
const TIERS: Tier[] = [
  { name: 'Essentiel', price: 49, features: ['Fiche salon & réservation en ligne', 'Agenda & équipe jusqu\'à 3 personnes', 'Rappels SMS clients'] },
  { name: 'Croissance', price: 99, tag: 'Le plus choisi', features: ['Tout Essentiel', 'Équipe illimitée', 'Caisse & suivi stock', 'Mise en avant annuaire'] },
  { name: 'Maison', price: 179, features: ['Tout Croissance', 'Multi-emplacements', 'Statistiques avancées', 'Support prioritaire'] },
];

function PricingSection() {
  const { t } = useTranslation('landing');
  return (
    <section className="plt-pricing" id="pricing">
      <div className="plt-section-head">
        <div className="left">
          <div className="eyebrow">{t('platform.pricing.eyebrow')}</div>
          <h2>{t('platform.pricing.title')} <em>{t('platform.pricing.titleEm')}</em></h2>
        </div>
        <div className="right">
          <p>{t('platform.pricing.subtitle')}</p>
        </div>
      </div>
      <div className="plt-tiers">
        {TIERS.map((tier) => (
          <div className={`plt-tier-card${tier.tag ? ' featured' : ''}`} key={tier.name}>
            {tier.tag && <span className="plt-tier-tag">{t('platform.pricing.featuredTag')}</span>}
            <div className="plt-tier-name">{tier.name}</div>
            <div className="plt-tier-price"><span className="amount">{tier.price}</span> <span className="ccy">DT</span><span className="period">{t('platform.pricing.perMonth')}</span></div>
            <ul>
              {tier.features.map((f) => <li key={f}><Check size={13} />{f}</li>)}
            </ul>
            <a href="#" className="plt-tier-cta">{t('platform.pricing.ctaStart')}</a>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function PlatformFooter() {
  return (
    <footer className="plt-footer">
      <div className="plt-footer-top">
        <div className="brand-block">
          <div className="mark">Coiffio<span className="dot">.</span></div>
          <p>L'annuaire tunisien des salons de coiffure et de beauté — comparez, choisissez, réservez en ligne.</p>
        </div>
        <div>
          <h4>La plateforme</h4>
          <ul>
            <li><a href="#annuaire">Annuaire</a></li>
            <li><a href="#app">Application mobile</a></li>
            <li><a href="#pricing">Pour les salons</a></li>
          </ul>
        </div>
        <div>
          <h4>Compte</h4>
          <ul>
            <li><Link to="/sign-in">Se connecter</Link></li>
            <li><Link to="/register">Créer un compte</Link></li>
            <li><Link to="/book">Réserver</Link></li>
            <li><Link to="/my-account">Mes rendez-vous</Link></li>
          </ul>
        </div>
      </div>
      <div className="plt-footer-bot">
        <span>© 2026 Coiffio. Tous droits réservés.</span>
        <div className="socials">
          <a href="#" title="Instagram"><Instagram size={14} /></a>
          <a href="#" title="TikTok"><Music size={14} /></a>
          <a href="#" title="Pinterest"><Bookmark size={14} /></a>
          <a href="#" title="Mail"><Mail size={14} /></a>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export function PlatformLanding() {
  const [searchParams, setSearchParams] = useSearchParams();
  const region = searchParams.get('region') ?? '';
  const q = searchParams.get('q') ?? '';

  const { directory, directoryLoading, directoryError, fetchDirectory, sponsored, sponsoredLoading, sponsoredError, fetchSponsored } = usePlatformStore();

  useEffect(() => { void fetchDirectory(region || undefined); }, [region, fetchDirectory]);
  useEffect(() => { void fetchSponsored(); }, [fetchSponsored]);

  const updateFilters = (nextQ: string, nextRegion: string) => {
    const next = new URLSearchParams();
    if (nextQ) next.set('q', nextQ);
    if (nextRegion) next.set('region', nextRegion);
    setSearchParams(next);
  };

  return (
    <div className="plt">
      <PlatformNav />
      <HeroSection q={q} region={region} onSubmit={updateFilters} />
      <ShowcaseSection entries={sponsored} loading={sponsoredLoading} error={sponsoredError} onRetry={() => fetchSponsored()} />
      <DirectorySection
        entries={directory}
        loading={directoryLoading}
        error={directoryError}
        region={region}
        q={q}
        onRegionChange={(r) => updateFilters(q, r)}
        onRetry={() => fetchDirectory(region || undefined)}
      />
      <AppDownloadSection />
      <PricingSection />
      <PlatformFooter />
    </div>
  );
}
