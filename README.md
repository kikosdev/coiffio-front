# salon-frontend

React web app — the client-facing storefront and staff back-office for Coiffio / Maison Haire.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS (custom design tokens) |
| Routing | React Router v6 |
| State | Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Icons | Lucide React |
| Real-time | Socket.io-client |
| i18n | i18next + react-i18next |
| Date | date-fns, date-fns-tz |

---

## Running locally

```bash
cd salon-frontend
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

### Environment variables (`.env`)

```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_DEFAULT_SALON_SLUG=salon-haire
```

---

## No dummy data

All data is fetched from the live backend (`VITE_API_URL`). No mock/static data files exist in this project.

---

## Routes

### Public storefront (`/storefront`)

| Route | Screen |
|---|---|
| `/` | Landing — Hero, Services, Stylists ("Hands you'll be in"), Testimonials, Booking CTA |
| `/sign-in` | Sign in / Register split screen |
| `/register` | Account creation |
| `/book` | 4-step booking flow: Services → Stylist → Time → Confirm |
| `/my-account` | Client dashboard: Overview, Upcoming, History, Payments, Loyalty, Profile |
| `/shop` | Product storefront |

### Back-office (`/app`) — staff/owner only

| Route | Screen |
|---|---|
| `/app/overview` | Dashboard — revenue, appointments today, KPIs |
| `/app/appointments` | Appointment board |
| `/app/team` | Staff management (create, edit, leave requests) |
| `/app/schedule` | Weekly schedule view |
| `/app/services` | Service catalog management |
| `/app/clients` | Client CRM |
| `/app/stock` | Inventory |
| `/app/ventes` | POS retail sales drawer |
| `/app/finance` | Revenue, expenses, payments |
| `/app/orders` | E-commerce order management |
| `/app/settings` | Salon config, roles, business hours |
| `/app/notifications` | Notification center |

---

## Design system

**Palette (CSS tokens in `src/index.css`):**

| Token | Value | Usage |
|---|---|---|
| `--ivory` | `#f3ece0` | Page background |
| `--ink` | `#1c1612` | Body text |
| `--champagne` | `#b89968` | Gold accent, CTAs |
| `--surface` | `#faf7f2` | Card background |
| `--line` | `#e8e0d0` | Borders |
| `--muted` | `#8a7d6b` | Secondary text |
| `--error` | `#c0392b` | Error states |

**Typography:**
- Headings: Cormorant Garamond (serif / italic for editorial feel)
- UI: Inter
- Numbers/mono: JetBrains Mono

---

## Key features & state

| Store / Feature | File | Description |
|---|---|---|
| Auth | `src/shared/store/authStore.ts` | JWT + cookie auth, register, logout |
| Landing | `src/storefront/landing/landingStore.ts` | Public salon data, stylists, testimonials |
| Booking | `src/storefront/book/bookStore.ts` | 4-step booking draft |
| Team | `src/features/team/teamStore.ts` | Staff CRUD, leave requests |
| Settings | `src/features/settings/settingsStore.ts` | Salon config, roles, business hours |
| Sales / POS | `src/features/ventes/salesStore.ts` | Draft cart, discount, submit sale |
| Stock | `src/features/stock/stockStore.ts` | Products, inventory moves |
| Overview | `src/features/overview/overviewStore.ts` | Dashboard KPIs |
| Notifications | `src/shared/store/notificationStore.ts` | Real-time bell + WebSocket |

---

## Auth model

- **Login:** `POST /api/auth/login` → `{ identifier, password }` (identifier = email or phone)
- **Cookie-based:** the backend sets a `salon_token` HttpOnly cookie; all subsequent requests are automatically authenticated
- **Roles:** `owner` → full back-office access; `manager` → team + finance; `stylist`/`colorist` → own schedule + clients; `client` → storefront only
- **Register:** client accounts only. Staff accounts are created by the owner via the Team screen.

---

## Date handling rule

Never use `new Date().toISOString()` to derive a business-day string — for UTC+ timezones this returns the previous calendar day. Always use `localDateISO()` from `src/shared/date.ts`.

---

## Deployment

- **Platform:** Vercel
- **URL:** `https://coiffio-front.vercel.app`
- **Backend CORS:** the backend's `FRONTEND_ORIGIN` env var on Render must match this URL exactly (no trailing slash).
