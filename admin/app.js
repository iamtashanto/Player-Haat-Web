"use strict";
/* PlayerHaat admin dashboard. No dependencies, no build step.
 * Security notes: every API value is rendered with textContent (never innerHTML); the access token
 * lives in memory only; the refresh token is in sessionStorage (cleared when the tab closes). */

const API = window.PLAYERHAAT_API;
const RT_KEY = "ph_admin_rt";
const root = document.getElementById("app");
let accessToken = null;
let me = null;
let refreshing = null;

// ───────── tiny DOM helper ─────────
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, "");
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}
const chip = (text, cls) => h("span", { class: "chip " + (cls || "") }, text);
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : "—");
function toast(msg) {
  const t = h("div", { class: "toast", role: "status" }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 3000);
}

// ───────── API client ─────────
class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
async function raw(method, path, body, token) {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, json.error?.code, json.error?.message || res.statusText);
  return json;
}
function refresh() {
  // One refresh at a time: the API treats two parallel refreshes of the same token as a replay.
  refreshing ||= (async () => {
    const rt = sessionStorage.getItem(RT_KEY);
    if (!rt) throw new ApiError(401, "AUTH_UNAUTHENTICATED", "Signed out");
    const { data } = await raw("POST", "/auth/refresh", { refreshToken: rt });
    accessToken = data.accessToken;
    sessionStorage.setItem(RT_KEY, data.refreshToken);
  })().finally(() => { refreshing = null; });
  return refreshing;
}
async function api(method, path, body) {
  try {
    return await raw(method, path, body, accessToken);
  } catch (e) {
    if (e.status !== 401 || e.code === "AUTH_INVALID_CREDENTIALS") throw e;
    try { await refresh(); } catch { signOut(); throw e; }
    return raw(method, path, body, accessToken);
  }
}
const get = (p, q) => api("GET", p + (q ? "?" + new URLSearchParams(Object.entries(q).filter(([, v]) => v !== "" && v != null)) : ""));

function signOut() {
  const rt = sessionStorage.getItem(RT_KEY);
  if (rt) fetch(API + "/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: rt }) }).catch(() => {});
  sessionStorage.removeItem(RT_KEY);
  accessToken = null; me = null;
  renderLogin();
}

// ───────── reason dialog ─────────
function askReason(title, { required = true, extra } = {}) {
  return new Promise((resolve) => {
    let result = null; // null = cancelled; "" = confirmed without a reason (optional prompts only)
    const ta = h("textarea", { maxlength: 300, placeholder: required ? "Reason (3–300 characters, kept in the audit log)" : "Reason (optional)" });
    const ok = h("button", { class: "btn primary", type: "submit" }, "Confirm");
    const dlg = h("dialog", {}, h("form", { method: "dialog" }, h("h3", {}, title), extra || null, ta,
      h("div", { class: "row", style: "margin-top:12px;justify-content:flex-end" }, h("button", { class: "btn", type: "button", onclick: () => dlg.close() }, "Cancel"), ok)));
    ok.addEventListener("click", (ev) => {
      const v = ta.value.trim();
      if (required && v.length < 3) { ev.preventDefault(); ta.focus(); return; }
      result = v;
    });
    dlg.addEventListener("close", () => { dlg.remove(); resolve(result); });
    document.body.append(dlg);
    dlg.showModal();
  });
}
async function act(label, fn, after) {
  try { await fn(); toast(label + " ✓"); after && (await after()); } catch (e) { toast(e.message); }
}

// ───────── generic list view with "load more" ─────────
function listView(cols, fetchPage) {
  const tbody = h("tbody");
  const more = h("button", { class: "btn", style: "margin:10px", hidden: true }, "Load more");
  const status = h("div", { class: "muted", style: "padding:10px" });
  let cursor = null;
  const panel = h("div", { class: "panel" }, h("table", {}, h("thead", {}, h("tr", {}, cols.map((c) => h("th", {}, c.title)))), tbody), status, more);
  async function load(reset) {
    if (reset) { tbody.replaceChildren(); cursor = null; }
    status.textContent = "Loading…";
    try {
      const res = await fetchPage(cursor);
      for (const row of res.data) tbody.append(h("tr", {}, cols.map((c) => h("td", {}, c.render(row, () => load(true))))));
      cursor = res.meta?.nextCursor || null;
      more.hidden = !cursor;
      status.textContent = tbody.children.length ? "" : "Nothing here.";
    } catch (e) { status.textContent = e.message; status.className = "err"; }
  }
  more.addEventListener("click", () => load(false));
  return { el: panel, reload: () => load(true) };
}
function filters(fields, onChange) {
  const els = fields.map((f) => f.type === "select"
    ? h("select", { "aria-label": f.label }, f.options.map(([v, t]) => h("option", { value: v }, t)))
    : h("input", { type: "search", placeholder: f.label, "aria-label": f.label }));
  let timer;
  const read = () => Object.fromEntries(fields.map((f, i) => [f.name, els[i].value]));
  els.forEach((el) => el.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => onChange(read()), 250); }));
  return { el: h("div", { class: "row" }, els), read };
}

