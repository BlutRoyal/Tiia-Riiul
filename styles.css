:root {
  --bg: #faf6f1;
  --surface: #ffffff;
  --surface-2: #f3ebe3;
  --ink: #2b2420;
  --ink-2: #6b5f57;
  --muted: #998d84;
  --line: #e8ddd3;
  --accent: #c2603f;
  --accent-soft: #f6e1d8;
  --on-accent: #ffffff;
  --pos: #2e7a57;
  --neg: #b4473a;
  --warn-bg: #fff1d6;
  --warn-ink: #6e4a07;
  --shade: rgba(20, 14, 10, .62);
  --nav-h: 64px;
  --radius: 16px;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #1b1714; --surface: #26201c; --surface-2: #312923; --ink: #f3ece6; --ink-2: #c7bbb1;
    --muted: #8f837a; --line: #3b322c; --accent: #e07c5a; --accent-soft: #452a20; --on-accent: #1b1714;
    --pos: #63c191; --neg: #ec8576; --warn-bg: #3d2f12; --warn-ink: #f3d28c; --shade: rgba(0, 0, 0, .7);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #1b1714; --surface: #26201c; --surface-2: #312923; --ink: #f3ece6; --ink-2: #c7bbb1;
  --muted: #8f837a; --line: #3b322c; --accent: #e07c5a; --accent-soft: #452a20; --on-accent: #1b1714;
  --pos: #63c191; --neg: #ec8576; --warn-bg: #3d2f12; --warn-ink: #f3d28c; --shade: rgba(0, 0, 0, .7);
  color-scheme: dark;
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body { margin: 0; background: var(--bg); color: var(--ink); }
body {
  font: 16px/1.4 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  overscroll-behavior-y: none;
}
button, input, textarea, select { font: inherit; color: inherit; }
button { cursor: pointer; }
img { display: block; }

#view {
  padding: calc(env(safe-area-inset-top) + 8px) 16px calc(var(--nav-h) + env(safe-area-inset-bottom) + 24px);
  max-width: 640px;
  margin: 0 auto;
}

/* Alumine menüü */
#nav {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 20;
  display: flex; justify-content: space-around; align-items: center;
  height: calc(var(--nav-h) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
  border-top: 1px solid var(--line);
}
.nav-btn {
  flex: 1; border: 0; background: none; color: var(--muted);
  display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; padding: 6px 0;
}
.nav-btn svg, .nav-add svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.nav-btn svg circle { fill: currentColor; stroke: none; }
.nav-btn.on { color: var(--accent); }
.nav-add {
  width: 52px; height: 52px; border-radius: 50%; border: 0; margin: 0 6px;
  background: var(--accent); color: var(--on-accent);
  display: grid; place-items: center; box-shadow: 0 4px 14px rgba(194, 96, 63, .35);
}
.nav-add svg { width: 28px; height: 28px; stroke-width: 2.4; }

/* Päis */
.top { display: flex; align-items: center; gap: 8px; margin: 4px 0 12px; }
.top h1 { font-size: 26px; line-height: 1.15; margin: 0; flex: 1; letter-spacing: -.01em; }
.top .count { color: var(--muted); font-size: 15px; font-weight: 400; margin-left: 4px; }
.icon-btn {
  width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--line);
  background: var(--surface); display: grid; place-items: center; color: var(--ink-2);
}
.icon-btn svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

.search {
  display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--line);
  border-radius: 12px; padding: 0 12px; height: 44px; margin-bottom: 10px;
}
.search svg { width: 18px; height: 18px; flex: none; fill: none; stroke: var(--muted); stroke-width: 2; stroke-linecap: round; }
.search input { border: 0; outline: 0; background: none; flex: 1; min-width: 0; height: 100%; font-size: 16px; }

.chips { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; margin: 0 -16px 14px; padding: 0 16px; }
.chips::-webkit-scrollbar { display: none; }
.chip {
  flex: none; border: 1px solid var(--line); background: var(--surface); color: var(--ink-2);
  border-radius: 999px; padding: 7px 14px; font-size: 14px; white-space: nowrap;
}
.chip.on { background: var(--ink); border-color: var(--ink); color: var(--bg); }

/* Meeldetuletus */
.banner {
  background: var(--warn-bg); color: var(--warn-ink); border-radius: var(--radius); padding: 14px 16px; margin-bottom: 14px;
  display: grid; gap: 10px;
}
.banner strong { font-size: 17px; }
.banner .row { display: flex; gap: 8px; }

