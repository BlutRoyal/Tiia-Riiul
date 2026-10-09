"use strict";

const CFG = window.TIIA_CONFIG || {};
const DEMO = !CFG.API_URL;
const THRESHOLD = Number(CFG.REMINDER_EUR) || 50;

const DEFAULTS = {
  buyPlace: ["Humana", "Uuskasutus", "Sõbralt Sõbrale", "Vinted", "Yaga", "Facebook", "Kirbuturg"],
  sellPlace: ["Vinted", "Yaga", "Facebook"],
  size: ["XS", "S", "M", "L", "XL", "XXL", "One size"],
  category: ["Kleit", "Seelik", "Pluus", "Särk", "Top", "Kampsun", "Jakk", "Mantel", "Püksid", "Teksad",
    "Lühikesed püksid", "Jalanõud", "Kott", "Aksessuaar"],
};

const S = {
  items: [],
  transfers: [],
  loaded: false,
  tab: "active",
  layout: lsGet("tr-layout") || "vertical",
  q: { active: "", archive: "" },
  cat: { active: "", archive: "" },
  period: "all",
  month: null,
  editing: null,
  pinError: "",
  formPhoto: null,
};

/* ---------- abifunktsioonid ---------- */

function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch {} }
function lsDel(k) { try { localStorage.removeItem(k); } catch {} }

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const num = (v) => { const n = parseFloat(String(v ?? "").replace(",", ".").replace(/\s/g, "")); return isFinite(n) ? n : 0; };
const numOrEmpty = (v) => (String(v ?? "").trim() === "" ? "" : num(v));
const round2 = (n) => Math.round(n * 100) / 100;
const eur = (n, sign = false) => {
  const v = round2(n);
  const s = Math.abs(v).toLocaleString("et-EE", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  return (v < 0 ? "−" : sign && v > 0 ? "+" : "") + s + " €";
};
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const fmtDate = (d) => { if (!d) return ""; const [y, m, dd] = String(d).slice(0, 10).split("-"); return `${+dd}.${+m}.${y}`; };
const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const MONTHS = ["jaan", "veebr", "märts", "apr", "mai", "juuni", "juuli", "aug", "sept", "okt", "nov", "dets"];

const cost = (it) => num(it.buyPrice) + num(it.buyShipping);
const profit = (it) => num(it.sellPrice) - (it.sellInclPostage ? num(it.sellPostage) : 0) - cost(it);
const title = (it) => [it.brand, it.category].filter(Boolean).join(" · ") || "Toode";

function photoSrc(it) {
  if (it.photoData) return it.photoData;
  if (it.photoId) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(it.photoId)}&sz=w1200`;
  return "";
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 2600);
}

const ICON = {
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  vert: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="8" rx="2"/><rect x="5" y="13" width="14" height="8" rx="2"/></svg>',
  horiz: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="8" height="14" rx="2"/><rect x="13" y="5" width="8" height="14" rx="2"/></svg>',
  camera: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
  hanger: '<svg viewBox="0 0 24 24"><path d="M12 6a2 2 0 1 1 2 2c-.8.3-2 .9-2 2v.5M12 10.5 3.5 17a1.5 1.5 0 0 0 .9 2.7h15.2a1.5 1.5 0 0 0 .9-2.7L12 10.5"/></svg>',
  box: '<svg viewBox="0 0 24 24"><path d="M3 5h18v4H3zM5 9v10h14V9M10 13h4"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 15V3M8 7l4-4 4 4M6 11H5v10h14V11h-1"/></svg>',
  dots: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>',
};

/* ---------- andmekiht ---------- */

const KEY = "tr-key";
const CACHE = "tr-cache";
const DEMO_DB = "tr-demo";

async function call(payload) {
  if (DEMO) return demoCall(payload);
  let res;
  if (payload.action === "list") {
    res = await fetch(`${CFG.API_URL}?action=list&key=${encodeURIComponent(lsGet(KEY) || "")}`);
  } else {
    // text/plain = "lihtne" päring, Apps Script ei vaja siis CORS eelpäringut
    res = await fetch(CFG.API_URL, { method: "POST", body: JSON.stringify({ ...payload, key: lsGet(KEY) || "" }) });
  }
  let data;
  try { data = await res.json(); }
  catch { throw new Error("Skript ei vastanud. Kontrolli, et Web app on avaldatud valikuga Who has access: Anyone."); }
  if (data.error === "unauthorized" || data.error === "pin_not_set") {
    S.pinError = data.error === "pin_not_set"
      ? "PIN on skriptis veel määramata (MUUDA-MIND). Muuda see Code.gs failis ja tee Deploy → Manage deployments → New version."
      : "Vale PIN. Kui muutsid PIN-i skriptis, tee ka Deploy → Manage deployments → New version.";
    lsDel(KEY); render();
    throw new Error("PIN");
  }
  if (data.error) throw new Error(data.error);
  return data;
}

function demoCall(p) {
  const db = JSON.parse(lsGet(DEMO_DB) || '{"items":[],"transfers":[]}');
  if (p.action === "save") {
    const item = { ...p.item, updated: new Date().toISOString() };
    const i = db.items.findIndex((x) => x.id === item.id);
    if (p.photo) item.photoData = p.photo;
    else if (i >= 0) item.photoData = db.items[i].photoData;
    if (i >= 0) db.items[i] = item; else db.items.push(item);
    lsSet(DEMO_DB, JSON.stringify(db));
    return { item };
  }
  if (p.action === "transfer") {
    const t = { date: p.date, amount: p.amount };
    db.transfers.push(t);
    lsSet(DEMO_DB, JSON.stringify(db));
    return { transfer: t };
  }
  return db;
}

function saveCache() {
  if (DEMO) return;
  lsSet(CACHE, JSON.stringify({ items: S.items, transfers: S.transfers }));
}

async function load() {
  if (!DEMO) {
    const c = lsGet(CACHE);
    if (c) { const d = JSON.parse(c); S.items = d.items || []; S.transfers = d.transfers || []; S.loaded = true; render(); }
  }
  try {
    const d = await call({ action: "list" });
    S.items = (d.items || []).map(normalize);
    S.transfers = d.transfers || [];
    S.loaded = true;
    saveCache();
    render();
  } catch (e) {
    if (!S.loaded) { S.loaded = true; render(); }
    if (e.message !== "PIN") toast("Ei saanud andmeid laadida: " + e.message);
  }
}

function normalize(it) {
  return {
    ...it,
    sellInclPostage: it.sellInclPostage === true || it.sellInclPostage === "TRUE" || it.sellInclPostage === "true",
  };
}

async function saveItem(item, photo) {
  const d = await call({ action: "save", item, photo });
  const saved = normalize(d.item);
  const i = S.items.findIndex((x) => x.id === saved.id);
  if (i >= 0) S.items[i] = saved; else S.items.push(saved);
  saveCache();
  return saved;
}

/* ---------- arvutused ---------- */

function ranked(field, defaults) {
  const count = {};
  S.items.forEach((it) => { const v = (it[field] || "").trim(); if (v) count[v] = (count[v] || 0) + 1; });
  const used = Object.keys(count).sort((a, b) => count[b] - count[a]);
  return [...used, ...defaults.filter((d) => !count[d])];
}

function untransferred() {
  const earned = S.items.filter((i) => i.status === "sold").reduce((s, i) => s + profit(i), 0);
  const moved = S.transfers.reduce((s, t) => s + num(t.amount), 0);
  return round2(earned - moved);
}

function matches(it, q) {
  if (!q) return true;
  const hay = [it.brand, it.category, it.size, it.buyPlace, it.sellPlace, it.note, it.buyPrice, it.sellPrice]
    .join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
}

/* ---------- vaated ---------- */

function render() {
  document.querySelectorAll("#nav [data-tab]").forEach((b) => b.classList.toggle("on", b.dataset.tab === S.tab));
  const v = $("#view");
  $("#nav").style.display = needsPin() ? "none" : "";
  if (needsPin()) { v.innerHTML = pinView(); return; }
  if (!S.loaded) { v.innerHTML = `<div class="loading"><div class="spin"></div></div>`; return; }
  const views = { active: listView, archive: listView, form: formView, stats: statsView, more: moreView };
  v.innerHTML = (DEMO && S.tab !== "more" ? `<div class="demo-note">Demorežiim: andmed on ainult selles telefonis. Ühenda Google Sheet, et need salvestuksid päriselt.</div>` : "") + views[S.tab]();
  if (S.tab === "form") mountForm();
}

function needsPin() { return !DEMO && !lsGet(KEY); }

function pinView() {
  return `<form class="pin" id="pin-form">
    <img src="icons/apple-touch-icon.png" alt="">
    <h1 style="margin:0">Tiia Riiul</h1>
    <p class="muted" style="margin:0">Sisesta PIN, mille Freddy sulle andis.</p>
    ${S.pinError ? `<p style="margin:0;color:var(--neg);font-size:14px">${esc(S.pinError)}</p>` : ""}
    <input class="input" id="pin" type="password" inputmode="numeric" autocomplete="off" required>
    <button class="btn primary block">Ava riiul</button>
  </form>`;
}

function banner() {
  const u = untransferred();
  const snooze = num(lsGet("tr-snooze"));
  if (u < THRESHOLD || Date.now() < snooze) return "";
  return `<div class="banner">
    <div><strong>💸 ${eur(u)} ootab ülekannet</strong><br>Pane teenitud raha eraldi kontole, enne kui see kogemata ära kulub.</div>
    <div class="row">
      <button class="btn dark" data-act="transfer">Kandsin üle</button>
      <button class="btn" data-act="snooze" style="background:transparent;color:inherit">Homme</button>
    </div>
  </div>`;
}

function filtered(kind) {
  const status = kind === "active" ? "active" : "sold";
  const all = S.items.filter((i) => i.status === status);
  const list = all
    .filter((i) => !S.cat[kind] || i.category === S.cat[kind])
    .filter((i) => matches(i, S.q[kind]))
    .sort((a, b) => kind === "active"
      ? String(b.buyDate || b.created).localeCompare(String(a.buyDate || a.created))
      : String(b.sellDate).localeCompare(String(a.sellDate)));
  return { all, list };
}

function listView() {
  const kind = S.tab;
  const { all } = filtered(kind);
  const cats = [...new Set(all.map((i) => i.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "et"));
  if (S.cat[kind] && !cats.includes(S.cat[kind])) S.cat[kind] = "";
  const { list } = filtered(kind);

  const head = `<div class="top">
      <h1>${kind === "active" ? "Riiul" : "Arhiiv"}<span class="count">${all.length}</span></h1>
      <button class="icon-btn" data-act="layout" aria-label="Vaheta vaadet">${S.layout === "vertical" ? ICON.horiz : ICON.vert}</button>
    </div>
    ${kind === "active" ? banner() : ""}
    <label class="search">${ICON.search}<input id="q" type="search" placeholder="Otsi brändi, suurust, märkust…" value="${esc(S.q[kind])}"></label>
    ${cats.length > 1 ? `<div class="chips">${["", ...cats].map((c) =>
      `<button class="chip ${S.cat[kind] === c ? "on" : ""}" data-cat="${esc(c)}">${c ? esc(c) : "Kõik"}</button>`).join("")}</div>` : ""}`;

  if (!all.length) {
    return head + `<div id="results"><div class="empty">${kind === "active" ? ICON.hanger : ICON.box}
      <p>${kind === "active" ? "Riiul on veel tühi." : "Müüdud tooted tulevad siia."}</p>
      ${kind === "active" ? `<button class="btn primary" data-tab="form">Lisa esimene toode</button>` : ""}</div></div>`;
  }
  return head + `<div id="results">${resultsHTML(list)}</div>`;
}

function resultsHTML(list) {
  if (!list.length) return `<div class="empty"><p>Midagi ei leitud.</p></div>`;
  return `<div class="feed ${S.layout}" id="feed">${list.map(cardHTML).join("")}</div>`;
}

function cardHTML(it) {
  const src = photoSrc(it);
  const sold = it.status === "sold";
  const p = profit(it);
  const img = src
    ? `<img class="ph" src="${esc(src)}" alt="${esc(title(it))}" loading="lazy" onerror="this.onerror=null;this.src='https://lh3.googleusercontent.com/d/${esc(it.photoId)}=w1200'">`
    : `<div class="ph noph">${ICON.hanger}</div>`;
  const tag = sold
    ? `<span class="${p >= 0 ? "pos" : "neg"}">${eur(p, true)}</span>`
    : `<span>${eur(cost(it))}</span>${it.size ? `<span>${esc(it.size)}</span>` : ""}`;
  const rows = [
    ["Ostetud", [it.buyPlace, fmtDate(it.buyDate)].filter(Boolean).join(", ")],
    ["Ostuhind", eur(num(it.buyPrice))],
    num(it.buyShipping) ? ["Transport", eur(num(it.buyShipping))] : null,
  ];
  if (sold) {
    rows.push(["Müüdud", [it.sellPlace, fmtDate(it.sellDate)].filter(Boolean).join(", ")]);
    rows.push(["Müügihind", eur(num(it.sellPrice))]);
    if (it.sellInclPostage) rows.push(["Postitasu (hinnas)", "−" + eur(num(it.sellPostage))]);
    rows.push(["Kasum", eur(p, true), "big"]);
    if (it.buyDate && it.sellDate) rows.push(["Müügiaeg", daysBetween(it.buyDate, it.sellDate) + " päeva"]);
  } else {
    rows.push(["Kulu kokku", eur(cost(it)), "big"]);
    if (it.buyDate) rows.push(["Riiulil", daysBetween(it.buyDate, today()) + " päeva"]);
  }
  const acts = sold
    ? `<button class="btn light" data-act="reactivate">Tagasi riiulile</button>
       <button class="btn ghost-light" data-act="edit">Muuda</button>
       <button class="btn ghost-light" data-act="delete">Kustuta</button>`
    : `<button class="btn light" data-act="sell">Märgi müüduks</button>
       <button class="btn ghost-light" data-act="edit">Muuda</button>`;
  return `<article class="card" data-id="${esc(it.id)}">
    ${img}
    <div class="tag">${tag}</div>
    <div class="info">
      <div><h3>${esc(title(it))}</h3>${it.size ? `<div class="sub">Suurus ${esc(it.size)}</div>` : ""}</div>
      <dl>${rows.filter(Boolean).map(([k, v, c]) => `<dt>${k}</dt><dd class="${c || ""}">${esc(v)}</dd>`).join("")}</dl>
      ${it.note ? `<div class="note">${esc(it.note)}</div>` : ""}
      <div class="acts">${acts}</div>
    </div>
  </article>`;
}

/* --- valikunupud --- */

function picker(name, options, value, placeholder) {
  const inList = options.includes(value);
  return `<div class="picker" data-picker="${name}">
    <div class="chips">${options.map((o) => `<button type="button" class="chip ${o === value ? "on" : ""}" data-pick="${esc(o)}">${esc(o)}</button>`).join("")}</div>
    <input class="input" name="${name}" data-free placeholder="${esc(placeholder)}" value="${inList ? "" : esc(value || "")}">
    <input type="hidden" name="${name}__pick" value="${inList ? esc(value) : ""}">
  </div>`;
}

function pickerValue(form, name) {
  return (form.elements[name].value.trim() || form.elements[name + "__pick"].value || "").trim();
}

function bindPickers(root) {
  root.querySelectorAll("[data-picker]").forEach((p) => {
    const hidden = p.querySelector('input[type="hidden"]');
    const free = p.querySelector("[data-free]");
    p.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pick]");
      if (!b) return;
      const on = !b.classList.contains("on");
      p.querySelectorAll("[data-pick]").forEach((x) => x.classList.remove("on"));
      if (on) b.classList.add("on");
      hidden.value = on ? b.dataset.pick : "";
      free.value = "";
      p.dispatchEvent(new Event("input", { bubbles: true }));
    });
    free.addEventListener("input", () => {
      if (free.value) { hidden.value = ""; p.querySelectorAll("[data-pick]").forEach((x) => x.classList.remove("on")); }
    });
  });
}

/* --- lisamine / muutmine --- */

function formView() {
  const it = S.editing || {};
  const src = S.formPhoto || photoSrc(it);
  const brands = [...new Set(S.items.map((i) => i.brand).filter(Boolean))].sort();
  return `<div class="top"><h1>${S.editing ? "Muuda toodet" : "Uus toode"}</h1>
      ${S.editing ? `<button class="icon-btn" data-act="cancel-edit" aria-label="Tühista"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>` : ""}</div>
  <form class="form" id="item-form" autocomplete="off">
    <div>
      <div class="photo-box" id="photo-box">${src ? `<img src="${esc(src)}" alt="">` : `<div class="hint">${ICON.image}<br>Lisa pilt tootest</div>`}</div>
      <div class="photo-btns">
        <label class="btn primary">${ICON.camera}Tee pilt<input type="file" accept="image/*" capture="environment" data-photo hidden></label>
        <label class="btn">${ICON.image}Vali galeriist<input type="file" accept="image/*" data-photo hidden></label>
      </div>
    </div>
    <div class="field"><div class="lbl">Kust ostsid</div>${picker("buyPlace", ranked("buyPlace", DEFAULTS.buyPlace), it.buyPlace, "või kirjuta ise…")}</div>
    <div class="field"><div class="lbl">Toote liik <span class="opt">(valikuline)</span></div>${picker("category", ranked("category", DEFAULTS.category), it.category, "või kirjuta ise…")}</div>
    <div class="field"><div class="lbl">Suurus</div>${picker("size", ranked("size", DEFAULTS.size), it.size, "nt 38 või W28")}</div>
    <div class="field"><label for="brand">Bränd <span class="opt">(valikuline)</span></label>
      <input class="input" id="brand" name="brand" list="brands" value="${esc(it.brand || "")}" autocapitalize="words">
      <datalist id="brands">${brands.map((b) => `<option value="${esc(b)}">`).join("")}</datalist></div>
    <div class="two">
      <div class="field"><label for="buyPrice">Ostuhind</label><div class="money"><input class="input" id="buyPrice" name="buyPrice" inputmode="decimal" required value="${esc(it.buyPrice ?? "")}"></div></div>
      <div class="field"><label for="buyShipping">Transport <span class="opt">(kui oli)</span></label><div class="money"><input class="input" id="buyShipping" name="buyShipping" inputmode="decimal" value="${esc(it.buyShipping ?? "")}"></div></div>
    </div>
    <div class="field"><label for="buyDate">Ostukuupäev</label><input class="input" type="date" id="buyDate" name="buyDate" value="${esc(it.buyDate || today())}"></div>
    <div class="field"><label for="note">Märkus <span class="opt">(nt väike plekk varrukal)</span></label><textarea class="input" id="note" name="note">${esc(it.note || "")}</textarea></div>
    <button class="btn primary block" id="save-btn">${S.editing ? "Salvesta muudatused" : "Pane riiulile"}</button>
  </form>`;
}

function mountForm() {
  const form = $("#item-form");
  bindPickers(form);
  form.querySelectorAll("[data-photo]").forEach((inp) => inp.addEventListener("change", async () => {
    const f = inp.files[0];
    if (!f) return;
    try {
      S.formPhoto = await shrink(f);
      $("#photo-box").innerHTML = `<img src="${S.formPhoto}" alt="">`;
    } catch { toast("Pilti ei õnnestunud lugeda"); }
    inp.value = "";
  }));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#save-btn");
    const base = S.editing || { id: uid(), created: new Date().toISOString(), status: "active" };
    const item = {
      ...base,
      buyPlace: pickerValue(form, "buyPlace"),
      category: pickerValue(form, "category"),
      size: pickerValue(form, "size"),
      brand: form.brand.value.trim(),
      buyPrice: num(form.buyPrice.value),
      buyShipping: numOrEmpty(form.buyShipping.value),
      buyDate: form.buyDate.value || today(),
      note: form.note.value.trim(),
    };
    delete item.photoData;
    btn.disabled = true;
    btn.innerHTML = `<div class="spin"></div>Salvestan…`;
    try {
      await saveItem(item, S.formPhoto);
      toast(S.editing ? "Muudetud" : "Riiulil! 🧺");
      const back = S.editing && S.editing.status === "sold" ? "archive" : "active";
      S.editing = null; S.formPhoto = null;
      go(back);
    } catch (err) {
      toast("Salvestamine ebaõnnestus: " + err.message);
      btn.disabled = false;
      btn.textContent = "Proovi uuesti";
    }
  });
}

// Pilt väiksemaks (max 1200 px, JPEG), et üleslaadimine oleks kiire ja Drive ei täituks.
function shrink(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 1200;
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* --- alumised lehed --- */

function openSheet(html, onMount) {
  const root = $("#sheet-root");
  root.innerHTML = `<div class="sheet-bg" data-close></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  root.querySelector("[data-close]").addEventListener("click", closeSheet);
  onMount && onMount(root.querySelector(".sheet"));
}
function closeSheet() { $("#sheet-root").innerHTML = ""; }

