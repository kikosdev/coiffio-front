import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import SIcon from './SIcon'
import styles from './TopNav.module.css'

const STAFF_ROLES = ['owner', 'supervisor', 'staff']

export default function TopNav({ signedIn, role }) {
  const isStaff = signedIn && STAFF_ROLES.includes(role)
  const authHref  = !signedIn ? '/signin'   : isStaff ? '/dashboard' : '/account'
  const authLabel = !signedIn ? 'Sign in'   : isStaff ? 'Dashboard'  : 'My Account'
  const navigate = useNavigate()
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  function handleSection(e, id) {
    e.preventDefault()
    close()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/#' + id)
    }
  }

  const navCls = [
    styles.nav,
    scrolled ? styles.scrolled : '',
    open     ? styles.menuOpen : '',
  ].filter(Boolean).join(' ')

  /* The drawer is portalled to document.body so that the nav's
     backdrop-filter stacking context cannot clip it. */
  const drawer = createPortal(
    <div className={`${styles.drawer}${open ? ' ' + styles.drawerOn : ''}`} onClick={close}>
      <div className={styles.drawerPanel} onClick={e => e.stopPropagation()}>
        <button className={styles.drawerClose} onClick={close} aria-label="Fermer le menu">
          <SIcon name="x" size={20} strokeWidth={1.6} />
        </button>
        <div className={styles.drawerLinks}>
          <a href="#services" onClick={e => handleSection(e, 'services')}>Services</a>
          <a href="#stylists" onClick={e => handleSection(e, 'stylists')}>Stylists</a>
          <a href="#visit"    onClick={e => handleSection(e, 'visit')}>Visit us</a>
          <a href="#boutique" onClick={e => handleSection(e, 'boutique')}>Boutique</a>
          <a href="#" onClick={close}>The Journal</a>
        </div>
        <div className={styles.drawerFoot}>
          <Link to={authHref} className={styles.drawerSecondary} onClick={close}>
            <SIcon name="user-round" size={15} /><span>{authLabel}</span>
          </Link>
          <Link to="/book" className={styles.book} onClick={close} style={{ justifyContent: 'center', padding: '15px 22px', fontSize: 14 }}>
            Book a visit
            <SIcon name="arrow-right" size={13} />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  )

  return (
    <>
      <nav className={navCls}>
        <Link to="/" className={styles.brand} onClick={close}>
          <span className={styles.mark}>Haire</span>
          <span className={styles.dot} />
          <span className={styles.sub}>Maison du Cheveu</span>
        </Link>

        <div className={styles.links}>
          <a href="#services" onClick={e => handleSection(e, 'services')}>Services</a>
          <a href="#stylists" onClick={e => handleSection(e, 'stylists')}>Stylists</a>
          <a href="#visit"    onClick={e => handleSection(e, 'visit')}>Visit us</a>
          <a href="#boutique" onClick={e => handleSection(e, 'boutique')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SIcon name="shopping-bag" size={14} strokeWidth={1.4} />
            Boutique
          </a>
          <a href="#" className={styles.ctaText} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>The Journal</span>
            <SIcon name="arrow-up-right" size={12} strokeWidth={1.4} />
          </a>
        </div>

        <div className={styles.right}>
          <span className={styles.locale}>EN · €</span>
          <Link to={authHref} className={styles.signin}>
            <SIcon name="user-round" size={14} />
            <span>{authLabel}</span>
          </Link>
          <Link to="/book" className={styles.book}>
            Book a visit
            <SIcon name="arrow-right" size={13} />
          </Link>
          <button
            className={styles.burger}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            <SIcon name={open ? 'x' : 'menu'} size={22} strokeWidth={1.6} />
          </button>
        </div>
      </nav>

      {drawer}
    </>
  )
}
