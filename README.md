# PlayerHaat — Website (Player & Recruiter Web Platform + Public SEO)

Next.js (App Router) web platform for **Players** and **Recruiters**, plus public SEO pages for PlayerHaat — Bangladesh's grassroots sports platform connecting village to city talent.

- **Stack**: Next.js 15 (App Router) + TypeScript (strict) + Tailwind CSS + shadcn/ui (Radix) + TanStack Query + Framer Motion.
- **Localization**: Bilingual (`next-intl`) with English (`/en/...`) and Bengali (`/bn/...`), Hind Siliguri font with typography scale and Bangla numerals.
- **Mobile-first Design**: On mobile devices (`<768px`), 1:1 parity with the Flutter mobile app (Apple-style collapsible large-title bar, frosted glass bottom tab bar, sheets, haptic-feel pressables). On desktop (`>=768px`), responsive centered layout with frosted side navigation, multi-column grids, and modal dialogs.
- **Session Security**: Strictly in-memory access token, `httpOnly, Secure, SameSite=Lax` refresh cookie with CSRF double-submit protection, and silent refresh on expiration or 401.
- **No Admin Code**: Super Admin and Admin functionality live strictly in `../admin`. Admin logins here are blocked with a redirection notice.

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- pnpm 9+
- Backend API running (`http://localhost:4000/api/v1`) from `../server`

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Run Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `pnpm run dev` | Starts local Next.js dev server on port 3000 |
| `build` | `pnpm run build` | Compiles optimized production standalone build |
| `start` | `pnpm run start` | Runs standalone server locally |
| `typecheck` | `pnpm run typecheck` | Validates TypeScript types (`tsc --noEmit`) |
| `test` | `pnpm test` | Runs unit & integration test suites (Vitest) |
| `test:e2e` | `pnpm run test:e2e` | Runs Playwright end-to-end browser tests |

---

## Architecture & Routes

### Public SEO Pages (Server-Rendered)
- `/[locale]` — Landing page with value props, "How it works", featured players, and area directory.
- `/[locale]/p/[profileSlug]` — Public player sports profile with dynamic Open Graph images (`next/og`) and `Person` JSON-LD.
- `/[locale]/r/[requestId]` — Public recruitment request with `SportsEvent` JSON-LD and applicant countdown.
- `/[locale]/[sport]/[district]/[upazila]` — Location SEO landing page (e.g., `/bn/football/patuakhali/kalapara`).
- `/[locale]/about`, `/contact`, `/privacy`, `/terms`, `/account-deletion` — Static and store compliance pages.
- `/sitemap.xml`, `/robots.txt` — Dynamic sitemap and search engine crawler instructions.

### Auth Pages
- `/[locale]/auth` — Role selection (`PLAYER` / `RECRUITER`) and sign-in options.
- `/[locale]/auth/phone` & `/verify` — Phone OTP login with Bangladeshi `+880` phone mask.
- `/[locale]/auth/email` — Email & password login.
- `/[locale]/auth/forgot-password` & `/reset-password` — Password recovery.

### Player Area (`/[locale]/player`)
- `/[locale]/player` — Player home dashboard with nearby recruitment requests.
- `/[locale]/player/onboarding` — 6-step player wizard (bio, cascading location, sport, positions/skill/stats, khep rates, availability matrix, media links).
- `/[locale]/player/profiles` — My sports profiles manager (multi-sport switcher, achievements CRUD, khep rates, stats verification).
- `/[locale]/player/opportunities` — Nearby open recruitment requests with custom rate application sheet.
- `/[locale]/player/applications` — Applications tracker (pending, accepted, declined) with captain phone reveal and call/WhatsApp links.
- `/[locale]/player/ratings` — Reviews and ratings received from team captains.
- `/[locale]/player/me` — Player account overview & role switcher.
- `/[locale]/player/settings` — Language, theme, linked auth methods, and account deletion.

### Recruiter Area (`/[locale]/recruiter`)
- `/[locale]/recruiter` — Recruiter home dashboard with quick "+ Post Request" action.
- `/[locale]/recruiter/onboarding` — Recruiter wizard (type: club, academy, scout, organizer; team name; district; sports).
- `/[locale]/recruiter/discover` — Advanced player search by sport, position, skill level, cascading location, and fees.
- `/[locale]/recruiter/shortlist` — Target player shortlists with spring-pop heart animation and direct invites.
- `/[locale]/recruiter/requests` — Match management (create, boost, mark filled, complete, cancel), applicant review, and post-match ratings.
- `/[locale]/recruiter/me` — Team overview & role switcher.
- `/[locale]/recruiter/settings` — Team preferences, language, theme, and security.

---

## Production Deployment (Ubuntu VPS + Nginx + PM2)

Next.js is configured with `output: 'standalone'` in `next.config.ts`.

### 1. Build on VPS
```bash
pnpm install --frozen-lockfile
pnpm run build
```

Copy the static assets into standalone:
```bash
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

### 2. Run with PM2
Use the provided `ecosystem.config.cjs`:
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

### 3. Nginx Reverse Proxy
Copy the provided Nginx configuration to your server:
```bash
sudo cp nginx/playerhaat.conf /etc/nginx/sites-available/playerhaat
sudo ln -s /etc/nginx/sites-available/playerhaat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
Obtain free SSL certificates using Certbot:
```bash
sudo certbot --nginx -d playerhaat.com -d www.playerhaat.com
```
