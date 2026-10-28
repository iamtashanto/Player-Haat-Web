// Where the API lives, picked by where this dashboard is served from. The API must list this site's origin in CORS_ORIGINS.
window.PLAYERHAAT_API = ["localhost", "127.0.0.1"].includes(location.hostname)
  ? "http://localhost:4000/api/v1"
  : "https://playerhaat-api.tashanto.com/api/v1";