function sellSheet(it) {
  openSheet(`<h2>Müüdud! 🎉</h2><p class="lead">${esc(title(it))}${it.size ? ", " + esc(it.size) : ""} · kulu ${eur(cost(it))}</p>
    <form class="form" id="sell-form">
      <div class="field"><div class="lbl">Kus müüsid</div>${picker("sellPlace", ranked("sellPlace", DEFAULTS.sellPlace), it.sellPlace || "", "või kirjuta ise…")}</div>
      <div class="field"><label for="sellPrice">Müügihind</label><div class="money"><input class="input" id="sellPrice" name="sellPrice" inputmode="decimal" required></div></div>
      <label class="switch"><span>Hind sisaldab postitasu</span><input type="checkbox" name="incl"></label>
      <div class="field" id="postage-f" hidden><label for="sellPostage">Postitasu</label><div class="money"><input class="input" id="sellPostage" name="sellPostage" inputmode="decimal"></div></div>
      <div class="field"><label for="sellDate">Müügikuupäev</label><input class="input" type="date" id="sellDate" name="sellDate" value="${today()}"></div>
      <div class="preview"><span>Kasum</span><span id="pp">–</span></div>
      <button class="btn primary block" id="sell-btn">Salvesta müük</button>
    </form>`, (sh) => {
    const f = $("#sell-form", sh);
    bindPickers(f);
    const upd = () => {
      $("#postage-f", sh).hidden = !f.incl.checked;
      if (!f.sellPrice.value) { $("#pp", sh).textContent = "–"; return; }
      const p = profit({ ...it, sellPrice: f.sellPrice.value, sellInclPostage: f.incl.checked, sellPostage: f.sellPostage.value });
      $("#pp", sh).innerHTML = `<span class="${p >= 0 ? "pos" : "neg"}">${eur(p, true)}</span>`;
    };
    f.addEventListener("input", upd);
    f.addEventListener("change", upd);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("#sell-btn", sh);
      btn.disabled = true; btn.innerHTML = `<div class="spin"></div>Salvestan…`;
      try {
        await saveItem({
          ...strip(it), status: "sold",
          sellPlace: pickerValue(f, "sellPlace"), sellPrice: num(f.sellPrice.value),
          sellInclPostage: f.incl.checked, sellPostage: f.incl.checked ? num(f.sellPostage.value) : "",
          sellDate: f.sellDate.value || today(),
        });
        closeSheet();
        const p = profit(S.items.find((x) => x.id === it.id));
        toast(`Arhiivis. Kasum ${eur(p, true)}`);
        render();
      } catch (err) { toast("Ei õnnestunud: " + err.message); btn.disabled = false; btn.textContent = "Proovi uuesti"; }
    });
  });
}

