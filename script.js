/* =========================================================
   CONTENT — edit this to make the site yours
   ========================================================= */
// `links` is optional: add { label, url } pairs (live demo, repo…) and they appear in the detail panel.
const PROJECTS = [
  { id: "drift", title: "Drift City", type: "game", label: "Browser game",
    blurb: "An endless neon-city arcade racer for desktop and mobile.",
    tags: ["TypeScript", "React 19", "Three.js", "Zustand", "Vite"],
    thumb: "linear-gradient(135deg,#1a0533,#ff2e88,#00e5ff)",
    body: "Weave through traffic, chain near misses and drifts into combos, collect coins and spend them on six distinct cars, upgrades and cosmetics. There are Endless and 90-second Time Trial modes, with touch controls on mobile. Every model, texture, sound effect and music track is generated procedurally at runtime, so the game ships with no external asset files. It's covered by unit tests and a headless gameplay simulation." },
  { id: "deadzone", title: "Project: Deadzone", type: "game", label: "Browser game",
    blurb: "A city-set action shooter built from scratch in JavaScript.",
    tags: ["JavaScript", "Canvas / WebGL", "Game AI"],
    thumb: "linear-gradient(135deg,#0f2027,#2c5364,#ff3b3b)",
    body: "A browser shooter with its own city builder, enemy AI, weapon system, multiple game modes, HUD, menus, audio and a persistent player profile, all split into hand-written modules with no game engine." },
  { id: "taster", title: "Taster", type: "web", label: "Web app",
    blurb: "Try an Irish college course before you put it on your CAO.",
    tags: ["JavaScript", "HTML", "CSS"],
    thumb: "linear-gradient(135deg,#134e5e,#71b280)",
    body: "Search any Irish undergraduate course and actually try the work: real tasks, a real week and real exam questions. Course content covers areas from engineering and architecture to arts, business and pharmacy, so students can test-drive a course before committing to it." },
  { id: "codequest", title: "Code Quest", type: "web", label: "Learning platform",
    blurb: "Duolingo-style courses that teach nine programming languages by doing.",
    tags: ["Node.js", "Firebase", "Firestore", "sql.js"],
    thumb: "linear-gradient(135deg,#3a1c71,#d76d77,#ffaf7b)",
    body: "C, Python, C++, C#, JavaScript, Java, Go, Rust and SQL under one account. Each course has a lesson path, quizzes, a practice deck built from your own mistakes, bookmarks, a glossary and a playground that runs real code. XP, streaks, achievements and a leaderboard are shared across languages, and every exercise is automatically verified against the real compiler or interpreter. It grew out of separate C Quest, Python Quest and C++/C# Quest sites." },
  { id: "standup", title: "standup-scribe", type: "tool", label: "npm package",
    blurb: "Write your daily stand-up from your git history in one command.",
    tags: ["Node.js", "CLI", "LLMs", "Zero dependencies"],
    thumb: "linear-gradient(135deg,#11998e,#38ef7d)",
    body: "`standup` reads what you committed since your last working day, across every branch and every repo you point it at, and turns it into a short Yesterday / Today / Blockers update. It works with free AI providers (Ollama, Groq or Gemini) or with no AI at all, outputs Slack-ready formatting, and has zero dependencies.",
    links: [
      { label: "npm ↗", url: "https://www.npmjs.com/package/standup-scribe" },
      { label: "Source ↗", url: "https://github.com/JamieRuane/standup-scribe" },
    ] },
];

const ROTATING_WORDS = ["games", "learning tools", "dev tools", "web apps"];
const EMAIL = "26445751@studentmail.ul.ie";

/* =========================================================
   HELPERS
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};
const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}
function accent() { return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(); }

/* =========================================================
   1. PARTICLE FIELD — reacts to cursor, ripples on click
   ========================================================= */
