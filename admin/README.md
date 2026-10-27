# PlayerHaat admin dashboard

Static site (HTML + CSS + vanilla JS, no build, no dependencies) for the Super Admin. It talks only to
`/api/v1/admin/*` and the token endpoints; admin accounts are refused by the mobile API.

## Run locally

```bash
# API (server/): allow this origin
CORS_ORIGINS=http://localhost:3001 npm run dev
# dashboard
cd web/admin && python3 -m http.server 3001
```

Create the first admin (there is deliberately no API for it):

```bash
cd server && npm run admin:grant -- someone@example.com
```

The account must have a password (register it once through the API/app, or set one with the reset flow).
Then sign in at http://localhost:3001.

## Deploy

* Serve the folder from any static host on its **own origin**, edit `config.js` to point at the API,
  and add that origin to the API's `CORS_ORIGINS`.
* Send real security headers from the host. `index.html` carries a CSP `<meta>`, but `frame-ancestors`
  only works as an HTTP header: add `Content-Security-Policy: frame-ancestors 'none'` (and HSTS).
* Sessions: the access token is kept in memory, the refresh token in `sessionStorage` (gone when the
  tab closes). All API data is rendered with `textContent`, never `innerHTML`.

## Pages

Overview (platform stats) · Accounts (search, suspend, change role) · Players (profiles and each sport
profile; hide / unhide / verify) · Recruiters (verify) · Reports (queue, resolve / dismiss) · Audit log ·
App config. Every action asks for a reason where one is required and is written to the audit log.
