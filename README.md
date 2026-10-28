# PlayerHaat website

The browser version of the player and recruiter app. It is the same Flutter code as `../app` built for the web
(phone-sized layout, centred on wide screens), so features and fixes ship to both together.

- **Players and recruiters only.** There is no admin here and the app has no admin screens. Staff use `../admin`;
  admin accounts are refused by the app's API routes.
- **Manual payments only.** Credits are bought by sending money by bKash/Nagad/Rocket and submitting the transaction id;
  an admin approves it in the dashboard.

## Build

```bash
./build.sh dev     # uses ../app/env/dev.json (API at http://localhost:4000/api/v1)
./build.sh prod    # uses ../app/env/prod.json (copy prod.example.json; API https://playerhaat-api.tashanto.com/api/v1)
```

Output goes to `dist/`. Serve it with any static host (`nginx.conf` is provided); locally,
`python3 -m http.server 5180 -d dist`.

## API access

The browser calls the API directly, so add the website origin to the server's `CORS_ORIGINS`
(local testing: `http://localhost:5180`; release: your website origin), and serve the API over HTTPS.

## Not on the web

Push notifications, ads, photo cropping and Android SMS auto-fill are mobile features; the app skips them on the web.
Phone-OTP and email sign-in work; Google sign-in needs a web client id in `prod.json`.

## Old static admin

`admin/` here is the earlier static dashboard. The real dashboard is `../admin` (with 2FA); this copy should be removed.