// ───────── pages ─────────
const pages = {
  async overview(main) {
    const { data: s } = await get("/admin/stats");
    const card = (n, l) => h("div", { class: "card" }, h("div", { class: "n" }, n ?? 0), h("div", { class: "l" }, l));
    const r = s.users.byRole;
    main.append(
      h("div", { class: "cards" },
        card(r.PLAYER, "Players"), card(r.RECRUITER, "Recruiters"), card(s.users.signedUpLast7Days, "Sign-ups, 7 days"), card(s.users.signedUpLast30Days, "Sign-ups, 30 days"),
        card(s.players.profiles, "Player profiles"), card(s.players.hiddenByAdmin, "Hidden by admin"),
        card(s.recruiters.verified + " / " + s.recruiters.profiles, "Recruiters verified"), card(s.users.byStatus.SUSPENDED, "Suspended accounts"),
        card(s.moderation.openReports, "Open reports"), card(s.moderation.actionsLast24h, "Admin actions, 24h")),
      h("h3", {}, "Sport profiles"),
      h("div", { class: "cards" }, s.sportProfiles.length ? s.sportProfiles.map((p) => card(p.count, p.nameEn)) : h("span", { class: "muted" }, "None yet.")),
      h("h3", {}, "Requests"),
      h("div", { class: "cards" }, Object.entries(s.requests.byStatus).map(([k, v]) => card(v, k.toLowerCase()))));
  },

  async users(main) {
    const roleAction = async (u, reload) => {
      const to = u.role === "PLAYER" ? "RECRUITER" : "PLAYER";
      const reason = await askReason(`Switch ${u.name} to ${to.toLowerCase()}?`);
      if (reason) await act("Role changed", () => api("PUT", `/admin/users/${u.id}/role`, { role: to, reason }), reload);
    };
    const lv = listView([
      { title: "Name", render: (u) => [h("strong", {}, u.name), h("div", { class: "muted" }, u.email || u.phone || "—")] },
      { title: "Role", render: (u) => chip(u.role) },
      { title: "Status", render: (u) => chip(u.status, u.status === "ACTIVE" ? "good" : "bad") },
      { title: "Joined", render: (u) => fmtDate(u.createdAt) },
      { title: "", render: (u, reload) => u.role === "ADMIN" ? h("span", { class: "muted" }, "protected") : h("div", { class: "row", style: "margin:0" },
        u.status === "ACTIVE" && h("button", { class: "btn danger", onclick: async () => { const reason = await askReason(`Suspend ${u.name}?`); if (reason) act("Suspended", () => api("POST", `/admin/users/${u.id}/suspend`, { reason }), reload); } }, "Suspend"),
        u.status === "SUSPENDED" && h("button", { class: "btn", onclick: async () => { const reason = await askReason(`Lift suspension for ${u.name}?`, { required: false }); if (reason !== null) act("Unsuspended", () => api("POST", `/admin/users/${u.id}/unsuspend`, reason ? { reason } : {}), reload); } }, "Unsuspend"),
        u.status !== "DELETED" && h("button", { class: "btn", onclick: () => roleAction(u, reload) }, "Change role")) },
    ], (cursor) => get("/admin/users", { ...f.read(), cursor, limit: 25 }));
    const f = filters([
      { name: "q", label: "Search name, email, phone" },
      { name: "role", type: "select", label: "Role", options: [["", "All roles"], ["PLAYER", "Players"], ["RECRUITER", "Recruiters"], ["ADMIN", "Admins"]] },
      { name: "status", type: "select", label: "Status", options: [["", "Any status"], ["ACTIVE", "Active"], ["SUSPENDED", "Suspended"], ["DELETED", "Deleted"]] },
    ], (v) => { if (v.q && v.q.length < 2) return; lv.reload(); });
    main.append(f.el, lv.el); lv.reload();
  },

  async players(main) {
    const lv = listView([
      { title: "Player", render: (p) => [h("strong", {}, p.user.name), h("div", { class: "muted" }, p.user.email || "—"), h("div", { class: "muted" }, p.location)] },
      { title: "Account", render: (p, reload) => [
        p.hiddenByAdmin && chip("hidden by admin", "bad"), !p.isVisible && chip("self-hidden", "warn"), p.verifiedBadge && chip("verified", "good"), chip("★ " + p.rating.average + " (" + p.rating.count + ")"),
        h("div", { class: "row", style: "margin:6px 0 0" },
          h("button", { class: "btn", onclick: async () => {
            if (p.hiddenByAdmin) { const reason = await askReason("Unhide this profile?", { required: false }); if (reason !== null) act("Unhidden", () => api("POST", `/admin/players/${p.id}/unhide`, reason ? { reason } : {}), reload); }
            else { const reason = await askReason(`Hide ${p.user.name}'s whole profile?`); if (reason) act("Hidden", () => api("POST", `/admin/players/${p.id}/hide`, { reason }), reload); }
          } }, p.hiddenByAdmin ? "Unhide" : "Hide"),
          h("button", { class: "btn", onclick: () => act(p.verifiedBadge ? "Badge removed" : "Verified", () => api("POST", `/admin/players/${p.id}/verify`, { verified: !p.verifiedBadge }), reload) }, p.verifiedBadge ? "Unverify" : "Verify"))] },
      { title: "Sport profiles", render: (p, reload) => p.sportProfiles.length ? p.sportProfiles.map((s) => h("div", { style: "margin-bottom:8px" },
        chip(s.sportCode), s.positions.map((x) => chip(x)), s.experienceYears != null && chip(s.experienceYears + " yrs"), chip("★ " + s.rating.average + " (" + s.rating.count + ")"), s.achievements > 0 && chip(s.achievements + " achievements"),
        s.hiddenByAdmin && chip("hidden by admin", "bad"), !s.isVisible && chip("self-hidden", "warn"),
        s.headline && h("div", { class: "muted" }, s.headline),
        h("button", { class: "btn", style: "margin-top:4px", onclick: async () => {
          if (s.hiddenByAdmin) { const reason = await askReason("Unhide this sport profile?", { required: false }); if (reason !== null) act("Unhidden", () => api("POST", `/admin/sport-profiles/${s.id}/unhide`, reason ? { reason } : {}), reload); }
          else { const reason = await askReason(`Hide the ${s.sportCode} profile?`); if (reason) act("Hidden", () => api("POST", `/admin/sport-profiles/${s.id}/hide`, { reason }), reload); }
        } }, s.hiddenByAdmin ? "Unhide" : "Hide"))) : h("span", { class: "muted" }, "No sports yet") },
    ], (cursor) => get("/admin/players", { ...f.read(), cursor, limit: 20 }));
    const f = filters([
      { name: "q", label: "Search name or email" },
      { name: "hidden", type: "select", label: "Hidden", options: [["", "Hidden or not"], ["true", "Hidden by admin"], ["false", "Not hidden"]] },
    ], (v) => { if (v.q && v.q.length < 2) return; lv.reload(); });
    main.append(f.el, lv.el); lv.reload();
  },

  async recruiters(main) {
    const lv = listView([
      { title: "Recruiter", render: (r) => [h("strong", {}, r.user.name), h("div", { class: "muted" }, r.user.email || "—")] },
      { title: "Organisation", render: (r) => [chip(r.type), r.organization || "—", h("div", { class: "muted" }, r.district)] },
      { title: "Status", render: (r) => [chip(r.user.status, r.user.status === "ACTIVE" ? "good" : "bad"), r.verifiedBadge && chip("verified", "good")] },
      { title: "", render: (r, reload) => h("button", { class: "btn", onclick: () => act(r.verifiedBadge ? "Badge removed" : "Verified", () => api("POST", `/admin/recruiters/${r.id}/verify`, { verified: !r.verifiedBadge }), reload) }, r.verifiedBadge ? "Unverify" : "Verify") },
    ], (cursor) => get("/admin/recruiters", { ...f.read(), cursor, limit: 25 }));
    const f = filters([
      { name: "q", label: "Search name, email, organisation" },
      { name: "verified", type: "select", label: "Verified", options: [["", "Any"], ["true", "Verified"], ["false", "Not verified"]] },
    ], (v) => { if (v.q && v.q.length < 2) return; lv.reload(); });
    main.append(f.el, lv.el); lv.reload();
  },

  async reports(main) {
    const resolve = async (r, outcome, reload) => {
      const resolution = await askReason(outcome === "RESOLVED" ? "Resolve report (we acted on it)" : "Dismiss report (no action needed)");
      if (resolution) act("Report " + outcome.toLowerCase(), () => api("POST", `/admin/reports/${r.id}/resolve`, { outcome, resolution }), reload);
    };
    const lv = listView([
      { title: "Target", render: (r) => [chip(r.targetType), h("div", { class: "muted" }, r.targetId), r.openReportsOnTarget > 1 && chip(r.openReportsOnTarget + " open", "warn")] },
      { title: "Report", render: (r) => [h("strong", {}, r.reason), r.details && h("div", { class: "muted" }, r.details), h("div", { class: "muted" }, "by " + r.reporter.name + " · " + fmtDate(r.createdAt))] },
      { title: "Status", render: (r) => [chip(r.status, r.status === "OPEN" ? "warn" : "good"), r.resolution && h("div", { class: "muted" }, r.resolution)] },
      { title: "", render: (r, reload) => r.status === "OPEN" ? h("div", { class: "row", style: "margin:0" }, h("button", { class: "btn primary", onclick: () => resolve(r, "RESOLVED", reload) }, "Resolve"), h("button", { class: "btn", onclick: () => resolve(r, "DISMISSED", reload) }, "Dismiss")) : "" },
    ], (cursor) => get("/admin/reports", { status: f.read().status || "OPEN", cursor, limit: 25 }));
    const f = filters([{ name: "status", type: "select", label: "Status", options: [["OPEN", "Open (oldest first)"], ["RESOLVED", "Resolved"], ["DISMISSED", "Dismissed"], ["ALL", "All"]] }], () => lv.reload());
    main.append(f.el, lv.el); lv.reload();
  },

  async audit(main) {
    const lv = listView([
      { title: "When", render: (a) => fmtDate(a.createdAt) },
      { title: "Action", render: (a) => chip(a.action) },
      { title: "Target", render: (a) => [a.targetType, h("div", { class: "muted" }, a.targetId)] },
      { title: "Reason", render: (a) => [a.reason || "—", a.metadata && h("div", { class: "muted" }, JSON.stringify(a.metadata))] },
      { title: "Admin", render: (a) => h("span", { class: "muted" }, a.adminId) },
    ], (cursor) => get("/admin/actions", { cursor, limit: 40 }));
    main.append(lv.el); lv.reload();
  },

  async config(main) {
    const { data } = await get("/admin/app-config");
    const rows = Object.entries(data).map(([key, value]) => {
      const save = (v) => act(key + " saved", () => api("PUT", `/admin/app-config/${key}`, { value: v }));
      const input = typeof value === "boolean"
        ? h("input", { type: "checkbox", ...(value ? { checked: true } : {}), onchange: (e) => save(e.target.checked) })
        : (() => { const i = h("input", { value: String(value), maxlength: 40 }); return h("span", {}, i, " ", h("button", { class: "btn", onclick: () => save(i.value) }, "Save")); })();
      return h("tr", {}, h("td", {}, h("code", {}, key)), h("td", {}, input));
    });
    main.append(h("div", { class: "panel" }, h("table", {}, h("thead", {}, h("tr", {}, h("th", {}, "Key"), h("th", {}, "Value"))), h("tbody", {}, rows))));
  },
};
const NAV = [["overview", "Overview"], ["users", "Accounts"], ["players", "Players"], ["recruiters", "Recruiters"], ["reports", "Reports"], ["audit", "Audit log"], ["config", "App config"]];

