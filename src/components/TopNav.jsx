import { Link, useNavigate } from 'react-router-dom'
import SIcon from './SIcon'
import styles from './TopNav.module.css'

export default function TopNav({ signedIn }) {
  const navigate = useNavigate()

  function handleSection(e, id) {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/#' + id)
    }
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
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
      </div>
    </nav>
  )
}