const field = (() => {
  const cvs = $("#field"), ctx = cvs.getContext("2d");
  let W, H, dots = [], mode = "drift", ripples = [];
  const SPACING = 34;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cvs.width = innerWidth * dpr; H = cvs.height = innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(dpr, dpr);
    dots = [];
    for (let y = SPACING / 2; y < innerHeight; y += SPACING)
      for (let x = SPACING / 2; x < innerWidth; x += SPACING)
        dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
  }

  function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const col = accent();
    const fg = getComputedStyle(document.body).color;
    for (const d of dots) {
      // gentle idle wave
      const wave = reduceMotion ? 0 : Math.sin(t / 1400 + d.ox * 0.01 + d.oy * 0.013) * 3;
      let tx = d.ox, ty = d.oy + wave;

      const dx = d.x - mouse.x, dy = d.y - mouse.y;
      const dist = Math.hypot(dx, dy), R = 140;
      if (mouse.active && dist < R) {
        const f = (1 - dist / R);
        const dir = mode === "attract" ? -1 : 1;
        tx += (dx / (dist || 1)) * f * 40 * dir;
        ty += (dy / (dist || 1)) * f * 40 * dir;
      }
      for (const r of ripples) {
        const rd = Math.hypot(d.ox - r.x, d.oy - r.y);
        const band = Math.abs(rd - r.r);
        if (band < 40) {
          const push = (1 - band / 40) * 18 * r.life;
          tx += ((d.ox - r.x) / (rd || 1)) * push;
          ty += ((d.oy - r.y) / (rd || 1)) * push;
        }
      }
      d.vx += (tx - d.x) * 0.12; d.vy += (ty - d.y) * 0.12;
      d.vx *= 0.72; d.vy *= 0.72;
      d.x += d.vx; d.y += d.vy;

      const disp = Math.hypot(d.x - d.ox, d.y - d.oy);
      const hot = Math.min(disp / 20, 1);
      ctx.globalAlpha = 0.18 + hot * 0.8;
      ctx.fillStyle = hot > 0.15 ? col : fg;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.2 + hot * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ripples = ripples.filter(r => (r.r += 9, r.life *= 0.965, r.life > 0.05));
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  addEventListener("pointerdown", e => {
    if (e.target.closest("dialog, a, button, input")) return;
    ripples.push({ x: e.clientX, y: e.clientY, r: 0, life: 1 });
  });
  resize();
  requestAnimationFrame(frame);

  return {
    toggleMode() { mode = mode === "drift" ? "attract" : "drift"; return mode; },
  };
})();

addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
document.addEventListener("pointerleave", () => (mouse.active = false));

/* =========================================================
   2. CUSTOM CURSOR + MAGNETIC ELEMENTS
   ========================================================= */
if (finePointer && !reduceMotion) {
  const cur = $(".cursor"), label = $(".cursor-label");
  let cx = mouse.x, cy = mouse.y;
  (function loop() {
    cx += (mouse.x - cx) * 0.22; cy += (mouse.y - cy) * 0.22;
    cur.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener("pointerover", e => {
    const el = e.target.closest("[data-cursor]");
    cur.classList.toggle("big", !!el);
    label.textContent = el ? el.dataset.cursor : "";
  });

  document.addEventListener("pointermove", e => {
    $$("[data-magnetic]").forEach(el => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2), my = e.clientY - (r.top + r.height / 2);
      const near = Math.abs(mx) < r.width / 2 + 30 && Math.abs(my) < r.height / 2 + 30;
      el.style.transform = near ? `translate(${mx * 0.25}px, ${my * 0.35}px)` : "";
    });
  });
} else {
  $(".cursor").remove();
}

/* =========================================================
   3. HERO — text scramble, word rotator, live clock
   ========================================================= */
function scramble(el) {
  const target = el.dataset.text, chars = "!<>-_\\/[]{}—=+*^?#01";
  let frame = 0;
  const total = target.length * 2 + 10;
  (function tick() {
    el.textContent = target.split("").map((c, i) =>
      c === " " ? " " : frame > i * 2 + 6 ? c : chars[(Math.random() * chars.length) | 0]
    ).join("");
    if (++frame <= total) requestAnimationFrame(tick);
  })();
}
if (!reduceMotion) $$(".scramble").forEach((el, i) => setTimeout(() => scramble(el), i * 250));
$$(".scramble").forEach(el => el.addEventListener("pointerenter", () => scramble(el)));

(() => {
  const el = $(".rotator"); let i = 0;
  setInterval(() => {
    el.classList.add("out");
    setTimeout(() => {
      i = (i + 1) % ROTATING_WORDS.length;
      el.textContent = ROTATING_WORDS[i];
      el.classList.remove("out"); el.classList.add("in");
      void el.offsetWidth;
      el.classList.remove("in");
    }, 450);
  }, 2600);
})();