// ───────── shell ─────────
async function show(page) {
  location.hash = page;
  const main = h("main", {}, h("h2", {}, NAV.find((n) => n[0] === page)[1]));
  root.replaceChildren(h("div", { class: "shell" },
    h("nav", {}, h("h1", {}, "PlayerHaat Admin"),
      NAV.map(([id, label]) => h("button", { ...(id === page ? { "aria-current": "page" } : {}), onclick: () => show(id) }, label)),
      h("div", { class: "who" }, me.email, h("br"), h("button", { class: "btn", style: "margin-top:8px", onclick: signOut }, "Sign out"))),
    main));
  try { await pages[page](main); } catch (e) { main.append(h("p", { class: "err" }, e.message)); }
}

function renderLogin(message) {
  const email = h("input", { type: "email", autocomplete: "username", required: true });
  const pw = h("input", { type: "password", autocomplete: "current-password", required: true });
  const err = h("div", { class: "err", role: "alert" }, message || "");
  const btn = h("button", { class: "btn primary", type: "submit" }, "Sign in");
  root.replaceChildren(h("form", { class: "login", onsubmit: async (ev) => {
    ev.preventDefault(); btn.disabled = true; err.textContent = "";
    try {
      const { data } = await raw("POST", "/admin/auth/login", { email: email.value.trim(), password: pw.value });
      accessToken = data.tokens.accessToken;
      sessionStorage.setItem(RT_KEY, data.tokens.refreshToken);
      pw.value = "";
      start();
    } catch (e) { err.textContent = e.status === 401 ? "Wrong email or password." : e.status === 429 ? "Too many attempts. Try again later." : e.message; btn.disabled = false; }
  } }, h("h2", {}, "Admin sign-in"), h("label", {}, "Email", email), h("label", {}, "Password", pw), err, btn));
}

async function start() {
  try {
    if (!accessToken) await refresh();
    me = (await get("/admin/me")).data;
    show(pages[location.hash.slice(1)] ? location.hash.slice(1) : "overview");
  } catch {
    renderLogin();
  }
}
start();