function transferSheet() {
  const u = untransferred();
  openSheet(`<h2>Kandsid raha üle?</h2><p class="lead">Ülekandmata kasum on ${eur(u)}. Muuda summat, kui kandsid üle vähem.</p>
    <form class="form" id="tr-form">
      <div class="field"><label for="amount">Summa</label><div class="money"><input class="input" id="amount" name="amount" inputmode="decimal" value="${String(Math.max(0, u)).replace(".", ",")}" required></div></div>
      <button class="btn primary block" id="tr-btn">Jah, kandsin üle</button>
    </form>`, (sh) => {
    $("#tr-form", sh).addEventListener("submit", async (e) => {
      e.preventDefault();
      const amount = num(e.target.amount.value);
      if (amount <= 0) return toast("Sisesta summa");
      const btn = $("#tr-btn", sh); btn.disabled = true;
      try {
        const d = await call({ action: "transfer", amount, date: today() });
        S.transfers.push(d.transfer);
        saveCache();
        closeSheet();
        toast("Tubli! Raha on kõrval 🐷");
        render();
      } catch (err) { toast("Ei õnnestunud: " + err.message); btn.disabled = false; }
    });
  });
}

function confirmSheet(text, okLabel, onOk) {
  openSheet(`<h2>${esc(text)}</h2><p class="lead">Toode kaob äpist, aga rida jääb Google Sheeti alles.</p>
    <div class="form"><button class="btn primary block" id="ok" style="background:var(--neg)">${esc(okLabel)}</button>
    <button class="btn block" data-close>Tühista</button></div>`, (sh) => {
    sh.querySelector("[data-close]").addEventListener("click", closeSheet);
    $("#ok", sh).addEventListener("click", async () => { closeSheet(); await onOk(); });
  });
}