(function clock() {
  $("#clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  setTimeout(clock, 15000);
})();
$("#year").textContent = new Date().getFullYear();

/* =========================================================
   4. WORK — render cards, filter, 3D tilt, detail drawer
   ========================================================= */
// Main work (sites and tools) goes in #project-grid; games get their own, smaller #games-grid.
const renderCards = list => list.map((p, i) => `
  <article class="card reveal" data-type="${p.type}" data-id="${p.id}" data-cursor="open" tabindex="0">
    <div class="thumb" style="--thumb:${p.thumb}"></div>
    <span class="idx">${String(i + 1).padStart(2, "0")} / ${p.label}</span>
    <div class="meta">
      <h3>${p.title}</h3>
      <p>${p.blurb}</p>
      <div class="tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
    </div>
  </article>`).join("");
$("#project-grid").innerHTML = renderCards(PROJECTS.filter(p => p.type !== "game"));
$("#games-grid").innerHTML = renderCards(PROJECTS.filter(p => p.type === "game"));

$$("#work .chip").forEach(chip => chip.addEventListener("click", () => {
  $$("#work .chip").forEach(c => c.classList.toggle("active", c === chip));
  const f = chip.dataset.filter;
  $$("#project-grid .card").forEach(card => card.classList.toggle("hidden", f !== "all" && card.dataset.type !== f));
}));

$$(".card").forEach(card => {
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", `${px * 100}%`);
    card.style.setProperty("--my", `${py * 100}%`);
    if (!reduceMotion) card.style.transform = `rotateY(${(px - 0.5) * 12}deg) rotateX(${(0.5 - py) * 12}deg)`;
  });
  card.addEventListener("pointerleave", () => (card.style.transform = ""));
  const open = () => openProject(card.dataset.id);
  card.addEventListener("click", open);
  card.addEventListener("keydown", e => e.key === "Enter" && open());
});

function openProject(id) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;
  $("#project-drawer .drawer-body").innerHTML = `
    <div class="hero-img" style="--thumb:${p.thumb}"></div>
    <p class="mono" style="color:var(--muted)">${p.label}</p>
    <h2>${p.title}</h2>
    <p>${p.blurb}</p>
    <p style="color:var(--muted)">${p.body.replace(/`([^`]+)`/g, "<code>$1</code>")}</p>
    <div class="tags drawer-tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
    ${p.links ? `<div class="hero-cta" style="margin-top:28px">${p.links.map((l, i) =>
      `<a class="btn ${i ? "ghost" : ""}" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join("")}</div>` : ""}`;
  $("#project-drawer").showModal();
}

/* Close any dialog via [data-close] or backdrop click */
$$("dialog").forEach(d => {
  d.addEventListener("click", e => {
    if (e.target === d || e.target.closest("[data-close]")) d.close();
  });
});

/* =========================================================
   5. SCROLL — reveal, progress bar, active section index
   ========================================================= */
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
}), { threshold: 0.15 });
$$(".reveal").forEach(el => io.observe(el));

const sections = $$("main section");
const sectionIO = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  const id = en.target.id;
  $$(".section-index li").forEach(li => li.classList.toggle("active", li.dataset.target === id));
  $$(".nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
}), { threshold: 0.4 });
sections.forEach(s => sectionIO.observe(s));
$$(".section-index li").forEach(li => li.addEventListener("click", () =>
  document.getElementById(li.dataset.target).scrollIntoView()));

addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  $(".progress span").style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });

/* =========================================================
   6. THEME + ACCENT
   ========================================================= */