/* Voog */
.feed.vertical { display: grid; gap: 16px; }
.feed.horizontal {
  display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; margin: 0 -16px; padding: 0 16px;
  scrollbar-width: none;
}
.feed.horizontal::-webkit-scrollbar { display: none; }
.feed.horizontal .card {
  flex: 0 0 100%; scroll-snap-align: center;
  height: calc(100dvh - 270px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); min-height: 360px;
}
.feed.horizontal .card .ph { aspect-ratio: auto; height: 100%; }
.card {
  position: relative; border-radius: var(--radius); overflow: hidden; background: var(--surface-2);
  user-select: none; -webkit-user-select: none;
}
.card .ph { width: 100%; aspect-ratio: 4 / 5; object-fit: cover; background: var(--surface-2); }
.card .noph { display: grid; place-items: center; color: var(--muted); font-size: 14px; }
.card .noph svg { width: 48px; height: 48px; fill: none; stroke: currentColor; stroke-width: 1.4; }
.tag {
  position: absolute; left: 10px; bottom: 10px; display: flex; gap: 6px; transition: opacity .2s;
}
.tag span {
  background: rgba(255, 255, 255, .92); color: #2b2420; border-radius: 999px; padding: 4px 10px; font-size: 13px; font-weight: 600;
}
.tag span.pos { color: #1f6646; }
.tag span.neg { color: #a33a2e; }
.card .info {
  position: absolute; inset: 0; background: var(--shade); color: #fff;
  padding: 18px; display: flex; flex-direction: column; justify-content: flex-end; gap: 12px;
  opacity: 0; pointer-events: none; transition: opacity .2s;
  overflow-y: auto;
}
.card.open .info { opacity: 1; pointer-events: auto; }
.card.open .tag { opacity: 0; }
.info h3 { margin: 0; font-size: 22px; line-height: 1.2; }
.info .sub { color: rgba(255, 255, 255, .8); font-size: 14px; margin-top: 2px; }
.info dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 14px; margin: 0; font-size: 15px; }
.info dt { color: rgba(255, 255, 255, .72); }
.info dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
.info dd.big { font-weight: 700; font-size: 17px; }
.info .note { background: rgba(255, 255, 255, .14); border-radius: 10px; padding: 8px 10px; font-size: 14px; white-space: pre-wrap; }
.info .acts { display: flex; gap: 8px; flex-wrap: wrap; }
.info .acts .btn { flex: 1; }

.empty { text-align: center; color: var(--muted); padding: 48px 16px; }
.empty svg { width: 56px; height: 56px; fill: none; stroke: currentColor; stroke-width: 1.3; margin-bottom: 8px; }
.empty p { margin: 4px 0 16px; }

/* Nupud */
.btn {
  border: 0; border-radius: 12px; padding: 12px 16px; font-weight: 600; font-size: 15px;
  background: var(--surface-2); color: var(--ink);
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px;
}
.btn.primary { background: var(--accent); color: var(--on-accent); }
.btn.light { background: rgba(255, 255, 255, .95); color: #2b2420; }
.btn.ghost-light { background: rgba(255, 255, 255, .16); color: #fff; }
.btn.danger { background: transparent; color: var(--neg); border: 1px solid var(--line); }
.btn.dark { background: var(--warn-ink); color: var(--warn-bg); }
.btn.block { width: 100%; }
.btn[disabled] { opacity: .55; }
.btn svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; stroke-linejoin: round; }

/* Vorm */
.form { display: grid; gap: 18px; }
.field > label, .field > .lbl { display: block; font-size: 13px; font-weight: 600; color: var(--ink-2); margin-bottom: 8px; text-transform: uppercase; letter-spacing: .04em; }
.field .opt { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--muted); }
.input {
  width: 100%; border: 1px solid var(--line); background: var(--surface); border-radius: 12px;
  padding: 0 14px; height: 48px; font-size: 16px; outline: 0;
}
textarea.input { height: auto; min-height: 84px; padding: 12px 14px; resize: vertical; }
.input:focus { border-color: var(--accent); }
.money { position: relative; }
.money .input { padding-right: 36px; }
.money::after { content: "€"; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.picker .chips { flex-wrap: wrap; overflow: visible; margin: 0 0 8px; padding: 0; }
.picker .input { height: 42px; font-size: 15px; }

.photo-box {
  border-radius: var(--radius); overflow: hidden; background: var(--surface-2); border: 1px dashed var(--line);
  aspect-ratio: 4 / 5; display: grid; place-items: center; position: relative;
}
.photo-box img { width: 100%; height: 100%; object-fit: cover; }
.photo-box .hint { color: var(--muted); text-align: center; font-size: 14px; }
.photo-box .hint svg { width: 44px; height: 44px; fill: none; stroke: currentColor; stroke-width: 1.4; }
.photo-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.switch { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
.switch input { width: 22px; height: 22px; accent-color: var(--accent); }
.preview { background: var(--accent-soft); border-radius: 12px; padding: 12px 14px; display: flex; justify-content: space-between; font-weight: 600; }
.preview .pos { color: var(--pos); } .preview .neg { color: var(--neg); }

/* Alumine leht (modal) */
.sheet-bg { position: fixed; inset: 0; background: rgba(0, 0, 0, .4); z-index: 40; animation: fade .2s; }
.sheet {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-height: 92dvh; overflow-y: auto;
  background: var(--bg); border-radius: 22px 22px 0 0; padding: 10px 16px calc(20px + env(safe-area-inset-bottom));
  max-width: 640px; margin: 0 auto; animation: up .25s ease-out;
}
.sheet .grab { width: 40px; height: 5px; border-radius: 3px; background: var(--line); margin: 0 auto 12px; }
.sheet h2 { margin: 0 0 4px; font-size: 22px; }
.sheet .lead { color: var(--ink-2); margin: 0 0 16px; font-size: 15px; }
@keyframes up { from { transform: translateY(100%); } }
@keyframes fade { from { opacity: 0; } }

/* Analüüs */
.tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
.tile { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px; }
.tile.hero { grid-column: 1 / -1; }
.tile .k { font-size: 13px; color: var(--ink-2); }
.tile .v { font-size: 24px; font-weight: 700; margin-top: 2px; font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
.tile.hero .v { font-size: 38px; }
.tile .s { font-size: 13px; color: var(--muted); margin-top: 2px; }
.v.pos { color: var(--pos); } .v.neg { color: var(--neg); }
.panel { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 16px; margin-bottom: 14px; }
.panel h2 { font-size: 16px; margin: 0 0 12px; }
.bars { display: flex; align-items: flex-end; gap: 4px; height: 140px; border-bottom: 1px solid var(--line); position: relative; }
.bars .col { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: stretch; border: 0; background: none; padding: 0; }
.bars .bar { background: var(--accent); border-radius: 4px 4px 0 0; min-height: 2px; opacity: .85; }
.bars .bar.neg { background: var(--neg); }
.bars .col.sel .bar { opacity: 1; outline: 2px solid var(--ink); outline-offset: 1px; }
.months { display: flex; gap: 4px; margin-top: 6px; }
.months span { flex: 1; text-align: center; font-size: 10px; color: var(--muted); }
.caption { font-size: 14px; color: var(--ink-2); margin-top: 10px; min-height: 20px; }
.caption b { color: var(--ink); }
.rows { display: grid; gap: 12px; }
.r .top-line { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; gap: 8px; }
.r .top-line .val { font-variant-numeric: tabular-nums; color: var(--ink-2); white-space: nowrap; }
.r .track { height: 8px; border-radius: 4px; background: var(--surface-2); overflow: hidden; }
.r .fill { height: 100%; background: var(--accent); border-radius: 0 4px 4px 0; }
.r .fill.neg { background: var(--neg); }
.best { display: flex; gap: 12px; align-items: center; }
.best img, .best .noimg { width: 64px; height: 80px; border-radius: 10px; object-fit: cover; background: var(--surface-2); flex: none; }
.muted { color: var(--muted); }
.small { font-size: 13px; }

/* Rohkem / juhend */
.list { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; margin-bottom: 14px; }
.list > * { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--line); text-decoration: none; color: inherit; background: none; border-left: 0; border-right: 0; border-top: 0; width: 100%; text-align: left; font-size: 16px; }
.list > *:last-child { border-bottom: 0; }
.steps { counter-reset: s; display: grid; gap: 12px; padding: 0; margin: 0 0 16px; list-style: none; }
.steps li { counter-increment: s; display: grid; grid-template-columns: 36px 1fr; gap: 12px; align-items: start; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px; }
.steps li::before { content: counter(s); width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: var(--on-accent); display: grid; place-items: center; font-weight: 700; }
.steps b { display: block; margin-bottom: 2px; }
.steps .ic { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: var(--surface-2); vertical-align: middle; margin: 0 2px; }
.steps .ic svg { width: 18px; height: 18px; fill: none; stroke: #0a84ff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.steps .en { color: var(--muted); font-size: 13px; }

.pin { max-width: 320px; margin: 18vh auto 0; text-align: center; display: grid; gap: 14px; }
.pin img { width: 84px; height: 84px; border-radius: 20px; margin: 0 auto; }
.pin .input { text-align: center; font-size: 24px; letter-spacing: .3em; }

#toast {
  position: fixed; left: 50%; bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + 16px); transform: translate(-50%, 20px);
  background: var(--ink); color: var(--bg); padding: 10px 16px; border-radius: 12px; font-size: 14px; z-index: 60;
  opacity: 0; pointer-events: none; transition: .25s; max-width: calc(100% - 32px); text-align: center;
}
#toast.show { opacity: 1; transform: translate(-50%, 0); }
.spin { width: 18px; height: 18px; border-radius: 50%; border: 2px solid currentColor; border-right-color: transparent; animation: rot .7s linear infinite; }
@keyframes rot { to { transform: rotate(360deg); } }
.loading { display: grid; place-items: center; padding: 60px 0; color: var(--muted); }
.demo-note { font-size: 13px; background: var(--accent-soft); color: var(--ink-2); padding: 8px 12px; border-radius: 10px; margin-bottom: 12px; }