const strip = (it) => { const c = { ...it }; delete c.photoData; return c; };

/* --- analüüs --- */

function inPeriod(d) {
  if (S.period === "all") return true;
  if (!d) return false;
  if (S.period === "year") return String(d).slice(0, 4) === today().slice(0, 4);
  return daysBetween(d, today()) <= 30 && String(d) <= today();
}

function groupRows(sold, field, limit) {
  const g = {};
  sold.forEach((it) => { const k = it[field] || "Määramata"; (g[k] ||= { n: 0, p: 0 }); g[k].n++; g[k].p += profit(it); });
  const rows = Object.entries(g).sort((a, b) => b[1].p - a[1].p).slice(0, limit);
  if (!rows.length) return `<p class="muted small">Andmeid veel pole.</p>`;
  const max = Math.max(...rows.map(([, v]) => Math.abs(v.p)), 1);
  return `<div class="rows">${rows.map(([k, v]) => `<div class="r">
    <div class="top-line"><span>${esc(k)}</span><span class="val">${eur(v.p, true)} · ${v.n} tk</span></div>
    <div class="track"><div class="fill ${v.p < 0 ? "neg" : ""}" style="width:${Math.max(2, Math.abs(v.p) / max * 100)}%"></div></div>
  </div>`).join("")}</div>`;
}

