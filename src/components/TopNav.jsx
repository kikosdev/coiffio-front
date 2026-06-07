import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SIcon from './SIcon'
import styles from './TopNav.module.css'

export default function TopNav({ signedIn }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

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

  return (
    <nav className={`${styles.nav}${open ? ' ' + styles.menuOpen : ''}`}>
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
        {signedIn ? (
          <Link to="/account" className={styles.signin}>
            <SIcon name="user-round" size={14} />
            <span>My Account</span>
          </Link>
        ) : (
          <Link to="/signin" className={styles.signin}>
            <SIcon name="user-round" size={14} />
            <span>Sign in</span>
          </Link>
        )}
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

      {/* Mobile drawer */}
      <div className={`${styles.drawer}${open ? ' ' + styles.drawerOn : ''}`} onClick={close}>
        <div className={styles.drawerPanel} onClick={e => e.stopPropagation()}>
          <div className={styles.drawerLinks}>
            <a href="#services" onClick={e => handleSection(e, 'services')}>Services</a>
            <a href="#stylists" onClick={e => handleSection(e, 'stylists')}>Stylists</a>
            <a href="#visit"    onClick={e => handleSection(e, 'visit')}>Visit us</a>
            <a href="#boutique" onClick={e => handleSection(e, 'boutique')}>Boutique</a>
            <a href="#" onClick={close}>The Journal</a>
          </div>
          <div className={styles.drawerFoot}>
            {signedIn ? (
              <Link to="/account" className={styles.drawerSecondary} onClick={close}>
                <SIcon name="user-round" size={15} /><span>My account</span>
              </Link>
            ) : (
              <Link to="/signin" className={styles.drawerSecondary} onClick={close}>
                <SIcon name="user-round" size={15} /><span>Sign in</span>
              </Link>
            )}
            <Link to="/book" className={styles.book} onClick={close} style={{ justifyContent: 'center', padding: '15px 22px', fontSize: 14 }}>
              Book a visit
              <SIcon name="arrow-right" size={13} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
