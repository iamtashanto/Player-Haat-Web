# Web ↔ mobile app parity: audit and plan (Phase 1)

Status: **awaiting review.** No feature code has been written. Sources: `app/lib` (router, shell, all features, repositories, design system),
`server/src` (routes + `routes.ts`), `web/src` (everything), `server/docs/ERROR_CODES.md` (149 codes).

## 1. What I found

**Web today** (Next.js 15, ~15k lines of TSX, ~3k lines in `src/lib`): separate `(player)/player/*` and `(recruiter)/recruiter/*` areas with a
`role-shell`, a design-system folder, an in-memory-token + httpOnly-refresh + CSRF auth layer (`api-client.ts`, `app/api/auth/*`), unit tests and two
Playwright specs. 842-line `en.json`/`bn.json` (the app's ARBs are 1172/755 lines, so the web is missing most of the app's copy, and `app_bn.arb` is itself
shorter than `app_en.arb`; I will report which keys are English-only).

**Sample data:** `samplePlayers`, `sampleRequests`, `sampleShortlist`, `sampleReviews`, `sampleOpportunities`, `sampleApplications` and sample applicants are used in
11 files (landing page, recruiter home/discover/shortlist/requests, player players/ratings/applications/opportunities/onboarding, `domain-cards.tsx`,
`recruiter-api.ts`). All of it gets removed.

**API surface** (187 handlers). Web calls only ~50 of them. Not called by the web at all: chat (`/conversations/*`), billing (`/billing/*`), teams (`/teams/*`),
recruiter verification, player stats verification, contact views list, invites received/accept/decline/withdraw, `/ratings/pending`, `/reports`, `/media/images`,
`/app-config`, `/recruiter-types`.

**Things that disagree or will bite:**
1. **Public pages have no public API.** `/players/:id`, `/players`, `/requests*`, `/recruiters/:id` are all behind `requireAppUser`. The SEO pages
   (`/p/[slug]`, `/r/[id]`, location landing, landing "featured", sitemap, OG image) cannot read real data server-side without a token. See §5.
2. **CORS/cookies:** the web calls the API directly from the browser (`NEXT_PUBLIC_API_URL`), so `CORS_ORIGINS` must contain `http://localhost:3000`.
   `server/.env` has it; `server/.env.example` does not (I changed it earlier to `:5174,:5180`, which was for the admin and my discarded Flutter-web build).
   Fix = docs/example only, no server code. The server already sends `credentials: true`; the refresh token is kept by the Next route handlers (`/api/auth/*`), so no cross-site cookie is needed.
3. **Stale files from my earlier Flutter-web attempt** are still in this repo: `web/build.sh`, `web/nginx.conf` (the Next.js deploy uses `nginx/playerhaat.conf` + PM2).
   I propose deleting both. Also `app/web/` and the web platform entry in `app/.metadata` that I added to the Flutter app; your brief says not to change the app, so I propose reverting those too.
4. **Port parity of locale:** the app has no "ads/force-update" on web by design (brief). `app-config` is still needed for feature flags and pricing (credits gate, boost, ads flag).
5. **No realtime:** no websocket/SSE anywhere in `server/src`. Chat = polling (app: `chat_screen.dart` `_pollEvery`; unread badge: every 2 min in `shell.dart`). **No web push:** no VAPID/webpush code; `/notifications/devices` registers FCM tokens (`ANDROID`/`IOS` only).
6. **Dev-only note:** an old copy of the static admin used to live in `web/admin`; it has been removed from this repo by now. Admin is only in `../admin`.

## 2. Route map

All under `/[locale]/…` (`en`, `bn`), one role-aware shell. Role (from `GET /users/me`: roles + `hasPlayerProfile`/`hasRecruiterProfile`) decides what each screen shows, as in Flutter.