const root = document.documentElement;
const ACCENTS = ["#c6ff3d", "#ff5c39", "#7a5cff", "#00e0c6", "#ffcc00", "#ff4fa3"];
function setTheme(t) { root.dataset.theme = t; store.set("theme", t); }
function setAccent(c) { root.style.setProperty("--accent", c); store.set("accent", c); }
setTheme(store.get("theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
if (store.get("accent")) setAccent(store.get("accent"));

$("#theme-toggle").addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
function shuffleAccent() {
  const cur = accent();
  const next = ACCENTS.filter(c => c !== cur)[(Math.random() * (ACCENTS.length - 1)) | 0];
  setAccent(next); toast(`accent → ${next}`);
}

/* =========================================================
   7. LAB
   ========================================================= */
$$("[data-lab]").forEach(b => b.addEventListener("click", () => {
  if (b.dataset.lab === "gravity") toast(`particles: ${field.toggleMode()}`);
  if (b.dataset.lab === "accent") shuffleAccent();
}));

/* =========================================================
   8. COMMAND PALETTE (Ctrl/Cmd + K)
   ========================================================= */
const COMMANDS = [
  ...["home", "work", "games", "about", "lab", "contact"].map(s => ({
    label: `Go to ${s}`, hint: "nav", run: () => document.getElementById(s).scrollIntoView() })),
  ...PROJECTS.map(p => ({ label: `Open ${p.title}`, hint: "project", run: () => openProject(p.id) })),
  { label: "Toggle theme", hint: "ui", run: () => $("#theme-toggle").click() },
  { label: "Shuffle accent colour", hint: "ui", run: shuffleAccent },
  { label: "Toggle particle gravity", hint: "lab", run: () => toast(`particles: ${field.toggleMode()}`) },
  { label: "Open terminal", hint: "fun", run: openTerminal },
  { label: "Copy email", hint: "contact", run: () => navigator.clipboard?.writeText(EMAIL).then(() => toast("email copied")) },
];
const palette = $("#palette"), pInput = $("#palette-input"), pList = $("#palette-list");
let pSel = 0, pMatches = COMMANDS;

function renderPalette() {
  const q = pInput.value.toLowerCase().trim();
  pMatches = COMMANDS.filter(c => c.label.toLowerCase().includes(q));
  pSel = Math.min(pSel, Math.max(pMatches.length - 1, 0));
  pList.innerHTML = pMatches.map((c, i) =>
    `<li role="option" class="${i === pSel ? "sel" : ""}" data-i="${i}">${c.label}<small>${c.hint}</small></li>`
  ).join("") || `<li>No results</li>`;
}
function openPalette() { pInput.value = ""; pSel = 0; renderPalette(); palette.showModal(); pInput.focus(); }
function runSelected(i = pSel) { const c = pMatches[i]; if (!c) return; palette.close(); c.run(); }

pInput.addEventListener("input", () => { pSel = 0; renderPalette(); });
pInput.addEventListener("keydown", e => {
  if (e.key === "ArrowDown") { pSel = (pSel + 1) % pMatches.length; renderPalette(); e.preventDefault(); }
  if (e.key === "ArrowUp") { pSel = (pSel - 1 + pMatches.length) % pMatches.length; renderPalette(); e.preventDefault(); }
  if (e.key === "Enter") runSelected();
});
pList.addEventListener("click", e => { const li = e.target.closest("li[data-i]"); if (li) runSelected(+li.dataset.i); });
$("#open-palette").addEventListener("click", openPalette);

/* =========================================================
   9. TERMINAL EASTER EGG
   ========================================================= */
const term = $("#terminal"), tOut = $("#term-out"), tIn = $("#term-input");
const TERM = {
  help: () => "commands: <span class='acc'>whoami, projects, open &lt;id&gt;, skills, contact, theme, accent, clear, exit</span>",
  whoami: () => "Jamie Ruane — student developer at the University of Limerick.\nI build games, learning platforms and tools developers actually use.",
  projects: () => PROJECTS.map(p => `  <span class='acc'>${p.id.padEnd(10)}</span>${p.title} — ${p.blurb}`).join("\n"),
  open: id => { const p = PROJECTS.find(x => x.id === id); if (!p) return `no project "${id}". try 'projects'`; term.close(); openProject(id); return ""; },
  skills: () => "languages  TypeScript · JavaScript · Python · C · C++ · C#\nfrontend   React · Three.js · Canvas\nbackend    Node.js · Firebase / Firestore\ntesting    Vitest · node:test · Firebase emulators",
  contact: () => `email:  <span class='acc'>${EMAIL}</span>\ngithub: <span class='acc'>github.com/JamieRuane</span>`,
  theme: () => { $("#theme-toggle").click(); return `theme → ${root.dataset.theme}`; },
  accent: () => { shuffleAccent(); return "accent shuffled"; },
  sudo: () => "nice try.",
  clear: () => { tOut.innerHTML = ""; return ""; },
  exit: () => { term.close(); return ""; },
};
function print(html) { if (html) tOut.insertAdjacentHTML("beforeend", html + "\n"); tOut.scrollTop = tOut.scrollHeight; }
function openTerminal() {
  if (!tOut.innerHTML) print("Welcome. Type <span class='acc'>help</span> to get started.\n");
  term.showModal(); tIn.focus();
}
$("#term-form").addEventListener("submit", e => {
  e.preventDefault();
  const raw = tIn.value.trim(); tIn.value = "";
  if (!raw) return;
  const [cmd, ...args] = raw.split(/\s+/);
  print(`<span class="cmd">❯ ${raw.replace(/</g, "&lt;")}</span>`);
  print(TERM[cmd] ? TERM[cmd](...args) : `command not found: ${cmd.replace(/</g, "&lt;")}`);
});
$("#open-terminal").addEventListener("click", openTerminal);

/* =========================================================
   10. KEYBOARD — Ctrl+K palette, ` terminal, Konami code
   ========================================================= */
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let kPos = 0;
addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault(); palette.open ? palette.close() : openPalette(); return;
  }
  const typing = e.target.closest("input, textarea");
  if (!typing && e.key === "`") { e.preventDefault(); openTerminal(); return; }
  if (typing) return;
  kPos = e.key === KONAMI[kPos] ? kPos + 1 : (e.key === KONAMI[0] ? 1 : 0);
  if (kPos === KONAMI.length) {
    kPos = 0;
    document.body.animate(
      [{ filter: "hue-rotate(0deg)" }, { filter: "hue-rotate(360deg)" }],
      { duration: 2000, iterations: 2 });
    toast("🎮 cheat code unlocked");
  }
});
