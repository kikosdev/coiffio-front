import { useEffect, useState, type ReactNode } from 'react';
import './landing.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, ArrowDownRight, ArrowUpRight, Gem, CalendarClock, Bell, Gift, Zap, UserX,
  MessageSquare, CreditCard, ShoppingBag, UserRound, Menu, X, Instagram, Music, Bookmark, Mail,
} from 'lucide-react';
import { useLandingStore, type PublicService, type PublicStylist, type PublicTestimonial, type LandingContent, type LandingStats, type SignatureService, type SalonContact, type SalonHours } from './landingStore';
import { LanguageSwitcher } from '@/shared/i18n/LanguageSwitcher';
import { useMoneyFormatter } from '@/utils/money';

/**
 * Landing publique "Maison Haire" — données 100% dynamiques via /public/salons/:slug.
 * Styles dans ./landing.css (scopés sous .lp).
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TONES = ['ph-2', 'ph-3', 'ph-7', 'ph-5', 'ph-4', 'ph-6'] as const;

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

function serviceTitle(name: string): ReactNode {
  const parts = name.split(' ');
  if (parts.length < 2) return <>{name}</>;
  const head = parts.slice(0, -1).join(' ');
  const tail = parts[parts.length - 1];
  return <>{head} <em>{tail}</em></>;
}

// ─── Components ──────────────────────────────────────────────────────────────

function BrandMark() {
  return (
    <Link to="/" className="tn-brand">
      <span className="mark" style={{ fontSize: 28 }}>Haire</span>
      <span className="dot" />
      <span className="sub">Maison du Cheveu</span>
    </Link>
  );
}

function TopNav() {
  const { t } = useTranslation('landing');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  const close = () => setOpen(false);

  return (
    <nav className={`top-nav${open ? ' menu-open' : ''}`}>
      <BrandMark />
      <div className="tn-links">
        <a href="#services">{t('nav.services')}</a>
        <a href="#stylists">{t('nav.stylists')}</a>
        <a href="#visit">{t('nav.visitUs')}</a>
        <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShoppingBag size={14} strokeWidth={1.4} /> {t('nav.boutique')}
        </Link>
        <a href="#" className="cta-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{t('nav.journal')}</span>
          <ArrowUpRight size={12} strokeWidth={1.4} />
        </a>
      </div>
      <div className="tn-right">
        <LanguageSwitcher variant="inline" />
        <Link to="/sign-in" className="tn-signin">
          <UserRound size={14} />
          <span>{t('nav.signIn')}</span>
        </Link>
        <Link to="/book" className="tn-book">
          {t('nav.bookVisit')}
          <ArrowRight size={13} />
        </Link>
        <button
          className="tn-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
        </button>
      </div>

      <div className={`tn-drawer${open ? ' on' : ''}`} onClick={close}>
        <div className="tn-drawer-panel" onClick={(e) => e.stopPropagation()}>
          <div className="tn-drawer-links">
            <a href="#services" onClick={close}>{t('nav.services')}</a>
            <a href="#stylists" onClick={close}>{t('nav.stylists')}</a>
            <a href="#visit" onClick={close}>{t('nav.visitUs')}</a>
            <Link to="/shop" onClick={close}>{t('nav.boutique')}</Link>
            <a href="#" onClick={close}>{t('nav.journal')}</a>
          </div>
          <div className="tn-drawer-foot">
            <Link to="/sign-in" className="tn-drawer-secondary">
              <UserRound size={15} /><span>{t('nav.signIn')}</span>
            </Link>
            <Link to="/book" className="tn-book">
              {t('nav.bookVisit')}
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ landing, stats }: { landing: LandingContent | null; stats: LandingStats | null; signature: SignatureService | null; }) {
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-eyebrow">{landing?.eyebrow || 'Paris · Le Marais'}</div>
        <h1>
          <span className="line">{landing?.headlineLine1 || 'A salon'}</span>
          <span className="indent">that <em>{landing?.headlineEmphasis || 'listens'}</em></span>
          <span className="line">{landing?.headlineLine2 || 'before it cuts.'}</span>
        </h1>
        {landing?.heroParagraph && (
          <p>{landing.heroParagraph}</p>
        )}
        <div className="hero-actions">
          <Link to="/book" className="tn-book">
            Reserve a visit
            <ArrowRight size={14} />
          </Link>
          <a href="#paths" className="hero-secondary">
            <span>Discover the experience</span>
            <ArrowDownRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

function PathsSection() {
  return (
    <section className="section-paths" id="paths">
      <div style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto 56px' }}>
        <div className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: 18 }}>
          <span>Two ways to book</span>
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 60, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.02, margin: 0 }}>
          Pick your <em style={{ fontStyle: 'italic', color: 'var(--champagne-deep)', fontWeight: 400 }}>appointment</em>.
        </h2>
        <p style={{ marginTop: 14, color: 'var(--muted)', fontSize: 14, maxWidth: 480, margin: '14px auto 0', lineHeight: 1.55 }}>
          Reserve in two clicks as a guest, or open an account and earn back a portion of every visit toward a future ritual.
        </p>
      </div>

      <div className="paths-grid">
        <Link to="/sign-in" className="path-card dark">
          <div className="pc-num">— I.</div>
          <h3>Become a <em>member</em>, save 8% on every visit.</h3>
          <p>An account remembers your formula, your stylist, and your preferences. Earn loyalty points, unlock private events, and book with one tap.</p>
          <ul className="pc-list">
            <li><Gem size={14} /> 8% back on services & retail</li>
            <li><CalendarClock size={14} /> Stored stylist, formula & history</li>
            <li><Bell size={14} /> First access to new openings</li>
            <li><Gift size={14} /> Birthday glossing on the house</li>
          </ul>
          <div className="pc-cta">
            Create an account
            <span className="pc-arrow"><ArrowRight size={14} /></span>
          </div>
        </Link>
        <Link to="/book" className="path-card">
          <div className="pc-num">— II.</div>
          <h3>Book in two <em>clicks</em>, no account needed.</h3>
          <p>Pick a service, pick a stylist, pick a time. We'll text you a confirmation. Decide later if you'd like to join the maison.</p>
          <ul className="pc-list">
            <li><Zap size={14} /> Live availability across stylists</li>
            <li><UserX size={14} /> No password, no account</li>
            <li><MessageSquare size={14} /> SMS reminder 24h before</li>
            <li><CreditCard size={14} /> No payment until you arrive</li>
          </ul>
          <div className="pc-cta">
            Book as guest
            <span className="pc-arrow"><ArrowRight size={14} /></span>
          </div>
        </Link>
      </div>
    </section>
  );
}

function ServicesSkeleton() {
  return (
    <div className="svcs-grid">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="svc-tile" style={{ opacity: 0.4, pointerEvents: 'none' }}>
          <div className="ph ph-2" style={{ filter: 'grayscale(0.8)' }} />
        </div>
      ))}
    </div>
  );
}

function ServicesSection({ services, loading }: { services: PublicService[]; loading: boolean; }) {
  const formatMoney = useMoneyFormatter();
  return (
    <section className="section" id="services">
      <div className="section-head">
        <div className="left">
          <div className="eyebrow">The Carte</div>
          <h2>Six <em>rituals</em>, one common thread: yours.</h2>
        </div>
        <div className="right">
          <p>A curated menu spanning cuts, colour, men's grooming, and treatments. Every service is performed by a senior or master stylist.</p>
          <Link to="/book" className="hero-secondary" style={{ marginTop: 14, display: 'inline-flex' }}>
            <span>See full menu</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      {loading && !services.length ? (
        <ServicesSkeleton />
      ) : (
        <div className="svcs-grid">
          {services.map((svc, i) => (
            <Link key={svc._id} to="/book" className="svc-tile">
              <div className={`ph ${TONES[i % TONES.length]}`} />
              <div className="overlay" />
              <span className="label">{svc.category}</span>
              <h3>{serviceTitle(svc.name)}</h3>
              <div className="meta">
                <span>{fmtDuration(svc.durationMin)}</span>
                <span className="price">{formatMoney(svc.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function StylistsSkeleton() {
  return (
    <div className="stylist-row">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="stylist-tile" style={{ opacity: 0.35, pointerEvents: 'none' }}>
          <div className="portrait"><div className="ph ph-2" style={{ filter: 'grayscale(0.8)' }} /></div>
        </div>
      ))}
    </div>
  );
}

const STYLIST_TONES = ['ph-3', 'ph-7', 'ph-2', 'ph-5', 'ph-4', 'ph-6'] as const;

function StylistsSection({ team, loading }: { team: PublicStylist[]; loading: boolean; }) {
  return (
    <section className="section section-stylists" id="stylists">
      <div className="section-head">
        <div className="left">
          <div className="eyebrow">The Team</div>
          <h2>The hands you'll be in, and <em>why</em>.</h2>
        </div>
        <div className="right">
          <p>A small, deliberately tight team. Each stylist holds a specialty — choose by ritual, or let our concierge match you.</p>
        </div>
      </div>
      {loading && !team.length ? (
        <StylistsSkeleton />
      ) : (
        <div className="stylist-row">
          {team.map((s, i) => {
            const [first, ...rest] = s.name.split(' ');
            const last = rest.join(' ');
            return (
              <Link to="/book" className="stylist-tile" key={s._id}>
                <div className="portrait">
                  <div className={`ph ${STYLIST_TONES[i % STYLIST_TONES.length]}`} />
                  <div className="init">{s.name[0]}</div>
                  <div className="tag">{s.seniorityTag}</div>
                </div>
                <div className="name">{first} <em>{last}</em></div>
                <div className="role">{s.publicTitle || s.role}</div>
                <div className="links">
                  <span className="book">Book with {first}</span>
                  {s.nextSlot ? (
                    <span className="next">Next: <strong>{s.nextSlot}</strong></span>
                  ) : (
                    <span className="next">See availability</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EditorialSection({ landing }: { landing: LandingContent | null; }) {
  const title = landing?.philosophyTitle || 'Hair that falls well, every morning.';
  const parts = title.split(/,\s*/);
  const paras = landing?.philosophyParagraphs ?? [];
  const pressQuote = landing?.pressQuote;
  const pressAttr = landing?.pressAttribution;

  return (
    <section className="section-editorial">
      <div className="editorial-img">
        <div className="ph ph-2" />
        <div className="badge">House<br />signature<br />est. 2014</div>
      </div>
      <div className="editorial-text">
        <div className="eyebrow">The philosophy</div>
        <h2>
          {parts[0]}
          {parts.length > 1 && <>, <em>{parts.slice(1).join(', ')}</em></>}
        </h2>
        {paras.map((p, i) => <p key={i}>{p}</p>)}
        {pressQuote && (
          <div className="editorial-quote">
            <q>{pressQuote}</q>
            {pressAttr && <div className="attr">{pressAttr}</div>}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="testi-grid">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="testi" style={{ opacity: 0.3 }}>
          <div className="quote-mark">"</div>
        </div>
      ))}
    </div>
  );
}