| New web route | Flutter route | Notes |
|---|---|---|
| `/home` `/players` `/games` `/alerts` `/me` | same | 5 tabs; bottom bar < 768, rail 768–1023, sidebar ≥ 1024 |
| `/setup`, `/setup/recruiter`, `/recruiter/edit`, `/profile/edit` | same | wizard → centred stepper on desktop |
| `/recruiter/[id]`, `/player/[id]`, `/request/[id]`, `/request/new`, `/rate/[requestId]` | same | `/player/[id]` also shown as a drawer from search on desktop |
| `/invites`, `/me/viewers`, `/shortlist`, `/wallet`, `/messages`, `/chat/[id]`, `/teams`, `/team/[id]`, `/verify/recruiter`, `/verify/stats/[sportId]`, `/settings` | same | |
| `/auth`, `/auth/phone`, `/auth/phone/verify`, `/auth/email`, `/auth/verify-email`, `/auth/forgot`, `/auth/reset` | same | web currently uses `forgot-password`/`reset-password`; renamed, old ones redirect |
| `/p/[slug]`, `/r/[id]` (public SEO) | `/p/:id`, `/r/:id` | stay public/SSR; logged-in users get an "Open in app view" button → `/player/[id]`, `/request/[id]` |
| `/[sport]/[district]/[upazila]`, `/about`, `/contact`, `/privacy`, `/terms`, `/account-deletion`, sitemap, robots | – | unchanged, real data |
| `/gallery` | `/gallery` | dev only, hidden in production |

**Redirects (308, in `next.config.ts` `redirects()`):**
`/player`→`/home`, `/recruiter`→`/home`, `/player/opportunities`→`/games`, `/player/players`→`/players`, `/recruiter/discover`→`/players`,
`/player/applications`→`/games`, `/recruiter/requests`→`/games`, `/player/alerts`, `/recruiter/alerts`→`/alerts`, `/player/me`, `/recruiter/me`→`/me`,
`/player/settings`, `/recruiter/settings`→`/settings`, `/player/profiles`→`/profile/edit`, `/player/ratings`→`/me`, `/player/onboarding`→`/setup`,
`/recruiter/onboarding`→`/setup/recruiter`, `/recruiter/shortlist`→`/shortlist`, `/auth/forgot-password`→`/auth/forgot`, `/auth/reset-password`→`/auth/reset`.
Note: `/player/[id]` and `/recruiter/[id]` are new, real routes, so the legacy `/player/*` and `/recruiter/*` list above must be matched exactly (no wildcard).

**Middleware** keeps locale + "has refresh cookie" + active-role guard; the app's `redirect()` rules (needs recruiter setup → `/setup/recruiter`; player without profile and not dismissed → `/setup`; pending deep link restored after sign-in; language and onboarding gates) move to a client `SessionGate` because they depend on `/users/me`.
`ADMIN` accounts are refused (the server returns it on app routes); the existing "use the admin dashboard" notice stays.

## 3. Screen-by-screen

Status key: **missing** (no web screen), **partial** (exists, wrong shape/incomplete), **sample** (renders hardcoded data), **done**.
"Endpoints" are taken from the Flutter repositories; ✅ = exists on the server.

| Flutter screen | Web today | Status | Endpoints | OK? |
|---|---|---|---|---|
| splash / language / onboarding | none (locale in URL) | missing (language picker + 3 intro slides on first visit) | `/app-config` | ✅ |
| auth landing, phone, verify, email, verify-email, forgot, reset | `(auth)/auth/*` | partial (needs role pick at signup, resend timers, Google web, Apple behind config) | `/auth/*` | ✅ |
| profile setup (`/setup`) | `player/onboarding` | partial/sample | `/players/me`, `/sports`, `/locations/*`, `/media/images` | ✅ |
| recruiter setup + edit | `recruiter/onboarding` | partial | `/recruiters/me`, `/recruiter-types` | ✅ |
| home | `player/page`, `recruiter/page` | sample | `/requests`, `/requests/featured`, `/requests/mine`, `/players`, `/invites/received`, `/notifications/unread-count` | ✅ |
| search (players) | `recruiter/discover`, `player/players` | sample | `/players`, `/shortlist` | ✅ |
| player profile | `/p/[slug]` only | partial | `/players/:id`, `/:id/ratings`, `/:id/contact` (GET/POST), `/shortlist/:id`, `/conversations` (POST), `/invites`, `/reports` | ✅ |
| edit profile + sport editor sheet | `player/profiles` | partial | `/players/me*`, achievements, media photos/videos/order, `/users/me/avatar` | ✅ |
| my games (unified) | `player/applications`, `recruiter/requests` | sample | `/applications/mine`, `/requests/mine` | ✅ |
| request detail (+applicants, apply, boost/cancel/fill/complete, edit) | modal in recruiter page | partial/sample | `/requests/:id*`, `/requests/:id/applications`, `/applications/:id/accept|reject|withdraw` | ✅ |
| create request (also EVENT, team, paid) | sheet in recruiter page | partial | `POST /requests`, `/teams/mine` | ✅ |
| rate | in recruiter page | partial | `/ratings/pending`, `POST /requests/:id/ratings` | ✅ |
| notifications (alerts) | `*/alerts` | partial | `/notifications*` | ✅ |
| me | `*/me` | partial | `/users/me`, `/billing/wallet` | ✅ |
| settings | `settings-view` | partial | `/users/me`, `/auth/methods*`, `/auth/password`, `/auth/logout-all`, `/auth/account` | ✅ |
| invites | none | missing | `/invites/received|sent`, accept/decline/withdraw | ✅ |
| viewers (who opened my number) | none | missing | `/players/me/contact-views` | ✅ |
| shortlist | `recruiter/shortlist` | sample | `/shortlist` | ✅ |
| wallet + credits gate + manual payment | none | missing | `/billing/wallet|transactions|payments|checkout`, `/payments/:id/submit`, `/app-config` | ✅ |
| messages + chat | none | missing | `/conversations*` (list, messages, read, block/unblock) | ✅ (polling) |
| teams + team | none | missing | `/teams*` | ✅ |
| verification (recruiter, stats) | none | missing | `/recruiters/me/verification`, `/players/me/sports/:id/verification`, `/media/images` | ✅ |
| recruiter card | none | missing | `/recruiters/:id` | ✅ |
| force-update, ads | – | not on web (by design) | – | – |
| gallery | `gallery/page` | partial | – | – |
| public SEO pages | `(public)/*` | sample (landing) / auth-gated data | see §5 | ❌ needs public read endpoints |