function statsView() {
  const allSold = S.items.filter((i) => i.status === "sold");
  const sold = allSold.filter((i) => inPeriod(i.sellDate));
  const active = S.items.filter((i) => i.status === "active");
  const tot = sold.reduce((s, i) => s + profit(i), 0);
  const rev = sold.reduce((s, i) => s + num(i.sellPrice), 0);
  const spent = sold.reduce((s, i) => s + cost(i), 0);
  const withDays = sold.filter((i) => i.buyDate && i.sellDate);
  const avgDays = withDays.length ? Math.round(withDays.reduce((s, i) => s + daysBetween(i.buyDate, i.sellDate), 0) / withDays.length) : null;
  const margin = spent > 0 ? Math.round(tot / spent * 100) : null;
  const best = [...sold].sort((a, b) => profit(b) - profit(a))[0];
  const u = untransferred();

  // viimased 12 kuud
  const now = new Date();
  const months = [];
  for (let k = 11; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const its = allSold.filter((i) => String(i.sellDate).slice(0, 7) === key);
    months.push({ key, label: MONTHS[d.getMonth()], year: d.getFullYear(), p: its.reduce((s, i) => s + profit(i), 0), n: its.length });
  }
  const sel = months.find((m) => m.key === S.month) || months[11];
  const mmax = Math.max(...months.map((m) => Math.abs(m.p)), 1);

  const per = [["all", "Kogu aeg"], ["year", "See aasta"], ["30", "30 päeva"]];
  return `<div class="top"><h1>Analüüs</h1></div>
    ${banner()}
    <div class="chips">${per.map(([k, l]) => `<button class="chip ${S.period === k ? "on" : ""}" data-period="${k}">${l}</button>`).join("")}</div>
    <div class="tiles">
      <div class="tile hero"><div class="k">Kasum</div><div class="v ${tot < 0 ? "neg" : "pos"}">${eur(tot, true)}</div>
        <div class="s">${sold.length} müüki · müügitulu ${eur(rev)} · kulu ${eur(spent)}</div></div>
      <div class="tile"><div class="k">Keskmine kasum</div><div class="v">${sold.length ? eur(tot / sold.length, true) : "–"}</div><div class="s">toote kohta</div></div>
      <div class="tile"><div class="k">Marginaal</div><div class="v">${margin === null ? "–" : margin + "%"}</div><div class="s">kasum / kulu</div></div>
      <div class="tile"><div class="k">Müügiaeg</div><div class="v">${avgDays === null ? "–" : avgDays + " p"}</div><div class="s">ostust müügini</div></div>
      <div class="tile"><div class="k">Riiulil</div><div class="v">${active.length} tk</div><div class="s">seotud ${eur(active.reduce((s, i) => s + cost(i), 0))}</div></div>
      <div class="tile hero"><div class="k">Ülekandmata kasum</div><div class="v">${eur(u)}</div>
        <div class="s">Kokku kantud üle ${eur(S.transfers.reduce((s, t) => s + num(t.amount), 0))}</div>
        ${u > 0 ? `<button class="btn primary" style="margin-top:10px" data-act="transfer">Märgi ülekanne</button>` : ""}</div>
    </div>
    <div class="panel"><h2>Kasum kuude kaupa</h2>
      <div class="bars">${months.map((m) => `<button class="col ${m.key === sel.key ? "sel" : ""}" data-month="${m.key}" aria-label="${m.label} ${eur(m.p, true)}">
        <div class="bar ${m.p < 0 ? "neg" : ""}" style="height:${m.p ? Math.max(3, Math.abs(m.p) / mmax * 100) : 0}%"></div></button>`).join("")}</div>
      <div class="months">${months.map((m) => `<span>${m.label.slice(0, 3)}</span>`).join("")}</div>
      <div class="caption"><b>${sel.label} ${sel.year}:</b> ${eur(sel.p, true)} · ${sel.n} müüki</div>
    </div>
    <div class="panel"><h2>Kus müüb kõige paremini</h2>${groupRows(sold, "sellPlace", 8)}</div>
    <div class="panel"><h2>Toote liigid</h2>${groupRows(sold, "category", 8)}</div>
    <div class="panel"><h2>Brändid (top 6)</h2>${groupRows(sold, "brand", 6)}</div>
    <div class="panel"><h2>Ostukohad</h2>${groupRows(sold, "buyPlace", 8)}</div>
    ${best ? `<div class="panel"><h2>Parim diil</h2><div class="best">
      ${photoSrc(best) ? `<img src="${esc(photoSrc(best))}" alt="">` : `<div class="noimg"></div>`}
      <div><b>${esc(title(best))}</b><div class="muted small">Ostetud ${eur(cost(best))}, müüdud ${eur(num(best.sellPrice))}</div>
      <div style="color:var(--pos);font-weight:700">${eur(profit(best), true)}</div></div></div></div>` : ""}`;
}