function TestimonialsSection({ testimonials, loading }: { testimonials: PublicTestimonial[]; loading: boolean; }) {
  return (
    <section className="section section-testimonials">
      <div className="section-head">
        <div className="left">
          <div className="eyebrow" style={{ color: 'var(--champagne)' }}>Said about us</div>
          <h2>Care, made <em>obvious</em>.</h2>
        </div>
        <div className="right">
          <p>What our clients tell us, and what the press has had the kindness to write.</p>
        </div>
      </div>
      {loading && !testimonials.length ? (
        <TestimonialsSkeleton />
      ) : (
        <div className="testi-grid">
          {testimonials.map((x) => (
            <div className="testi" key={x._id}>
              <div className="quote-mark">"</div>
              <q>{x.quote}</q>
              <div className="who">
                <div className="av">{x.authorName[0]}</div>
                <div>
                  <div className="name">{x.authorName}</div>
                  <div className="meta">{x.authorMeta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function VisitSection({ contact, hours }: { contact: SalonContact | null; hours: SalonHours[]; }) {
  const addr = contact?.addressLine || '';
  const addrParts = addr.split(',');
  const addrStreet = addrParts[0]?.trim() || '';
  const addrCity = addrParts.slice(1).join(',').trim();

  return (
    <section className="section-visit" id="visit">
      <div className="visit-info">
        <div className="hero-eyebrow">Visit us</div>
        <h2>
          {addrStreet ? (
            <>
              {addrStreet.split(' ').slice(0, -1).join(' ')}{' '}
              <em>{addrStreet.split(' ').slice(-1)}</em>
              {addrCity ? `, ${addrCity}.` : '.'}
            </>
          ) : (
            'Find us'
          )}
        </h2>
        {contact?.addressNote && (
          <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6, maxWidth: 480, marginTop: 0 }}>
            {contact.addressNote}
          </p>
        )}
        <div className="visit-meta">
          {hours.map((h, i) => (
            <div className="vm" key={i}>
              <div className="lbl">Hours</div>
              <div className="val">{h.label}<br /><em>{h.range}</em></div>
            </div>
          ))}
          {contact?.phone && (
            <div className="vm">
              <div className="lbl">Telephone</div>
              <div className="val">
                {contact.phone.split(' ').slice(0, 2).join(' ')}{' '}
                <em>{contact.phone.split(' ').slice(2).join(' ')}</em>
              </div>
            </div>
          )}
          {contact?.email && (
            <div className="vm">
              <div className="lbl">Email</div>
              <div className="val">
                {contact.email.split('@')[0]}<em>@{contact.email.split('@')[1]}</em>
              </div>
            </div>
          )}
          {contact?.walkIns && (
            <div className="vm">
              <div className="lbl">Walk-ins</div>
              <div className="val">
                {contact.walkIns.replace(/after\s+\S+/, 'after ')}
                <em>{contact.walkIns.match(/after\s+(\S+)/)?.[1] ?? ''}</em>
              </div>
            </div>
          )}
        </div>
        <Link to="/book" className="tn-book" style={{ padding: '14px 26px', fontSize: 14 }}>
          Reserve a visit
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="visit-map">
        <div className="ph ph-7" />
        <svg viewBox="0 0 400 450" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, opacity: 0.4 }}>
          <defs>
            <pattern id="streetGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(243,236,224,.18)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="450" fill="url(#streetGrid)" />
          <path d="M 0 200 L 400 220" stroke="rgba(243,236,224,.35)" strokeWidth="2" />
          <path d="M 180 0 L 200 450" stroke="rgba(243,236,224,.35)" strokeWidth="2" />
          <path d="M 0 320 Q 200 280 400 320" stroke="rgba(184,153,104,.4)" strokeWidth="1" fill="none" />
        </svg>
        <div className="pin"><div className="pulse" /><div className="dot" /></div>
        <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, 18px)', zIndex: 3, background: 'var(--surface)', padding: '8px 14px', borderRadius: 'var(--radius)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink)', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}>
          Maison Haire
        </div>
      </div>
    </section>
  );
}

function SiteFooter({ contact }: { contact: SalonContact | null; }) {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-top">
        <div className="brand-block">
          <div className="mark">Haire<span className="dot">.</span></div>
          <p>Maison du Cheveu — a co-ed luxury salon in the 4th arrondissement of Paris, blending classical craft with contemporary technique since 2014.</p>
        </div>
        <div>
          <h4>The Salon</h4>
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#stylists">The team</a></li>
            <li><a href="#">Our story</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4>Visit</h4>
          <ul>
            <li><a href="#visit">{contact?.addressLine || '18 rue de Sévigné'}</a></li>
            {contact?.phone && <li><a href={`tel:${contact.phone}`}>{contact.phone}</a></li>}
            {contact?.email && <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
            <li><a href="#">Gift cards</a></li>
            <li><a href="#">Reach us</a></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/sign-in">Sign in</Link></li>
            <li><Link to="/register">Create account</Link></li>
            <li><Link to="/book">Book a visit</Link></li>
            <li><Link to="/my-account">My visits</Link></li>
            <li><a href="#">Loyalty programme</a></li>
          </ul>
        </div>
      </div>
      <div className="lp-footer-bot">
        <span>© 2026 Maison Haire. All rights reserved. · <a href="#" style={{ color: 'inherit' }}>Privacy</a> · <a href="#" style={{ color: 'inherit' }}>Terms</a></span>
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

// ─── Root ─────────────────────────────────────────────────────────────────────

export function Landing() {
  const { loading, landing, stats, signature, contact, hours, services, team, testimonials, fetchLanding } = useLandingStore();

  useEffect(() => { fetchLanding(); }, [fetchLanding]);

  return (
    <div className="lp">
      <TopNav />
      <HeroSection landing={landing} stats={stats} signature={signature} />
      <PathsSection />
      <ServicesSection services={services} loading={loading} />
      <StylistsSection team={team} loading={loading} />
      <EditorialSection landing={landing} />
      <TestimonialsSection testimonials={testimonials} loading={loading} />
      <VisitSection contact={contact} hours={hours} />
      <SiteFooter contact={contact} />
    </div>
  );
}