## 4. Phases (as in your brief)

Same ten phases, branch `feat/web-app-parity`, one commit each, `pnpm typecheck && pnpm test && pnpm build` after each. Two notes:
- Phase 2 also ports tokens into the Tailwind theme (the web already has `tokens.ts`; I will diff it against `tokens.dart`/`colors.dart` rather than redo it).
- Phase 4 introduces `src/lib/api/*` typed modules, generated types from `/openapi.json` if it is complete (I will check; otherwise hand-written Zod-checked types) and migrates the existing three `*-api.ts` files into it.

## 5. Server gaps (nothing invented, nothing changed)

1. **Public read access for SEO pages** (blocking Phase 9). Needs either (a) public, unauthenticated `GET /players/:id`, `GET /requests/:id`, `GET /players` (limited fields, no contact data) and `GET /requests` for the landing/location pages and sitemap, or (b) a server-to-server API key the Next server uses. Without one of them the SEO pages can only show "sign in to view". Your call; (a) matches the existing `isVisible` flags best.
2. **Web push**: none (no VAPID, device registration only accepts ANDROID/IOS). Plan: in-app notifications + polling only.
3. **Realtime chat**: none → polling.
4. **Sitemap data**: no "list all public players/requests/locations" endpoint other than the search ones above.
5. **Role switch**: I need to confirm whether the server exposes an "active role" or only the two flags on `/users/me`; the web's `ph_active_role` cookie is client-side only.
6. Everything else the screens need exists.

## 6. Risks and questions

1. **Scope:** this is roughly the whole app again (~20 screens + desktop layouts + e2e). Expect many sessions; I will stop after each phase.
2. **Public data (§5.1):** which option do you want? Default if you don't answer: I build the web side against option (a) and list it as blocked, with the SEO pages degrading to a sign-in prompt, not sample data.
3. **Cleanup:** OK to delete `web/build.sh`, `web/nginx.conf`, revert `app/web/` and the `.metadata` web entry, and restore `server/.env.example` `CORS_ORIGINS` to include `http://localhost:3000`?
4. **Bangla copy gap:** `app_bn.arb` has ~400 fewer lines than `app_en.arb`. Missing Bangla strings will fall back to English and be listed; I won't translate product copy on my own unless you want me to.
5. **Google sign-in on web** needs a real web client id and the server's `GOOGLE_*` audience to include it; Apple needs a Services ID. Both stay behind env config and can't be e2e-tested locally.
6. **Existing web tests** (`player-area`, `recruiter-area` unit tests and two e2e specs) encode the old route structure and sample data; they will be rewritten, not patched.
7. **Playwright e2e** needs seeded data; `pnpm db:seed` must exist in `server` (I use `npm run db:seed:demo`, demo password `Demo1234`); I will confirm the exact script in Phase 10.