/* --- rohkem / paigaldusjuhend --- */

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone = window.navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;

function guideHTML() {
  return `<ol class="steps">
    <li><div><b>Ava see leht Safaris</b>Kui oled Chrome'is või Instagrami sees, kopeeri link ja ava see Safaris.</div></li>
    <li><div><b>Vajuta Jaga nuppu <span class="ic">${ICON.share}</span></b>
      Uuemas iOS-is on see peidus: vajuta all paremal <span class="ic">${ICON.dots}</span> ja siis <b style="display:inline">Jaga</b>.
      <div class="en">Inglise keeles: Share</div></div></li>
    <li><div><b>Vali "Lisa avakuvale" <span class="ic">${ICON.plus}</span></b>Keri menüüs veidi alla, kui kohe ei näe.
      <div class="en">Inglise keeles: Add to Home Screen</div></div></li>
    <li><div><b>Vajuta "Lisa"</b>Kui näed lülitit "Ava veebiäpina", jäta see sisse.
      <div class="en">Inglise keeles: Add · Open as Web App</div></div></li>
    <li><div><b>Ava Tiia Riiul avakuvalt</b>Edaspidi ava äpp alati ikoonist. Siis on see täisekraanil nagu päris äpp.</div></li>
  </ol>`;
}

function guideSheet() {
  openSheet(`<h2>Pane Tiia Riiul avakuvale</h2><p class="lead">Võtab 20 sekundit ja siis on äpp iPhone'is nagu iga teine äpp.</p>
    ${guideHTML()}<button class="btn primary block" data-close>Selge</button>`, (sh) => {
    sh.querySelector("[data-close]").addEventListener("click", () => { lsSet("tr-guide-seen", "1"); closeSheet(); });
  });
}

