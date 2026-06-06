import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import SiteFooter from '../components/SiteFooter'
import SIcon from '../components/SIcon'
import styles from './Landing.module.css'

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroLeft}>
        <div className={styles.heroEyebrow}>Paris · Le Marais · Est. 2014</div>
        <h1 className={styles.heroH1}>
          <span className={styles.line}>A salon</span>
          <span className={styles.indent}>that <em>listens</em></span>
          <span className={styles.line}>before it cuts.</span>
        </h1>
        <p className={styles.heroP}>Maison Haire is a co-ed luxury salon in the heart of Le Marais. We craft cuts, colour, and rituals that fall well — every morning, on their own.</p>
        <div className={styles.heroActions}>
          <Link to="/book" className={styles.bookBtn}>
            Reserve a visit
            <SIcon name="arrow-right" size={14} />
          </Link>
          <a href="#paths" className={styles.heroSecondary}>
            <span>Discover the experience</span>
            <SIcon name="arrow-down-right" size={14} />
          </a>
        </div>
        <div className={styles.heroMarquee}>
          <div className={styles.statMini}>
            <div className={styles.statV}><em>12</em> yrs</div>
            <div className={styles.statL}>Open in Le Marais</div>
          </div>
          <div className={styles.statMini}>
            <div className={styles.statV}>4 <em>+1</em></div>
            <div className={styles.statL}>Master stylists</div>
          </div>
          <div className={styles.statMini}>
            <div className={styles.statV}>8 200<em>+</em></div>
            <div className={styles.statL}>Loyal clients</div>
          </div>
        </div>
      </div>
      <div className={styles.heroRight}>
        <div className={`ph ph-3 ${styles.heroPh}`} />
        <div className={styles.heroVignette} />
        <div className={styles.heroNoise} />
        <div className={styles.heroTag}>
          <div className={styles.heroTagEyebrow}>House signature</div>
          <div className={styles.heroTagTitle}>The <em>Balayage</em> Couture</div>
          <div className={styles.heroTagMeta}>Hand-painted · 2h 30m · from €240</div>
        </div>
      </div>
    </section>
  )
}

function PathsSection() {
  return (
    <section className={styles.sectionPaths} id="paths">
      <div className={styles.pathsIntro}>
        <div className={`${styles.heroEyebrow} ${styles.centeredEyebrow}`}>Two ways to book</div>
        <h2 className={styles.pathsH2}>
          Pick your <em>appointment</em>.
        </h2>
        <p className={styles.pathsLead}>
          Reserve in two clicks as a guest, or open an account and earn back a portion of every visit toward a future ritual.
        </p>
      </div>

      <div className={styles.pathsGrid}>
        <Link to="/signin" className={`${styles.pathCard} ${styles.pathCardDark}`}>
          <div className={styles.pcNum}>— I.</div>
          <h3 className={styles.pcH3}>Become a <em>member</em>, save 8% on every visit.</h3>
          <p className={styles.pcP}>An account remembers your formula, your stylist, and your preferences. Earn loyalty points, unlock private events, and book with one tap.</p>
          <ul className={styles.pcList}>
            <li><SIcon name="gem" size={14} /> 8% back on services &amp; retail</li>
            <li><SIcon name="calendar-clock" size={14} /> Stored stylist, formula &amp; history</li>
            <li><SIcon name="bell" size={14} /> First access to new openings</li>
            <li><SIcon name="gift" size={14} /> Birthday glossing on the house</li>
          </ul>
          <div className={styles.pcCta}>
            Create an account
            <span className={styles.pcArrow}><SIcon name="arrow-right" size={14} /></span>
          </div>
        </Link>

        <Link to="/book" className={styles.pathCard}>
          <div className={styles.pcNum}>— II.</div>
          <h3 className={styles.pcH3}>Book in two <em>clicks</em>, no account needed.</h3>
          <p className={styles.pcP}>Pick a service, pick a stylist, pick a time. We'll text you a confirmation. Decide later if you'd like to join the maison.</p>
          <ul className={styles.pcList}>
            <li><SIcon name="zap" size={14} /> Live availability across stylists</li>
            <li><SIcon name="user-x" size={14} /> No password, no account</li>
            <li><SIcon name="message-square" size={14} /> SMS reminder 24h before</li>
            <li><SIcon name="credit-card" size={14} /> No payment until you arrive</li>
          </ul>
          <div className={styles.pcCta}>
            Book as guest
            <span className={styles.pcArrow}><SIcon name="arrow-right" size={14} /></span>
          </div>
        </Link>
      </div>
    </section>
  )
}

