import { Link } from 'react-router-dom'
import SIcon from './SIcon'
import styles from './SiteFooter.module.css'

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brandBlock}>
          <div className={styles.mark}>Haire<span className={styles.dot}>.</span></div>
          <p>Maison du Cheveu — a co-ed luxury salon in the 4th arrondissement of Paris, blending classical craft with contemporary technique since 2014.</p>
        </div>
        <div>
          <h4>The Salon</h4>
          <ul>
            <li><a href="/#services">Services</a></li>
            <li><a href="/#stylists">The team</a></li>
            <li><a href="#">Our story</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4>Visit</h4>
          <ul>
            <li><a href="/#visit">18 rue de Sévigné</a></li>
            <li><a href="#">+33 1 42 78 90 14</a></li>
            <li><a href="#">salon@haire.paris</a></li>
            <li><a href="#">Gift cards</a></li>
            <li><a href="#">Reach us</a></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/signin">Sign in</Link></li>
            <li><Link to="/signin">Create account</Link></li>
            <li><Link to="/book">Book a visit</Link></li>
            <li><Link to="/account">My visits</Link></li>
            <li><a href="#">Loyalty programme</a></li>
          </ul>
        </div>
      </div>
      <div className={styles.bot}>
        <span>© 2026 Maison Haire. All rights reserved. · <a href="#" style={{ color: 'inherit' }}>Privacy</a> · <a href="#" style={{ color: 'inherit' }}>Terms</a></span>
        <div className={styles.socials}>
          <a href="#" title="Instagram"><SIcon name="instagram" size={14} /></a>
          <a href="#" title="TikTok"><SIcon name="music" size={14} /></a>
          <a href="#" title="Pinterest"><SIcon name="bookmark" size={14} /></a>
          <a href="#" title="Mail"><SIcon name="mail" size={14} /></a>
        </div>
      </div>
    </footer>
  )
}