function moreView() {
  const moved = S.transfers.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return `<div class="top"><h1>Rohkem</h1></div>
    <div class="list">
      <button data-act="guide"><span>📲 Kuidas avakuvale panna</span><span class="muted">›</span></button>
      <button data-act="reload"><span>🔄 Värskenda andmeid</span><span class="muted">›</span></button>
      ${CFG.SHEET_URL ? `<a href="${esc(CFG.SHEET_URL)}" target="_blank" rel="noopener"><span>📊 Ava Google Sheet</span><span class="muted">›</span></a>` : ""}
      ${DEMO ? "" : `<button data-act="logout"><span>🔒 Logi välja (küsib PIN-i uuesti)</span><span class="muted">›</span></button>`}
    </div>
    <div class="panel"><h2>Ülekanded eraldi kontole</h2>
      ${moved.length ? `<div class="rows">${moved.map((t) => `<div class="top-line" style="display:flex;justify-content:space-between"><span>${fmtDate(t.date)}</span><b>${eur(num(t.amount))}</b></div>`).join("")}</div>`
        : `<p class="muted small" style="margin:0">Veel pole ühtegi. Meeldetuletus tuleb, kui ülekandmata kasumit on ${THRESHOLD} € või rohkem.</p>`}
    </div>
    <p class="muted small" style="text-align:center">Tiia Riiul · ${DEMO ? "demorežiim" : "andmed Google Sheetis"}</p>`;
}