function ServicesSection() {
  const tiles = [
    { cat: 'I · The Cut',     title: <>The <em>Signature</em></>,   tone: 'ph-2', dur: '60 min',   from: 78  },
    { cat: 'II · The Colour', title: <>The <em>Balayage</em></>,    tone: 'ph-3', dur: '2h 30m',   from: 240 },
    { cat: 'III · The Groom', title: <>The <em>Royal Shave</em></>, tone: 'ph-7', dur: '45 min',   from: 75  },
    { cat: 'IV · The Ritual', title: <>The <em>Scalp Spa</em></>,   tone: 'ph-5', dur: '60 min',   from: 110 },
    { cat: 'V · The Bond',    title: <>The <em>Olaplex</em></>,     tone: 'ph-4', dur: '45 min',   from: 95  },
    { cat: 'VI · The Finish', title: <>The <em>Blowout</em></>,     tone: 'ph-6', dur: '45 min',   from: 75  },
  ]
  return (
    <section className={styles.section} id="services">
      <div className={styles.sectionHead}>
        <div className={styles.sectionLeft}>
          <div className={styles.eyebrow}>The Carte</div>
          <h2 className={styles.sectionH2}>Six <em>rituals</em>, one common thread: yours.</h2>
        </div>
        <div className={styles.sectionRight}>
          <p>A curated menu spanning cuts, colour, men's grooming, and treatments. Every service is performed by a senior or master stylist.</p>
          <Link to="/book" className={styles.heroSecondary} style={{ marginTop: 14, display: 'inline-flex' }}>
            <span>See full menu</span>
            <SIcon name="arrow-up-right" size={14} />
          </Link>
        </div>
      </div>
      <div className={styles.svcsGrid}>
        {tiles.map((t, i) => (
          <Link key={i} to="/book" className={styles.svcTile}>
            <div className={`ph ${t.tone} ${styles.svcPh}`} />
            <div className={styles.svcOverlay} />
            <span className={styles.svcLabel}>{t.cat}</span>
            <h3 className={styles.svcH3}>{t.title}</h3>
            <div className={styles.svcMeta}>
              <span>{t.dur}</span>
              <span className={styles.svcPrice}>€{t.from}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function StylistsSection() {
  const team = [
    { name: 'Léa Dubois',   role: 'Master Colourist',    tone: 'ph-3', tag: 'Master', next: 'Tomorrow · 14:30' },
    { name: 'Marcus Voss',  role: "Men's Grooming Lead",  tone: 'ph-7', tag: 'Senior', next: 'Today · 16:00' },
    { name: 'Théo Roux',    role: 'Senior Stylist',       tone: 'ph-2', tag: 'Senior', next: 'Thu · 11:30' },
    { name: 'Nadia Hassan', role: 'Treatment Specialist',  tone: 'ph-5', tag: 'Master', next: 'Today · 15:00' },
  ]
  return (
    <section className={`${styles.section} ${styles.sectionStylists}`} id="stylists">
      <div className={styles.sectionHead}>
        <div className={styles.sectionLeft}>
          <div className={styles.eyebrow}>The Team</div>
          <h2 className={styles.sectionH2}>The hands you'll be in, and <em>why</em>.</h2>
        </div>
        <div className={styles.sectionRight}>
          <p>A small, deliberately tight team. Each stylist holds a specialty — choose by ritual, or let our concierge match you.</p>
        </div>
      </div>
      <div className={styles.stylistRow}>
        {team.map((s, i) => (
          <Link to="/book" className={styles.stylistTile} key={i}>
            <div className={styles.portrait}>
              <div className={`ph ${s.tone} ${styles.portraitPh}`} />
              <div className={styles.portraitInit}>{s.name[0]}</div>
              <div className={styles.portraitTag}>{s.tag}</div>
            </div>
            <div className={styles.stylistName}>{s.name.split(' ')[0]} <em>{s.name.split(' ')[1]}</em></div>
            <div className={styles.stylistRole}>{s.role}</div>
            <div className={styles.stylistLinks}>
              <span className={styles.stylistBook}>Book with {s.name.split(' ')[0]}</span>
              <span className={styles.stylistNext}>Next: <strong>{s.next}</strong></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function EditorialSection() {
  return (
    <section className={styles.sectionEditorial}>
      <div className={styles.editorialImg}>
        <div className={`ph ph-2 ${styles.editorialPh}`} />
        <div className={styles.editorialBadge}>House<br />signature<br />est. 2014</div>
      </div>
      <div className={styles.editorialText}>
        <div className={styles.editorialEyebrow}>The philosophy</div>
        <h2 className={styles.editorialH2}>Hair that falls <em>well</em>, every morning.</h2>
        <p>We believe a great cut should require almost nothing from you the next day. We design the line, the weight, and the fall to your features and your lifestyle — not to a magazine.</p>
        <p>Every visit begins with a 10-minute consultation. Every formula is recorded. Every stylist on our floor has trained in Paris, Tokyo, or London — and continues to.</p>
        <div className={styles.editorialQuote}>
          <q>Haire is the rare place where I leave looking like myself, only sharper. I've recommended Léa to half my friends.</q>
          <div className={styles.editorialAttr}>— Vogue Paris · 2025</div>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = [
    { q: 'I have moved through five colourists in this city. Léa is the one I have stayed with. She listens, she remembers, and the work is impeccable.', name: 'Aurélie Z.', meta: 'Client since 2019' },
    { q: 'Marcus is the only person I let near my beard. The hot-towel ritual alone is worth the visit — the cut is just a bonus.', name: 'Dr. Faure', meta: 'Client since 2021' },
    { q: 'Booking, paying, rebooking — every part of the experience feels considered. It is the only salon in Paris that feels like a maison.', name: 'Camille O.', meta: 'Bridal client, 2024' },
  ]
  return (
    <section className={`${styles.section} ${styles.sectionTestimonials}`}>
      <div className={styles.sectionHead}>
        <div className={styles.sectionLeft}>
          <div className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Said about us</div>
          <h2 className={`${styles.sectionH2} ${styles.sectionH2Light}`}>Care, made <em>obvious</em>.</h2>
        </div>
        <div className={styles.sectionRight}>
          <p className={styles.testiLead}>What our clients tell us, and what the press has had the kindness to write.</p>
        </div>
      </div>
      <div className={styles.testiGrid}>
        {testimonials.map((t, i) => (
          <div className={styles.testi} key={i}>
            <div className={styles.testiQuoteMark}>"</div>
            <q className={styles.testiQ}>{t.q}</q>
            <div className={styles.testiWho}>
              <div className={styles.testiAv}>{t.name[0]}</div>
              <div>
                <div className={styles.testiName}>{t.name}</div>
                <div className={styles.testiMeta}>{t.meta}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function VisitSection() {
  return (
    <section className={styles.sectionVisit} id="visit">
      <div className={styles.visitInfo}>
        <div className={styles.heroEyebrow}>Visit us</div>
        <h2 className={styles.visitH2}>18 rue de <em>Sévigné</em>, Paris IV.</h2>
        <p className={styles.visitP}>
          Between Place des Vosges and Saint-Paul. Two minutes from metro Saint-Paul (line 1). Park your bike at the door.
        </p>
        <div className={styles.visitMeta}>
          <div className={styles.vm}>
            <div className={styles.vmLbl}>Hours</div>
            <div className={styles.vmVal}>Tue–Sat<br /><em>10:00 — 20:00</em></div>
          </div>
          <div className={styles.vm}>
            <div className={styles.vmLbl}>Telephone</div>
            <div className={styles.vmVal}>+33 1 42 <em>78 90 14</em></div>
          </div>
          <div className={styles.vm}>
            <div className={styles.vmLbl}>Email</div>
            <div className={styles.vmVal}>salon<em>@haire.paris</em></div>
          </div>
          <div className={styles.vm}>
            <div className={styles.vmLbl}>Walk-ins</div>
            <div className={styles.vmVal}>Tuesdays after <em>15:00</em></div>
          </div>
        </div>
        <Link to="/book" className={styles.bookBtn} style={{ padding: '14px 26px', fontSize: 14 }}>
          Reserve a visit
          <SIcon name="arrow-right" size={14} />
        </Link>
      </div>
      <div className={styles.visitMap}>
        <div className={`ph ph-7 ${styles.visitMapPh}`} />
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
        <div className={styles.mapPin}>
          <div className={styles.mapPinPulse} />
          <div className={styles.mapPinDot} />
        </div>
        <div className={styles.mapLabel}>Maison Haire</div>
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
      <TopNav />
      <HeroSection />
      <PathsSection />
      <ServicesSection />
      <StylistsSection />
      <EditorialSection />
      <TestimonialsSection />
      <VisitSection />
      <SiteFooter />
    </div>
  )
}