/* ---------- sündmused ---------- */

function go(tab) {
  if (tab !== "form" && S.tab === "form") { S.editing = null; S.formPhoto = null; }
  S.tab = tab;
  closeSheet();
  render();
  window.scrollTo(0, 0);
}

document.addEventListener("click", async (e) => {
  const t = e.target;

  const tabBtn = t.closest("[data-tab]");
  if (tabBtn) {
    if (tabBtn.dataset.tab === "form") { S.editing = null; S.formPhoto = null; }
    return go(tabBtn.dataset.tab);
  }

  const catBtn = t.closest("[data-cat]");
  if (catBtn) { S.cat[S.tab] = catBtn.dataset.cat; return render(); }

  const perBtn = t.closest("[data-period]");
  if (perBtn) { S.period = perBtn.dataset.period; return render(); }

  const mBtn = t.closest("[data-month]");
  if (mBtn) { S.month = mBtn.dataset.month; return render(); }

  const actBtn = t.closest("[data-act]");
  const card = t.closest(".card");
  if (actBtn) {
    const act = actBtn.dataset.act;
    const it = card && S.items.find((x) => x.id === card.dataset.id);
    if (act === "layout") { S.layout = S.layout === "vertical" ? "horizontal" : "vertical"; lsSet("tr-layout", S.layout); return render(); }
    if (act === "transfer") return transferSheet();
    if (act === "snooze") { lsSet("tr-snooze", String(Date.now() + 86400000)); return render(); }
    if (act === "guide") return guideSheet();
    if (act === "reload") { toast("Värskendan…"); await load(); return toast("Värske"); }
    if (act === "logout") { lsDel(KEY); lsDel(CACHE); S.items = []; S.transfers = []; S.loaded = false; return render(); }
    if (act === "cancel-edit") { const back = S.editing && S.editing.status === "sold" ? "archive" : "active"; return go(back); }
    if (!it) return;
    if (act === "sell") return sellSheet(it);
    if (act === "edit") { S.editing = strip(it); S.formPhoto = null; S.tab = "form"; render(); return window.scrollTo(0, 0); }
    if (act === "reactivate") {
      try {
        await saveItem({ ...strip(it), status: "active", sellPlace: "", sellPrice: "", sellInclPostage: false, sellPostage: "", sellDate: "" });
        toast("Tagasi riiulil"); render();
      } catch (err) { toast("Ei õnnestunud: " + err.message); }
      return;
    }
    if (act === "delete") {
      return confirmSheet("Kustutada see toode?", "Kustuta", async () => {
        try { await saveItem({ ...strip(it), status: "deleted" }); toast("Kustutatud"); render(); }
        catch (err) { toast("Ei õnnestunud: " + err.message); }
      });
    }
    return;
  }

  // Pildile vajutus näitab/peidab info
  if (card) {
    const wasOpen = card.classList.contains("open");
    document.querySelectorAll(".card.open").forEach((c) => c.classList.remove("open"));
    if (!wasOpen) card.classList.add("open");
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "q") {
    S.q[S.tab] = e.target.value;
    $("#results").innerHTML = resultsHTML(filtered(S.tab).list);
  }
});

document.addEventListener("submit", (e) => {
  if (e.target.id !== "pin-form") return;
  e.preventDefault();
  lsSet(KEY, $("#pin").value.trim());
  S.pinError = "";
  S.loaded = false;
  render();
  load();
});

/* ---------- käivitus ---------- */

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
render();
if (!needsPin()) load();
if (isIOS && !standalone && !lsGet("tr-guide-seen")) setTimeout(guideSheet, 600);
