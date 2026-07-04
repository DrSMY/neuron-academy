'use strict';

// ---------- tiny helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const app = $('#app');

const ICONS = {
  logo: '<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="nlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect width="48" height="48" rx="13" fill="url(#nlg)"/><g stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.9"><path d="M24 24 14 15.5M24 24l10.5-9M24 24l9 10M24 24l-9.5 9.5M24 24V13"/></g><circle cx="24" cy="24" r="4.2" fill="#fff"/><circle cx="14" cy="15.5" r="2.6" fill="#fff"/><circle cx="34.5" cy="15" r="3.2" fill="#67e8f9"/><circle cx="33" cy="34" r="2.8" fill="#fff" opacity="0.9"/><circle cx="14.5" cy="33.5" r="2.2" fill="#fff" opacity="0.75"/><circle cx="24" cy="13" r="2.4" fill="#fff" opacity="0.85"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8M5 9.5V21h14V9.5"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l10 5.5L12 13 2 7.5zM2 12.5 12 18l10-5.5M2 17.5 12 23l10-5.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l14 8-14 8z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.5 12h10L20 8H6"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8v.5"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m6-6-6 6 6 6"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 5H5a1 1 0 0 0-1 1c0 2.2 1.8 4 4 4m8-5h3a1 1 0 0 1 1 1c0 2.2-1.8 4-4 4m-4 3v3m-4 4h8m-6-4h4l1 4H8z"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M12 9v5m0 3v.5M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4.4 0 7-2.8 7-6.5 0-2.7-1.4-4.6-2.8-6C14.9 8.1 14 6.6 14 4c-3 1.5-4.4 3.6-4.6 6.1-.9-.6-1.6-1.5-1.9-2.6C5.7 9.1 5 11.3 5 13.5 5 19.2 7.6 22 12 22z"/><path d="M12 22c1.9 0 3-1.4 3-3.2 0-1.6-1-2.6-1.9-3.8-.6-.8-1-1.5-1.1-2.5-1.4 1-2.4 2.2-2.6 3.6-.5 2.6.7 5.9 2.6 5.9z"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>',
  unlock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.9-.8"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6-6 6 6 6M16 6l6 6-6 6"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4M8 9h8M8 13h5"/></svg>',
  bot: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4m0 0h3M9 19v2m6-2v2"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.5h8L19 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V4A1.5 1.5 0 0 1 6.5 2.5z"/><path d="M14 2.5v5h5"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4a2 2 0 0 1 6 0M9 11h6M9 15h4"/></svg>',
  signature: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17c2-4 3.5-8 5-8s1 5 2.5 5 2-3 3.5-3 1.5 4 3 4 2-2 4-2"/><path d="M4 21h16"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.4m0 14.2v2.4M4.9 4.9l1.7 1.7m10.8 10.8 1.7 1.7M2.5 12h2.4m14.2 0h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>',
};
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- theme ----------
function currentTheme() { return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'; }
function toggleTheme(btn) {
  const next = currentTheme() === 'light' ? 'dark' : 'light';
  const root = document.documentElement;
  if (!REDUCED_MOTION) {
    root.classList.add('theme-anim');
    setTimeout(() => root.classList.remove('theme-anim'), 420);
  }
  root.dataset.theme = next;
  localStorage.setItem('na-theme', next);
  if (btn) {
    btn.innerHTML = icon(next === 'light' ? 'moon' : 'sun');
    btn.setAttribute('aria-label', next === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    btn.classList.remove('flip');
    void btn.offsetWidth; // restart animation
    btn.classList.add('flip');
  }
}
function themeBtnHTML() {
  const light = currentTheme() === 'light';
  return `<button class="icon-btn theme-btn" id="theme-btn" aria-label="${light ? 'Switch to dark mode' : 'Switch to light mode'}">${icon(light ? 'moon' : 'sun')}</button>`;
}
function icon(name) { return ICONS[name] || ''; }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function money(n) { return n === 0 ? '<span class="free">Free</span>' : '$' + Number(n).toFixed(2).replace(/\.00$/, ''); }

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.status = res.status; e.reason = data.reason; throw e; }
  return data;
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${icon(type === 'success' ? 'check' : 'alert')}<span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 300); }, 4000);
}

const scrim = $('#modal-scrim');
const modalEl = $('#modal');
function openModal(html, wide = false) {
  modalEl.className = 'modal' + (wide ? ' wide' : '');
  modalEl.innerHTML = html;
  scrim.classList.add('open');
  const close = $('[data-close]', modalEl);
  if (close) close.onclick = closeModal;
}
function closeModal() { scrim.classList.remove('open'); }
scrim.addEventListener('click', (e) => { if (e.target === scrim) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ---------- state ----------
let me = null;
let meStats = null; // streak / xp / level from /api/me

// ---------- shell ----------
function shell(active, content) {
  const initial = me.name.trim().charAt(0).toUpperCase();
  const streak = meStats?.streak ?? 0;
  const navItem = (id, href, ic, label, extra = '') => `
    <a class="snav-link ${active === id ? 'active' : ''}" href="${href}">${icon(ic)}<span>${label}</span>${extra}</a>`;
  const duePill = meStats?.dueReviews ? `<span class="due-pill">${meStats.dueReviews}</span>` : '';
  return `
  <div class="app-frame">
    <aside class="sidenav">
      <a class="brand" href="#/home"><span class="logo">${icon('logo')}</span><span class="brand-text">Neuron<br><em>Academy</em></span></a>
      <nav class="snav">
        ${navItem('home', '#/home', 'home', 'Home')}
        ${navItem('catalog', '#/catalog', 'layers', 'Explore')}
        ${navItem('learning', '#/learning', 'book', 'My Learning')}
        ${navItem('review', '#/review', 'zap', 'Review', duePill)}
        ${me.role === 'admin' ? navItem('admin', '/admin', 'sparkle', 'Admin Panel') : ''}
      </nav>
      <div class="snav-spacer"></div>
      <div class="side-streak card ${meStats?.activeToday ? 'lit' : ''}">
        <span class="flame-ring">${icon('flame')}</span>
        <div><strong>${streak} day streak</strong><span>${meStats?.activeToday ? 'You showed up today' : 'Learn today to keep it'}</span></div>
      </div>
      <button class="snav-link" id="logout-btn" style="margin-top:6px">${icon('arrowLeft')}<span>Sign out</span></button>
    </aside>
    <div class="main-col">
      <header class="mainbar">
        <button class="search-pill" id="search-pill" aria-label="Search (Cmd+K)">
          ${icon('search')}<span>Search modules, lessons…</span><kbd>⌘K</kbd>
        </button>
        <span class="spacer"></span>
        ${themeBtnHTML()}
        <span class="streak-chip ${meStats?.activeToday ? 'lit' : ''}" id="streak-chip" title="${streak} day learning streak">${icon('flame')}<span>${streak}</span></span>
        <span class="user-chip"><span class="user-name">${esc(me.name)}</span><span class="avatar" aria-hidden="true">${esc(initial)}</span></span>
      </header>
      <main class="container">${content}</main>
    </div>
  </div>
  <nav class="bottomnav" aria-label="Primary">
    <a class="${active === 'home' ? 'active' : ''}" href="#/home">${icon('home')}<span>Home</span></a>
    <a class="${active === 'catalog' ? 'active' : ''}" href="#/catalog">${icon('layers')}<span>Explore</span></a>
    <a class="${active === 'learning' ? 'active' : ''}" href="#/learning">${icon('book')}<span>Learning</span></a>
    <a class="${active === 'review' ? 'active' : ''}" href="#/review">${icon('zap')}<span>Review</span>${meStats?.dueReviews ? `<i class="dot"></i>` : ''}</a>
  </nav>`;
}

async function refreshMe() {
  try {
    const d = await api('/api/me');
    me = d.user;
    meStats = d;
  } catch { me = null; meStats = null; }
}
function bindShell() {
  const btn = $('#logout-btn');
  if (btn) btn.onclick = async () => { await api('/api/logout', { method: 'POST' }); me = null; location.hash = '#/'; render(); };
  const search = $('#search-pill');
  if (search) search.onclick = () => palette.open();
  const themeBtn = $('#theme-btn');
  if (themeBtn) themeBtn.onclick = () => toggleTheme(themeBtn);
}

// ---------- auth view ----------
function renderAuth(mode = 'login') {
  app.innerHTML = `
  <div style="position:fixed;top:18px;right:18px;z-index:50">${themeBtnHTML()}</div>
  <div class="auth-wrap">
    <div class="card auth-card">
      <div class="brand"><span class="logo">${icon('logo')}</span><span class="brand-text">Neuron Academy</span></div>
      <p class="tagline">Master AI, one module at a time.</p>
      <div class="auth-tabs" role="tablist">
        <button role="tab" class="${mode === 'login' ? 'active' : ''}" data-mode="login">Sign in</button>
        <button role="tab" class="${mode === 'signup' ? 'active' : ''}" data-mode="signup">Create account</button>
      </div>
      <div class="form-error" id="auth-error">${icon('alert')}<span></span></div>
      <form id="auth-form" novalidate>
        ${mode === 'signup' ? `
        <div class="field">
          <label for="f-name">Full name <span class="req">*</span></label>
          <input id="f-name" name="name" autocomplete="name" placeholder="Ada Lovelace" required>
        </div>` : ''}
        <div class="field">
          <label for="f-email">Email <span class="req">*</span></label>
          <input id="f-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
        </div>
        <div class="field">
          <label for="f-pass">Password <span class="req">*</span></label>
          <input id="f-pass" name="password" type="password" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" placeholder="••••••••" required>
          ${mode === 'signup' ? '<div class="hint">At least 6 characters.</div>' : ''}
        </div>
        <button class="btn btn-primary" style="width:100%" type="submit">
          ${mode === 'login' ? 'Sign in' : 'Start learning'} ${icon('arrowRight')}
        </button>
      </form>
      <p class="auth-note">Demo admin: admin@platform.ai / admin123</p>
    </div>
  </div>`;

  document.querySelectorAll('.auth-tabs button').forEach((b) => {
    b.onclick = () => renderAuth(b.dataset.mode);
  });
  const authThemeBtn = $('#theme-btn');
  if (authThemeBtn) authThemeBtn.onclick = () => toggleTheme(authThemeBtn);

  $('#auth-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = $('button[type=submit]', e.target);
    const errBox = $('#auth-error');
    errBox.classList.remove('show');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Please wait…';
    const fd = new FormData(e.target);
    try {
      await api(mode === 'login' ? '/api/login' : '/api/signup', {
        method: 'POST',
        body: Object.fromEntries(fd.entries()),
      });
      const d = await api('/api/me');
      me = d.user;
      location.hash = '#/catalog';
      render();
    } catch (err) {
      errBox.querySelector('span').textContent = err.message;
      errBox.classList.add('show');
      btn.disabled = false;
      btn.innerHTML = `${mode === 'login' ? 'Sign in' : 'Start learning'} ${icon('arrowRight')}`;
    }
  };
}

// ---------- catalog ----------
function moduleCard(m, i) {
  const stateBadge = {
    completed: `<span class="badge completed">${icon('check')} Completed</span>`,
    ready: `<span class="badge ready">${icon('play')} In progress</span>`,
    owned_locked: `<span class="badge locked">${icon('lock')} Finish previous first</span>`,
    locked: `<span class="badge locked">${icon('lock')} Locked</span>`,
    available: '',
  }[m.state];

  const pct = m.lessonsTotal ? Math.round((m.lessonsDone / m.lessonsTotal) * 100) : 0;
  const discounted = m.price < m.base_price;

  let action;
  if (m.completed) action = `<span style="display:flex;gap:8px"><a class="btn btn-ghost btn-sm" href="/api/certificate/${m.id}" title="Download certificate">${icon('award')} Certificate</a><a class="btn btn-ghost btn-sm" href="#/module/${m.id}">Review ${icon('arrowRight')}</a></span>`;
  else if (m.owned && m.unlocked) action = `<a class="btn btn-primary btn-sm" href="#/module/${m.id}">${m.lessonsDone > 0 ? 'Continue' : 'Start'} ${icon('arrowRight')}</a>`;
  else if (m.owned) action = `<button class="btn btn-ghost btn-sm" disabled>${icon('lock')} Locked</button>`;
  else action = `<button class="btn btn-primary btn-sm" data-buy="${m.id}">${icon('cart')} Get module</button>`;

  return `
  <article class="card module-card ${m.state === 'locked' || m.state === 'owned_locked' ? 'locked-card' : ''}">
    <div class="module-num"><span>MODULE ${String(i + 1).padStart(2, '0')}</span>${stateBadge}</div>
    <h3>${esc(m.title)}</h3>
    <p class="desc">${esc(m.description)}</p>
    <div class="meta">
      <span class="badge level">${esc(m.level)}</span>
      <span>${icon('clock')} ${m.duration_mins} min</span>
      <span>${icon('book')} ${m.lessonsTotal} lessons</span>
    </div>
    ${m.owned ? `<div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${pct}%"></div></div>` : ''}
    <div class="foot">
      ${m.owned ? `<span class="price" style="font-size:14px;color:var(--fg-muted)">${m.completed ? (m.bestScore !== null ? `Best score ${m.bestScore}%` : 'Completed') : `${m.lessonsDone}/${m.lessonsTotal} lessons done`}</span>`
        : `<span class="price">${money(m.price)}${discounted ? `<span class="was">$${m.base_price}</span>` : ''}</span>`}
      ${action}
    </div>
  </article>`;
}

function neuralPathHTML(modules) {
  const nodeState = (m) => m.completed ? 'done' : m.state === 'ready' ? 'active' : m.state === 'available' ? 'open' : 'locked';
  return `
  <div class="neural-path">
    ${modules.map((m, i) => `
    <div class="path-row ${i % 2 ? 'right' : 'left'}">
      <div class="path-node-col" aria-hidden="true">
        <span class="path-seg ${i === 0 ? 'invisible' : ''} ${i > 0 && modules[i - 1].completed ? 'lit' : ''}"></span>
        <span class="path-node ${nodeState(m)}">${m.completed ? icon('check') : m.unlocked || m.state === 'available' ? i + 1 : icon('lock')}</span>
        <span class="path-seg ${i === modules.length - 1 ? 'invisible' : ''} ${m.completed ? 'lit' : ''}"></span>
      </div>
      ${moduleCard(m, i)}
    </div>`).join('')}
  </div>`;
}

function bindBuyButtons(root, modules) {
  root.querySelectorAll('[data-buy]').forEach((b) => {
    b.onclick = () => openCheckout(modules.find((m) => m.id === Number(b.dataset.buy)));
  });
}

// Explore: all subjects, each holding tracks of modules
async function renderCatalog() {
  app.innerHTML = shell('catalog', `
    <div class="page-head">
      <span class="eyebrow">Discover</span>
      <h1>Explore subjects</h1>
      <p>Browse what's available and enroll in something new. Already learning something? Find it in <a href="#/learning">My Learning</a> instead.</p>
    </div>
    <div id="catalog-grid"><div class="skeleton" style="min-height:340px"></div></div>`);
  bindShell();
  try {
    const { subjects } = await api('/api/catalog');
    const grid = $('#catalog-grid');
    if (!subjects.length) {
      grid.outerHTML = `<div class="card empty">${icon('sparkle')}<h3>No subjects yet</h3><p>The catalog is being prepared. Check back soon.</p></div>`;
      return;
    }
    grid.innerHTML = `
    <div class="subject-grid">
      ${subjects.map((s, i) => {
        const pct = s.moduleCount ? Math.round((s.completed / s.moduleCount) * 100) : 0;
        return `
        <a class="card subject-card" href="#/subject/${s.id}">
          ${thumbHTML(i, 'sm')}
          <h3>${esc(s.title)}</h3>
          <p class="desc">${esc(s.description)}</p>
          <div class="meta">
            <span>${icon('layers')} ${s.tracks.length} track${s.tracks.length === 1 ? '' : 's'}</span>
            <span>${icon('book')} ${s.moduleCount} module${s.moduleCount === 1 ? '' : 's'}</span>
          </div>
          ${s.ownedCount ? `<div class="progress-track" style="margin:12px 0 6px"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span class="cl-meta">${s.completed}/${s.moduleCount} modules completed</span>` : ''}
          <span class="btn btn-ghost btn-sm" style="margin-top:14px;align-self:flex-start">Explore ${icon('arrowRight')}</span>
        </a>`;
      }).join('')}
    </div>`;
  } catch (err) {
    if (err.status === 401) { me = null; render(); return; }
    toast(err.message, 'error');
  }
}

// Subject detail: each track rendered as its own neural path
async function renderSubject(subjectId) {
  app.innerHTML = shell('catalog', '<div class="skeleton" style="min-height:340px"></div>');
  bindShell();
  try {
    const { subjects, modules } = await api('/api/catalog');
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) {
      $('.container').innerHTML = `<div class="card empty">${icon('alert')}<h3>Subject not found</h3><p>It may have been unpublished.</p><a class="btn btn-primary" href="#/catalog">Back to Explore</a></div>`;
      return;
    }
    $('.container').innerHTML = `
      <button class="back-link" onclick="location.hash='#/catalog'">${icon('arrowLeft')} All subjects</button>
      <div class="page-head">
        <span class="eyebrow">Subject</span>
        <h1>${esc(s.title)}</h1>
        <p>${esc(s.description)}</p>
      </div>
      ${s.tracks.length ? s.tracks.map((t) => `
      <section class="track-section">
        <div class="track-head">
          <div>
            <h2>${esc(t.title)}</h2>
            ${t.description ? `<p>${esc(t.description)}</p>` : ''}
          </div>
          <span class="badge ${t.completed === t.modules.length && t.modules.length ? 'completed' : 'ready'}">${t.completed}/${t.modules.length} done</span>
        </div>
        ${t.modules.length ? neuralPathHTML(t.modules) : `<div class="card empty" style="padding:34px">${icon('sparkle')}<h3>Coming soon</h3><p>Modules for this track are being prepared.</p></div>`}
      </section>`).join('') : `<div class="card empty">${icon('sparkle')}<h3>No tracks yet</h3><p>This subject is being prepared. Check back soon.</p></div>`}`;
    bindBuyButtons($('.container'), modules);
  } catch (err) {
    if (err.status === 401) { me = null; render(); return; }
    toast(err.message, 'error');
  }
}

// ---------- checkout ----------
function openCheckout(m) {
  const free = m.price === 0;
  openModal(`
    <div class="modal-head">
      <div><h3>${free ? 'Enroll in module' : 'Checkout'}</h3><div class="sub">${esc(m.title)}</div></div>
      <button class="icon-btn" data-close aria-label="Close">${icon('x')}</button>
    </div>
    <div class="checkout-summary">
      <span>Your price</span>
      <span class="price">${money(m.price)}${m.price < m.base_price ? `<span class="was">$${m.base_price}</span>` : ''}</span>
    </div>
    <form id="pay-form" novalidate>
      ${free ? '' : `
      <div class="field">
        <label for="c-name">Name on card <span class="req">*</span></label>
        <input id="c-name" name="cardName" autocomplete="cc-name" placeholder="Ada Lovelace" required>
      </div>
      <div class="field">
        <label for="c-num">Card number <span class="req">*</span></label>
        <input id="c-num" name="cardNumber" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" required>
      </div>
      <div class="row-2">
        <div class="field">
          <label for="c-exp">Expiry <span class="req">*</span></label>
          <input id="c-exp" name="expiry" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" required>
        </div>
        <div class="field">
          <label for="c-cvc">CVC <span class="req">*</span></label>
          <input id="c-cvc" name="cvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123" required>
        </div>
      </div>`}
      <button class="btn btn-primary" style="width:100%" type="submit">${free ? 'Enroll for free' : `Pay ${m.price === 0 ? '' : '$' + m.price}`}</button>
      <p class="sim-note">${icon('info')} Simulated payment — no real charge is made. Any test card details work.</p>
      <div class="form-error" id="pay-error" style="margin-top:14px">${icon('alert')}<span></span></div>
    </form>`);

  $('#pay-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = $('button[type=submit]', e.target);
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Processing…';
    const fd = new FormData(e.target);
    try {
      const r = await api(`/api/module/${m.id}/purchase`, { method: 'POST', body: Object.fromEntries(fd.entries()) });
      closeModal();
      toast(free ? 'Enrolled! The module is now yours.' : `Payment complete — ${r.txn_id}`);
      renderCatalog();
    } catch (err) {
      const box = $('#pay-error');
      box.querySelector('span').textContent = err.message;
      box.classList.add('show');
      btn.disabled = false;
      btn.textContent = free ? 'Enroll for free' : `Pay $${m.price}`;
    }
  };
}

// ---------- module detail ----------
let currentModule = null;
let currentLessonIdx = 0;

async function renderModule(id, lessonIdx = 0) {
  app.innerHTML = shell('catalog', '<div class="skeleton" style="min-height:420px"></div>');
  bindShell();
  try {
    const { module: mod } = await api(`/api/module/${id}`);
    currentModule = mod;
    // index space: lessons, then assignments, then the quiz
    const maxIdx = mod.lessons.length + (mod.assignments?.length || 0);
    currentLessonIdx = Math.min(lessonIdx, maxIdx);
    drawModule();
  } catch (err) {
    if (err.status === 401) { me = null; render(); return; }
    $('.container').innerHTML = `
      <button class="back-link" onclick="location.hash='#/catalog'">${icon('arrowLeft')} Back to modules</button>
      <div class="card empty">${icon('lock')}<h3>${err.reason === 'sequential' ? 'Module locked' : 'Not enrolled'}</h3>
      <p>${esc(err.message)}</p>
      <a class="btn btn-primary" href="#/catalog">Back to catalog</a></div>`;
  }
}

function drawModule() {
  const mod = currentModule;
  const L = mod.lessons.length;
  const A = mod.assignments?.length || 0;
  const isQuiz = currentLessonIdx >= L + A;
  const isAssignment = !isQuiz && currentLessonIdx >= L;
  const hasQuiz = mod.quiz.length > 0;

  const navItems = mod.lessons.map((l, i) => `
    <button class="lesson-item ${l.done ? 'done' : ''} ${i === currentLessonIdx ? 'active' : ''}" data-idx="${i}">
      <span class="dot">${l.done ? icon('check') : i + 1}</span>
      <span>${esc(l.title)}</span>
    </button>`).join('') + (mod.assignments || []).map((a, i) => `
    <button class="lesson-item asg-item ${a.submission ? 'done' : ''} ${L + i === currentLessonIdx ? 'active' : ''}" data-idx="${L + i}">
      <span class="dot">${a.submission?.status === 'graded' ? icon('check') : icon('clipboard')}</span>
      <span>${esc(a.title)}</span>
    </button>`).join('') + (hasQuiz ? `
    <button class="lesson-item quiz-item ${isQuiz ? 'active' : ''} ${mod.completed ? 'done' : ''}" data-idx="${L + A}">
      <span class="dot">${mod.completed ? icon('check') : '?'}</span>
      <span>Final quiz</span>
    </button>` : '');

  $('.container').innerHTML = `
    <button class="back-link" id="back-btn">${icon('arrowLeft')} All modules</button>
    <div class="page-head" style="margin-bottom:24px">
      <span class="eyebrow">${esc(mod.level)} · ${mod.duration_mins} min</span>
      <h1 style="font-size:28px">${esc(mod.title)}</h1>
      ${mod.completed ? `<p style="color:var(--success);display:flex;align-items:center;gap:7px;margin-top:6px">${icon('trophy')} Module completed${mod.bestScore !== null ? ` — best score ${mod.bestScore}%` : ''}</p>` : ''}
    </div>
    <div class="detail-layout">
      <aside class="card lesson-nav"><h4>Contents</h4>${navItems}</aside>
      <section class="card lesson-panel" id="lesson-panel"></section>
    </div>`;

  $('#back-btn').onclick = () => { location.hash = '#/catalog'; };
  document.querySelectorAll('.lesson-item').forEach((b) => {
    b.onclick = () => { currentLessonIdx = Number(b.dataset.idx); drawModule(); };
  });

  if (isQuiz) drawQuiz();
  else if (isAssignment) drawAssignment();
  else drawLesson();
}

// ---------- assignment view ----------
function drawAssignment() {
  const mod = currentModule;
  const L = mod.lessons.length;
  const A = mod.assignments.length;
  const ai = currentLessonIdx - L;
  const a = mod.assignments[ai];
  const sub = a.submission;
  const graded = sub?.status === 'graded';
  const panel = $('#lesson-panel');

  panel.innerHTML = `
    <h2>${esc(a.title)}</h2>
    <div class="asg-meta">
      <span class="badge level">${a.points} points</span>
      ${graded ? `<span class="badge completed">${icon('check')} Graded: ${sub.grade}/${a.points}</span>`
        : sub ? `<span class="badge ready">${icon('check')} Submitted ${esc(sub.submitted_at.slice(0, 16))}</span>`
        : `<span class="badge locked">Not submitted yet</span>`}
    </div>
    ${graded && sub.feedback ? `
    <div class="score-banner pass" style="display:block;padding:16px 20px">
      <strong style="color:var(--success)">Feedback from your instructor</strong>
      <p style="margin:8px 0 0;color:var(--fg)">${esc(sub.feedback).replace(/\n/g, '<br>')}</p>
    </div>` : ''}
    <div class="lesson-content">${a.instructions_html}</div>
    ${a.author ? `<div class="asg-author">${icon('signature')} Set by ${esc(a.author.name)}${a.author.designation ? `, ${esc(a.author.designation)}` : ''}</div>` : ''}
    <div class="asg-form">
      <div class="field">
        <label for="asg-text">Your answer ${graded ? '(locked after grading)' : ''}</label>
        <textarea id="asg-text" style="min-height:150px" ${graded ? 'disabled' : ''} placeholder="Write your answer here…">${esc(sub?.content_text || '')}</textarea>
      </div>
      <div class="asg-file-row">
        ${sub?.file_name ? `<a class="btn btn-ghost btn-sm" href="/api/submission/${sub.id}/file">${icon('file')} ${esc(sub.file_name)}</a>` : ''}
        ${graded ? '' : `
        <label class="btn btn-ghost btn-sm" style="cursor:pointer">${icon('file')} ${sub?.file_name ? 'Replace file' : 'Attach a file'}
          <input type="file" id="asg-file" hidden></label>
        <span class="gate-hint" id="asg-file-name"></span>`}
      </div>
      ${graded ? '' : `<button class="btn btn-primary" id="asg-submit" style="margin-top:14px">${sub ? 'Update submission' : 'Submit assignment'} ${icon('arrowRight')}</button>`}
      <p class="hint-text" style="margin-top:10px">${graded ? 'This assignment has been graded — contact your instructor if something looks wrong.' : 'You can resubmit as often as you like until it\'s graded. Max file size 5 MB.'}</p>
    </div>
    <div class="lesson-foot">
      <button class="btn btn-ghost" id="prev-btn">${icon('arrowLeft')} Previous</button>
      ${ai < A - 1 || mod.quiz.length ? `<button class="btn btn-ghost" id="next-btn-a">Next ${icon('arrowRight')}</button>` : ''}
    </div>`;

  $('#prev-btn').onclick = () => { currentLessonIdx--; drawModule(); };
  const nextA = $('#next-btn-a');
  if (nextA) nextA.onclick = () => { currentLessonIdx++; drawModule(); };

  if (graded) return;

  let pickedFile = null;
  const fileInput = $('#asg-file');
  if (fileInput) fileInput.onchange = () => {
    const f = fileInput.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast('Files are limited to 5 MB.', 'error'); fileInput.value = ''; return; }
    pickedFile = f;
    $('#asg-file-name').textContent = f.name;
  };

  $('#asg-submit').onclick = async () => {
    const btn = $('#asg-submit');
    const text = $('#asg-text').value;
    if (!text.trim() && !pickedFile && !sub?.file_name) { toast('Write something or attach a file first.', 'error'); return; }
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Submitting…';
    try {
      const body = { content_text: text };
      if (pickedFile) {
        const buf = new Uint8Array(await pickedFile.arrayBuffer());
        let b64 = '';
        for (let i = 0; i < buf.length; i += 0x8000) b64 += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
        body.file_b64 = btoa(b64);
        body.file_name = pickedFile.name;
      }
      const r = await api(`/api/assignment/${a.id}/submit`, { method: 'POST', body });
      const fresh = await api(`/api/module/${mod.id}`);
      currentModule = fresh.module;
      if (r.firstTime) {
        toast('Assignment submitted — +20 XP!');
        refreshMe().then(() => {
          const chip = $('#streak-chip');
          if (chip && meStats) { chip.classList.toggle('lit', meStats.activeToday); chip.querySelector('span').textContent = meStats.streak; }
        });
        await celebrateLesson();
      } else toast('Submission updated.');
      drawModule();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = `${sub ? 'Update submission' : 'Submit assignment'} ${icon('arrowRight')}`;
    }
  };
}

// ---------- lesson blocks ----------
const exState = { solved: new Set(), interactive: 0 };

function shuffled(arr) {
  const a = arr.map((v, i) => ({ v, i }));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // never present an ordering exercise pre-solved
  if (a.length > 1 && a.every((x, idx) => x.i === idx)) [a[0], a[1]] = [a[1], a[0]];
  return a;
}

function blockShellHTML(bi, label, prompt, inner) {
  return `
  <section class="block-ex" data-bi="${bi}">
    <div class="ex-head">${icon('sparkle')}<span>${esc(label)}</span><span class="ex-status" data-status="${bi}"></span></div>
    ${prompt ? `<p class="ex-prompt">${esc(prompt)}</p>` : ''}
    ${inner}
  </section>`;
}

function blockHTML(b, bi) {
  switch (b.type) {
    case 'text': return `<div class="lesson-content">${b.html}</div>`;
    case 'video': return `<iframe class="video-frame" src="${esc(b.url)}" title="Lesson video" allowfullscreen loading="lazy"></iframe>`;
    case 'code':
      return blockShellHTML(bi, 'Code playground', b.instructions, `
        <textarea class="code-editor" data-code="${bi}" spellcheck="false" aria-label="Code editor">${esc(b.starter || '')}</textarea>
        <div class="ex-actions">
          <button class="btn btn-primary btn-sm" data-run="${bi}">${icon('play')} Run code</button>
          ${b.expected_output ? `<span class="ex-expected">Goal output: <code>${esc(b.expected_output)}</code></span>` : ''}
        </div>
        <pre class="code-out" data-out="${bi}" hidden></pre>`);
    case 'order':
      return blockShellHTML(bi, 'Put in order', b.prompt, `
        <ul class="order-list" data-order="${bi}">
          ${shuffled(b.items).map((it) => `
          <li class="order-item" draggable="true" data-oi="${it.i}">
            <span class="grip">⋮⋮</span><span class="order-text">${esc(it.v)}</span>
            <span class="order-arrows">
              <button class="icon-btn" data-move="up" aria-label="Move up">↑</button>
              <button class="icon-btn" data-move="down" aria-label="Move down">↓</button>
            </span>
          </li>`).join('')}
        </ul>
        <div class="ex-actions"><button class="btn btn-primary btn-sm" data-check-order="${bi}">${icon('check')} Check order</button></div>`);
    case 'match': {
      const rights = shuffled(b.pairs.map((p) => p.r));
      return blockShellHTML(bi, 'Match the pairs', b.prompt, `
        <div class="match-grid" data-match="${bi}">
          <div class="match-col">${b.pairs.map((p, i) => `<button class="match-chip" data-l="${i}">${esc(p.l)}</button>`).join('')}</div>
          <div class="match-col">${rights.map((r) => `<button class="match-chip" data-r="${r.i}">${esc(r.v)}</button>`).join('')}</div>
        </div>`);
    }
    case 'blank': {
      let n = 0;
      const html = esc(b.text).replace(/\{\{(.+?)\}\}/g, (_, ans) => {
        const answers = ans.split('|').map((s) => s.trim());
        return `<input class="blank-input" data-blank-of="${bi}" data-answers="${esc(answers.join('|'))}" size="${Math.max(6, answers[0].length + 2)}" aria-label="Blank ${++n}">`;
      });
      return blockShellHTML(bi, 'Fill in the blanks', b.prompt, `
        <p class="blank-text">${html}</p>
        <div class="ex-actions"><button class="btn btn-primary btn-sm" data-check-blank="${bi}">${icon('check')} Check answers</button></div>`);
    }
    default: return '';
  }
}

function markSolved(bi, note = 'Solved') {
  if (exState.solved.has(bi)) return;
  exState.solved.add(bi);
  const badge = $(`[data-status="${bi}"]`);
  if (badge) badge.innerHTML = `<span class="badge completed">${icon('check')} ${esc(note)}</span>`;
  const blockEl = document.querySelector(`.block-ex[data-bi="${bi}"]`);
  if (blockEl) blockEl.classList.add('solved');
  updateLessonGate();
}

function updateLessonGate() {
  const btn = $('#next-btn');
  if (!btn) return;
  const l = currentModule.lessons[currentLessonIdx];
  const remaining = exState.interactive - exState.solved.size;
  const gated = !l.done && remaining > 0;
  btn.disabled = gated;
  const hint = $('#gate-hint');
  if (hint) hint.textContent = gated ? `Solve ${remaining} exercise${remaining > 1 ? 's' : ''} above to continue` : '';
}

// --- code sandbox ---
let runSeq = 0;
const pendingRuns = new Map();
window.addEventListener('message', (e) => {
  const d = e.data;
  if (!d || !pendingRuns.has(d.runId)) return;
  const cb = pendingRuns.get(d.runId);
  pendingRuns.delete(d.runId);
  cb(d);
});
function runSandboxed(code, cb) {
  const runId = ++runSeq;
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts');
  iframe.style.display = 'none';
  const safe = code.replace(/<\/script/gi, '<\\/script');
  iframe.srcdoc = `<script>
    const logs = [];
    console.log = (...a) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' '));
    try { ${'\n'}${safe}${'\n'} parent.postMessage({ runId: ${runId}, output: logs.join('\\n') }, '*'); }
    catch (e) { parent.postMessage({ runId: ${runId}, error: e.message }, '*'); }
  <\/script>`;
  const timer = setTimeout(() => {
    if (pendingRuns.has(runId)) { pendingRuns.delete(runId); cb({ error: 'Timed out — check for infinite loops.' }); }
    iframe.remove();
  }, 3000);
  pendingRuns.set(runId, (d) => { clearTimeout(timer); iframe.remove(); cb(d); });
  document.body.appendChild(iframe);
}

function bindBlocks(lesson) {
  const panel = $('#lesson-panel');

  // code playgrounds
  panel.querySelectorAll('[data-run]').forEach((btn) => {
    const bi = Number(btn.dataset.run);
    const b = lesson.blocks[bi];
    btn.onclick = () => {
      const out = $(`[data-out="${bi}"]`);
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Running…';
      runSandboxed($(`[data-code="${bi}"]`).value, (d) => {
        btn.disabled = false;
        btn.innerHTML = `${icon('play')} Run code`;
        out.hidden = false;
        if (d.error) { out.textContent = '✕ ' + d.error; out.className = 'code-out err'; return; }
        out.textContent = d.output === '' ? '(no output)' : d.output;
        const want = (b.expected_output || '').trim();
        if (!want || d.output.trim() === want) {
          out.className = 'code-out ok';
          markSolved(bi, want ? 'Output matches' : 'Ran successfully');
        } else {
          out.className = 'code-out';
          toast('Not the goal output yet — keep tweaking.', 'error');
        }
      });
    };
  });

  // ordering
  panel.querySelectorAll('[data-order]').forEach((list) => {
    const bi = Number(list.dataset.order);
    let dragging = null;
    list.querySelectorAll('.order-item').forEach((item) => {
      item.addEventListener('dragstart', () => { dragging = item; item.classList.add('dragging'); });
      item.addEventListener('dragend', () => { dragging = null; item.classList.remove('dragging'); });
      item.querySelectorAll('[data-move]').forEach((mv) => {
        mv.onclick = () => {
          if (mv.dataset.move === 'up' && item.previousElementSibling) item.parentNode.insertBefore(item, item.previousElementSibling);
          if (mv.dataset.move === 'down' && item.nextElementSibling) item.parentNode.insertBefore(item.nextElementSibling, item);
        };
      });
    });
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!dragging) return;
      const after = [...list.querySelectorAll('.order-item:not(.dragging)')]
        .find((el) => e.clientY < el.getBoundingClientRect().top + el.offsetHeight / 2);
      if (after) list.insertBefore(dragging, after); else list.appendChild(dragging);
    });
    $(`[data-check-order="${bi}"]`).onclick = () => {
      const order = [...list.querySelectorAll('.order-item')].map((el) => Number(el.dataset.oi));
      if (order.every((v, i) => v === i)) {
        list.querySelectorAll('.order-item').forEach((el) => { el.classList.add('correct'); el.draggable = false; });
        $(`[data-check-order="${bi}"]`).disabled = true;
        markSolved(bi);
      } else {
        list.classList.add('shake');
        setTimeout(() => list.classList.remove('shake'), 450);
        toast('Not quite — try a different order.', 'error');
      }
    };
  });

  // matching
  panel.querySelectorAll('[data-match]').forEach((grid) => {
    const bi = Number(grid.dataset.match);
    const total = grid.querySelectorAll('[data-l]').length;
    let selected = null;
    let matched = 0;
    grid.querySelectorAll('.match-chip').forEach((chip) => {
      chip.onclick = () => {
        if (chip.classList.contains('correct')) return;
        if (chip.dataset.l !== undefined) {
          grid.querySelectorAll('[data-l]').forEach((c) => c.classList.remove('selected'));
          chip.classList.add('selected');
          selected = chip;
        } else if (selected) {
          if (chip.dataset.r === selected.dataset.l) {
            chip.classList.add('correct');
            selected.classList.remove('selected');
            selected.classList.add('correct');
            selected = null;
            if (++matched === total) markSolved(bi, 'All matched');
          } else {
            chip.classList.add('wrong');
            setTimeout(() => chip.classList.remove('wrong'), 450);
          }
        }
      };
    });
  });

  // fill-in-the-blank
  panel.querySelectorAll('[data-check-blank]').forEach((btn) => {
    const bi = Number(btn.dataset.checkBlank);
    btn.onclick = () => {
      let allOk = true;
      panel.querySelectorAll(`[data-blank-of="${bi}"]`).forEach((inp) => {
        const ok = inp.dataset.answers.split('|').some((a) => a.trim().toLowerCase() === inp.value.trim().toLowerCase());
        inp.classList.toggle('correct', ok);
        inp.classList.toggle('wrong', !ok);
        if (!ok) allOk = false;
      });
      if (allOk) {
        panel.querySelectorAll(`[data-blank-of="${bi}"]`).forEach((inp) => { inp.disabled = true; });
        btn.disabled = true;
        markSolved(bi);
      } else toast('Some blanks are not right yet.', 'error');
    };
  });
}

// ---------- notes & highlights ----------
function applyHighlights(notes) {
  const contents = document.querySelectorAll('#lesson-panel .lesson-content');
  for (const n of notes) {
    if (n.kind !== 'highlight') continue;
    for (const c of contents) {
      const walker = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
      let node;
      let found = false;
      while (!found && (node = walker.nextNode())) {
        const i = node.textContent.indexOf(n.content);
        if (i === -1 || node.parentElement.closest('mark')) continue;
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + n.content.length);
        const mark = document.createElement('mark');
        mark.className = 'hl';
        try { range.surroundContents(mark); found = true; } catch { /* crosses elements — skip */ }
      }
      if (found) break;
    }
  }
}

async function bindNotes(lesson) {
  const listEl = $('#notes-list');
  const countEl = $('#notes-count');
  let notes = [];

  async function load() {
    notes = (await api(`/api/lesson/${lesson.id}/notes`)).notes;
    countEl.hidden = notes.length === 0;
    countEl.textContent = notes.length;
    listEl.innerHTML = notes.length ? notes.map((n) => `
      <div class="note-row ${n.kind}">
        ${n.kind === 'highlight' ? icon('edit') : icon('note')}
        <span class="note-text">${n.kind === 'highlight' ? '“' + esc(n.content) + '”' : esc(n.content)}</span>
        <button class="icon-btn" data-del-note="${n.id}" aria-label="Delete note">${icon('x')}</button>
      </div>`).join('') : '<p class="hint-text" style="margin:4px 0">Nothing saved for this lesson yet.</p>';
    listEl.querySelectorAll('[data-del-note]').forEach((b) => {
      b.onclick = async () => { await api(`/api/notes/${b.dataset.delNote}`, { method: 'DELETE' }); load(); };
    });
    applyHighlights(notes);
  }

  $('#save-note').onclick = async () => {
    const input = $('#note-input');
    if (!input.value.trim()) return;
    await api(`/api/lesson/${lesson.id}/notes`, { method: 'POST', body: { kind: 'note', content: input.value } });
    input.value = '';
    toast('Note saved.');
    load();
  };

  // selection → floating highlight button
  const panel = $('#lesson-panel');
  panel.addEventListener('mouseup', () => {
    document.querySelector('.hl-btn')?.remove();
    const sel = window.getSelection();
    const text = sel.toString().trim();
    if (!text || text.length < 3 || text.length > 400) return;
    if (!sel.anchorNode || !panel.contains(sel.anchorNode) || !sel.anchorNode.parentElement.closest('.lesson-content')) return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const btn = document.createElement('button');
    btn.className = 'hl-btn';
    btn.innerHTML = `${icon('edit')} Highlight`;
    btn.style.left = `${rect.left + rect.width / 2 + scrollX}px`;
    btn.style.top = `${rect.top + scrollY - 42}px`;
    btn.onclick = async () => {
      btn.remove();
      await api(`/api/lesson/${lesson.id}/notes`, { method: 'POST', body: { kind: 'highlight', content: text } });
      sel.removeAllRanges();
      toast('Highlight saved.');
      $('#notes-panel').open = true;
      load();
    };
    document.body.appendChild(btn);
    setTimeout(() => { document.addEventListener('mousedown', (e) => { if (e.target !== btn) btn.remove(); }, { once: true }); }, 0);
  });

  load().catch(() => {});
}

// ---------- AI tutor panel (stub UI over /api/tutor) ----------
function bindTutor(lesson) {
  const thread = $('#tutor-thread');
  const input = $('#tutor-input');
  const sendBtn = $('#tutor-send');
  const push = (who, text) => {
    const div = document.createElement('div');
    div.className = `tutor-msg ${who}`;
    div.textContent = text;
    thread.appendChild(div);
    div.scrollIntoView({ block: 'nearest' });
  };
  const send = async () => {
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    push('you', q);
    sendBtn.disabled = true;
    try {
      const r = await api('/api/tutor', { method: 'POST', body: { message: q, lesson_id: lesson.id } });
      push('tutor', r.reply);
    } catch (err) { push('tutor', err.message); }
    sendBtn.disabled = false;
  };
  sendBtn.onclick = send;
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
}

const INTERACTIVE_TYPES = new Set(['code', 'order', 'match', 'blank']);

function drawLesson() {
  const mod = currentModule;
  const l = mod.lessons[currentLessonIdx];
  const panel = $('#lesson-panel');
  const last = currentLessonIdx === mod.lessons.length - 1;
  const hasQuiz = mod.quiz.length > 0;
  const A = mod.assignments?.length || 0;
  const nextLabel = l.done
    ? (!last ? 'Next lesson' : A ? 'Go to assignments' : hasQuiz ? 'Go to quiz' : 'Done')
    : 'Mark complete & continue';

  exState.solved = new Set();
  exState.interactive = l.blocks.filter((b) => INTERACTIVE_TYPES.has(b.type)).length;

  panel.innerHTML = `
    <h2>${esc(l.title)}</h2>
    ${l.blocks.map((b, bi) => blockHTML(b, bi)).join('')}
    ${l.author ? `<div class="lesson-author">${icon('signature')} Written by ${esc(l.author.name)}${l.author.designation ? `, ${esc(l.author.designation)}` : ''}</div>` : ''}
    <div class="lesson-foot">
      <button class="btn btn-ghost" id="prev-btn" ${currentLessonIdx === 0 ? 'disabled' : ''}>${icon('arrowLeft')} Previous</button>
      <div class="lesson-foot-right">
        <span class="gate-hint" id="gate-hint"></span>
        <button class="btn btn-primary" id="next-btn">
          ${nextLabel} ${icon('arrowRight')}
        </button>
      </div>
    </div>
    <details class="extra-panel" id="notes-panel">
      <summary>${icon('note')} My notes &amp; highlights <span class="badge locked" id="notes-count" hidden></span></summary>
      <div class="extra-body">
        <p class="hint-text">Select any lesson text to highlight it, or write a note below.</p>
        <div id="notes-list"></div>
        <div class="note-compose">
          <textarea id="note-input" placeholder="Write a note about this lesson…" style="min-height:70px"></textarea>
          <button class="btn btn-ghost btn-sm" id="save-note">${icon('plus')} Save note</button>
        </div>
      </div>
    </details>
    <details class="extra-panel tutor-panel">
      <summary>${icon('bot')} Ask the tutor <span class="badge draft">Coming soon</span></summary>
      <div class="extra-body">
        <div id="tutor-thread"></div>
        <div class="note-compose">
          <input id="tutor-input" placeholder="Ask anything about this lesson…">
          <button class="btn btn-ghost btn-sm" id="tutor-send">${icon('arrowRight')} Ask</button>
        </div>
      </div>
    </details>`;

  bindBlocks(l);
  bindNotes(l);
  bindTutor(l);
  updateLessonGate();

  $('#prev-btn').onclick = () => { currentLessonIdx--; drawModule(); };
  $('#next-btn').onclick = async () => {
    const btn = $('#next-btn');
    if (!l.done) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>';
      try {
        const r = await api(`/api/lesson/${l.id}/complete`, { method: 'POST' });
        l.done = true;
        if (r.firstTime) {
          refreshMe().then(() => {
            const chip = $('#streak-chip');
            if (chip && meStats) { chip.classList.toggle('lit', meStats.activeToday); chip.querySelector('span').textContent = meStats.streak; }
          });
          await celebrateLesson();
        }
        if (r.moduleCompleted && !mod.completed) { mod.completed = true; toast('Module completed! The next module is unlocked.', 'success'); }
      } catch (err) { toast(err.message, 'error'); btn.disabled = false; return; }
    }
    if (!last) currentLessonIdx++;
    else if (A) currentLessonIdx = mod.lessons.length;
    else if (hasQuiz) currentLessonIdx = mod.lessons.length + A;
    drawModule();
  };
}

function drawQuiz(result = null) {
  const mod = currentModule;
  const panel = $('#lesson-panel');
  const answers = drawQuiz._answers || (drawQuiz._answers = {});

  let banner = '';
  if (result) {
    banner = `
    <div class="score-banner ${result.passed ? 'pass' : 'fail'}">
      <span class="big">${REDUCED_MOTION ? result.score + '%' : '0%'}</span>
      <div>
        <strong>${result.passed ? 'Passed — brilliant work!' : `Not quite — you need ${result.pass_percent}% to pass.`}</strong><br>
        <span style="color:var(--fg-muted);font-size:13.5px">${result.passed ? (result.moduleCompleted ? 'Module complete.' : 'Quiz passed. Finish any remaining lessons to complete the module.') : 'Review the lessons and try again — correct answers are highlighted below.'}</span>
        ${result.xpGained ? `<span class="xp-chip">${icon('zap')} +${result.xpGained + (result.moduleCompleted ? 50 : 0)} XP</span>` : ''}
      </div>
    </div>
    ${result.passed && result.moduleCompleted && result.nextModule ? `
    <div class="unlock-note" id="unlock-note">
      <span class="unlock-lock">${icon('lock')}${icon('unlock')}</span>
      <div><strong>Module unlocked</strong><br>
      <span style="color:var(--fg-muted);font-size:13.5px">${esc(result.nextModule.title)} is now open on your path.</span></div>
      <a class="btn btn-primary btn-sm" href="#/module/${result.nextModule.id}" style="margin-left:auto">Start ${icon('arrowRight')}</a>
    </div>` : ''}`;
  }

  panel.innerHTML = `
    <h2>Final quiz</h2>
    <p style="color:var(--fg-muted);font-size:14px;margin-bottom:22px">Score ${mod.pass_percent}% or higher to pass. ${mod.quiz.length} questions.</p>
    ${banner}
    <form id="quiz-form">
      ${mod.quiz.map((q, qi) => `
      <fieldset class="quiz-q" style="border:none">
        <legend class="q-text"><span class="q-num">${qi + 1}.</span> ${esc(q.question)}</legend>
        ${q.options.map((opt) => {
          let cls = answers[q.id] === opt.k ? 'selected' : '';
          if (result) {
            const d = result.detail.find((x) => x.id === q.id);
            if (d && opt.k === d.correct_index) cls = 'correct';
            else if (d && answers[q.id] === opt.k && !d.correct) cls = 'wrong';
          }
          return `<label class="quiz-opt ${cls}">
            <input type="radio" name="q${q.id}" value="${opt.k}" ${answers[q.id] === opt.k ? 'checked' : ''} ${result ? 'disabled' : ''}>
            <span>${esc(opt.text)}</span>
          </label>`;
        }).join('')}
      </fieldset>`).join('')}
      ${result
        ? (result.passed
          ? `<button type="button" class="btn btn-primary" id="quiz-done">Back to modules ${icon('arrowRight')}</button>`
          : `<button type="button" class="btn btn-primary" id="quiz-retry">Try again</button>`)
        : `<button type="submit" class="btn btn-primary">Submit answers ${icon('check')}</button>`}
    </form>`;

  if (!result) {
    panel.querySelectorAll('input[type=radio]').forEach((r) => {
      r.onchange = () => {
        answers[Number(r.name.slice(1))] = Number(r.value);
        panel.querySelectorAll(`input[name=${r.name}]`).forEach((x) => x.closest('.quiz-opt').classList.toggle('selected', x.checked));
      };
    });
    $('#quiz-form').onsubmit = async (e) => {
      e.preventDefault();
      if (Object.keys(answers).length < mod.quiz.length) { toast('Please answer every question first.', 'error'); return; }
      const btn = $('button[type=submit]', e.target);
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Scoring…';
      try {
        const r = await api(`/api/module/${mod.id}/quiz`, { method: 'POST', body: { answers } });
        if (r.passed && !mod.completed && r.moduleCompleted) mod.completed = true;
        drawQuiz(r);
        const big = $('.score-banner .big');
        countUp(big, r.score);
        if (r.passed) { particleBurst(big); refreshMe(); }
      } catch (err) { toast(err.message, 'error'); btn.disabled = false; btn.innerHTML = `Submit answers ${icon('check')}`; }
    };
  } else if (result.passed) {
    $('#quiz-done').onclick = () => { drawQuiz._answers = {}; location.hash = '#/catalog'; };
  } else {
    // Re-fetch so the retry draws a fresh random set from the question bank.
    $('#quiz-retry').onclick = () => { drawQuiz._answers = {}; renderModule(mod.id, mod.lessons.length + (mod.assignments?.length || 0)); };
  }
}

// ---------- my learning ----------
async function renderLearning() {
  app.innerHTML = shell('learning', `
    <div class="page-head">
      <span class="eyebrow">Your enrolled work</span>
      <h1>My Learning</h1>
      <p>Everything you're enrolled in, grouped by what to do next. Looking for something new to add? That's what <a href="#/catalog">Explore</a> is for.</p>
    </div>
    <div id="learn-sections"><div class="skeleton" style="min-height:300px"></div></div>`);
  bindShell();
  try {
    const { modules } = await api('/api/catalog');
    const owned = modules.filter((m) => m.owned);
    const box = $('#learn-sections');
    if (!owned.length) {
      box.innerHTML = `<div class="card empty">${icon('book')}<h3>Nothing here yet</h3><p>Pick your first module from Explore and start your learning journey.</p><a class="btn btn-primary" href="#/catalog">Explore modules ${icon('arrowRight')}</a></div>`;
      return;
    }
    const inProgress = owned.filter((m) => !m.completed && m.unlocked);
    const lockedUp = owned.filter((m) => !m.completed && !m.unlocked);
    const completed = owned.filter((m) => m.completed);
    const section = (title, sub, list) => !list.length ? '' : `
      <div class="section-row" style="margin-top:30px"><h3>${title}</h3></div>
      <p class="hint-text" style="margin:-8px 0 14px">${sub}</p>
      <div class="grid">${list.map((m) => moduleCard(m, modules.indexOf(m))).join('')}</div>`;
    box.innerHTML = section('Continue learning', 'Pick up right where you left off.', inProgress)
      + section('Up next — locked', 'Finish the previous module in each track to unlock these.', lockedUp)
      + section('Completed', 'Great work — certificates are one click away.', completed);
  } catch (err) {
    if (err.status === 401) { me = null; render(); return; }
    toast(err.message, 'error');
  }
}

// ---------- review hub: current focus, recent completions, flashcards ----------
async function renderReview() {
  app.innerHTML = shell('review', '<div class="skeleton" style="min-height:340px"></div>');
  bindShell();
  let cards, dash;
  try {
    [cards, dash] = await Promise.all([
      api('/api/review/queue').then((r) => r.cards),
      api('/api/dashboard'),
    ]);
  } catch (err) { if (err.status === 401) { me = null; render(); } else toast(err.message, 'error'); return; }

  const recap = `
    <div class="page-head" style="margin-bottom:22px">
      <span class="eyebrow">Recap & practice</span>
      <h1>Review</h1>
      <p>Your current focus, recently finished work, and a daily flashcard review to keep it all fresh.</p>
    </div>
    ${dash.resume ? `
    <a class="card cl-card" href="#/module/${dash.resume.module_id}/lesson/${dash.resume.lesson_idx}" style="margin-bottom:28px">
      ${thumbHTML(0)}
      <div class="cl-info">
        <strong>Continue: ${esc(dash.resume.module_title)}</strong>
        <span class="cl-meta">Next up: ${esc(dash.resume.lesson_label)} · ${dash.resume.lessonsDone}/${dash.resume.lessonsTotal} lessons</span>
      </div>
      <span class="btn btn-primary btn-sm cl-btn">Resume ${icon('arrowRight')}</span>
    </a>` : ''}
    ${dash.recentCompletions.length ? `
    <div class="section-row"><h3>Recently completed</h3></div>
    <div class="recent-chip-row" style="margin-bottom:28px">
      ${dash.recentCompletions.map((c) => `
      <a class="recent-chip" href="#/module/${c.module_id}">${icon('check')} ${esc(c.title)}</a>`).join('')}
    </div>` : ''}
    <div class="section-row"><h3>Daily flashcard review</h3></div>`;

  const total = cards.length;
  let idx = 0;
  let flipped = false;

  function draw() {
    const area = $('#flash-area');
    if (idx >= cards.length) {
      refreshMe().then(() => {
        const link = document.querySelector('a[href="#/review"]');
        if (link) link.innerHTML = 'Review' + (meStats?.dueReviews ? ` <span class="due-pill">${meStats.dueReviews}</span>` : '');
      });
      area.innerHTML = `
        <div class="card empty">${icon('trophy')}<h3>${total ? 'Review complete!' : 'Nothing due today'}</h3>
        <p>${total ? `You reviewed ${idx} card${idx === 1 ? '' : 's'}. They'll come back right before you'd forget them.` : 'Flashcards from your modules appear here on their schedule. Learn something new to add more.'}</p>
        ${dash.resume ? `<a class="btn btn-primary" href="#/module/${dash.resume.module_id}/lesson/${dash.resume.lesson_idx}">Continue learning ${icon('arrowRight')}</a>` : `<a class="btn btn-primary" href="#/catalog">Explore modules ${icon('arrowRight')}</a>`}</div>`;
      return;
    }
    const c = cards[idx];
    area.innerHTML = `
      <p style="color:var(--fg-muted);margin-bottom:14px">Card ${idx + 1} of ${cards.length} · ${esc(c.module_title)}</p>
      <div class="progress-track" style="max-width:560px;margin-bottom:24px"><div class="progress-fill" style="width:${Math.round((idx / cards.length) * 100)}%"></div></div>
      <div class="flash-stage">
        <button class="flash-card ${flipped ? 'flipped' : ''}" id="flash-card" aria-label="Flip card">
          <span class="flash-side flash-front"><span class="flash-hint">${flipped ? '' : 'Tap to reveal'}</span>${esc(c.front)}</span>
          <span class="flash-side flash-back">${esc(c.back)}</span>
        </button>
        <div class="grade-row ${flipped ? '' : 'hidden'}">
          <button class="btn btn-ghost grade-again" data-grade="again">Again</button>
          <button class="btn btn-ghost grade-hard" data-grade="hard">Hard</button>
          <button class="btn btn-ghost grade-good" data-grade="good">Good</button>
          <button class="btn btn-ghost grade-easy" data-grade="easy">Easy</button>
        </div>
      </div>`;
    $('#flash-card').onclick = () => { if (!flipped) { flipped = true; draw(); } };
    area.querySelectorAll('[data-grade]').forEach((b) => {
      b.onclick = async () => {
        try {
          const r = await api(`/api/review/${c.id}`, { method: 'POST', body: { grade: b.dataset.grade } });
          if (b.dataset.grade === 'again') cards.push(c); // repeat at the end of today's queue
          else toast(`Next review in ${r.nextDueDays === 0 ? 'less than a day' : r.nextDueDays + ' day' + (r.nextDueDays === 1 ? '' : 's')}.`);
          idx++; flipped = false; draw();
        } catch (err) { toast(err.message, 'error'); }
      };
    });
  }
  $('.container').innerHTML = recap + '<div id="flash-area"></div>';
  draw();
}

// ---------- home dashboard ----------
function ringSVG(pct, size = 148) {
  const r = 62;
  const c = 2 * Math.PI * r;
  return `
  <svg class="ring" width="${size}" height="${size}" viewBox="0 0 148 148" role="img" aria-label="Module progress ${pct}%">
    <defs><linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--accent-bright)"/><stop offset="100%" stop-color="var(--accent-2)"/>
    </linearGradient></defs>
    <circle cx="74" cy="74" r="${r}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="10"/>
    <circle class="ring-fill" cx="74" cy="74" r="${r}" fill="none" stroke="url(#ring-grad)" stroke-width="10"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-target="${c * (1 - pct / 100)}"
      transform="rotate(-90 74 74)"/>
    <text x="74" y="70" text-anchor="middle" class="ring-num">${pct}%</text>
    <text x="74" y="92" text-anchor="middle" class="ring-label">complete</text>
  </svg>`;
}

function heatmapHTML(heat) {
  const byDay = new Map(heat.map((h) => [h.day, h.n]));
  const cells = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 139);
  // align to Monday-start weeks
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const monthMarks = [];
  let lastMonth = -1;
  for (let d = new Date(start), col = 0; d <= today; d.setDate(d.getDate() + 7), col++) {
    if (d.getMonth() !== lastMonth) { lastMonth = d.getMonth(); monthMarks.push({ col, label: d.toLocaleString('en', { month: 'short' }) }); }
  }
  for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const key = fmt(d);
    const n = byDay.get(key) || 0;
    const lvl = n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4;
    cells.push(`<span class="heat-cell l${lvl}" title="${key}: ${n} activit${n === 1 ? 'y' : 'ies'}"></span>`);
  }
  return `
  <div class="heat-months">${monthMarks.map((m) => `<span style="grid-column:${m.col + 1}">${m.label}</span>`).join('')}</div>
  <div class="heat-grid">${cells.join('')}</div>
  <div class="heat-legend"><span>Less</span>${[0, 1, 2, 3, 4].map((l) => `<span class="heat-cell l${l}"></span>`).join('')}<span>More</span></div>`;
}

const THUMB_ART = [
  ['#6366f1', '#8b5cf6', 'logo'],
  ['#0891b2', '#22d3ee', 'code'],
  ['#7c3aed', '#c084fc', 'sparkle'],
  ['#059669', '#34d399', 'book'],
];
function thumbHTML(i, size = '') {
  const [c1, c2, ic] = THUMB_ART[i % THUMB_ART.length];
  return `<span class="cl-thumb ${size}" style="background:linear-gradient(135deg,${c1},${c2})" aria-hidden="true">${icon(ic)}</span>`;
}

async function renderHome() {
  app.innerHTML = shell('home', '<div class="skeleton" style="min-height:400px"></div>');
  bindShell();
  try {
    const [d, cat] = await Promise.all([api('/api/dashboard'), api('/api/catalog')]);
    const modules = cat.modules;
    const inProgress = modules.filter((m) => m.owned && !m.completed);
    const recommended = modules.filter((m) => !m.owned).slice(0, 4);
    const earned = d.badges.filter((b) => b.earned);
    const overallPct = d.stats.owned ? Math.round((d.stats.completed / d.stats.owned) * 100) : 0;

    const clCard = (m) => {
      const i = modules.indexOf(m);
      const pct = m.lessonsTotal ? Math.round((m.lessonsDone / m.lessonsTotal) * 100) : 0;
      const resumeHere = d.resume && d.resume.module_id === m.id;
      const href = resumeHere ? `#/module/${m.id}/lesson/${d.resume.lesson_idx}` : `#/module/${m.id}`;
      return `
      <a class="card cl-card" href="${href}">
        ${thumbHTML(i)}
        <div class="cl-info">
          <strong>${esc(m.title)}</strong>
          <span class="cl-meta">${pct}% complete · ${m.lessonsDone} of ${m.lessonsTotal} lessons</span>
          <div class="progress-track" style="margin:8px 0 0"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
        <span class="btn btn-primary btn-sm cl-btn">${m.unlocked ? 'Continue' : icon('lock')}</span>
      </a>`;
    };

    const recCard = (m) => `
      <div class="card rec-card">
        ${thumbHTML(modules.indexOf(m), 'sm')}
        <strong>${esc(m.title)}</strong>
        <span class="cl-meta">${m.lessonsTotal} lessons · ${esc(m.level)}</span>
        <div class="rec-foot"><span class="price" style="font-size:16px">${money(m.price)}</span>
        <button class="btn btn-ghost btn-sm" data-buy="${m.id}">View</button></div>
      </div>`;

    $('.container').innerHTML = `
      <div class="home-layout">
        <div class="home-main">
          <div class="page-head" style="margin-bottom:22px">
            <h1 style="font-size:28px">Welcome back, ${esc(me.name.split(' ')[0])} <span class="wave">👋</span></h1>
            <p>${d.resume ? 'Pick up right where you left off.' : d.stats.completed > 0 ? 'Everything you own is complete — grab the next module.' : 'Your learning path is ready when you are.'}</p>
          </div>
          <div class="section-row"><h3>Continue learning</h3><a class="view-all" href="#/learning">View all ${icon('arrowRight')}</a></div>
          ${inProgress.length ? `<div class="cl-grid">${inProgress.slice(0, 2).map(clCard).join('')}</div>` : `
          <div class="card empty" style="padding:36px">${icon('sparkle')}<h3>Nothing in progress</h3>
          <p>${d.stats.completed > 0 ? 'Unlock the next module on your path.' : 'Start with the first module of the neural path.'}</p>
          <a class="btn btn-primary" href="#/catalog">Browse the path ${icon('arrowRight')}</a></div>`}
          ${recommended.length ? `
          <div class="section-row" style="margin-top:28px"><h3>Recommended for you</h3><a class="view-all" href="#/catalog">View all ${icon('arrowRight')}</a></div>
          <div class="rec-grid">${recommended.map(recCard).join('')}</div>` : ''}
          <section class="card heat-card" style="margin-top:28px">
            <h3 style="font-size:16px;margin-bottom:14px">Learning activity</h3>
            ${heatmapHTML(d.heatmap)}
          </section>
        </div>
        <aside class="progress-panel">
          <div class="card panel-card">
            <h3>Your progress</h3>
            ${ringSVG(overallPct, 138)}
            <div class="tile-row">
              <div class="tile"><strong>${d.stats.owned}</strong><span>Enrolled</span></div>
              <div class="tile"><strong>${d.stats.completed}</strong><span>Completed</span></div>
              <div class="tile"><strong>${d.xp}</strong><span>XP</span></div>
            </div>
            <div class="level-line">
              <span>${icon('zap')} Level ${d.level}</span><span>${d.levelCeil - d.xp} XP to ${d.level + 1}</span>
            </div>
            <div class="progress-track" style="margin-top:6px"><div class="progress-fill" style="width:${d.levelProgress}%"></div></div>
          </div>
          <div class="card panel-card">
            <h3>Recent achievements</h3>
            ${earned.length ? earned.slice(-3).reverse().map((b) => `
            <div class="ach-row"><span class="badge-icon">${icon(b.icon)}</span><div><strong>${esc(b.name)}</strong><span>${esc(b.desc)}</span></div></div>`).join('')
            : '<p class="hint-text" style="margin:0">Complete a lesson to earn your first badge.</p>'}
            <a class="view-all" href="#/badges" id="all-badges" style="margin-top:10px">All badges ${icon('arrowRight')}</a>
            <div class="badge-grid mini" id="badge-strip" hidden>
              ${d.badges.map((b) => `
              <div class="card badge-card ${b.earned ? 'earned' : ''}" title="${esc(b.desc)}">
                <span class="badge-icon">${icon(b.icon)}</span><strong>${esc(b.name)}</strong>
              </div>`).join('')}
            </div>
          </div>
        </aside>
      </div>`;

    $('#all-badges').onclick = (e) => {
      e.preventDefault();
      const strip = $('#badge-strip');
      strip.hidden = !strip.hidden;
    };
    $('.container').querySelectorAll('[data-buy]').forEach((b) => {
      b.onclick = () => openCheckout(modules.find((m) => m.id === Number(b.dataset.buy)));
    });

    // animate the ring in
    requestAnimationFrame(() => {
      const fill = $('.ring-fill');
      if (fill) {
        if (REDUCED_MOTION) fill.style.strokeDashoffset = fill.dataset.target;
        else setTimeout(() => { fill.style.strokeDashoffset = fill.dataset.target; }, 60);
      }
    });
  } catch (err) {
    if (err.status === 401) { me = null; render(); return; }
    toast(err.message, 'error');
  }
}

// ---------- celebrations ----------
function celebrateLesson() {
  if (REDUCED_MOTION) return Promise.resolve();
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'celebrate-overlay';
    el.innerHTML = `
      <svg viewBox="0 0 100 100" class="check-draw" aria-hidden="true">
        <circle cx="50" cy="50" r="44" fill="none"/>
        <path d="M30 52l14 13 26-30" fill="none"/>
      </svg>
      <span class="celebrate-xp">+10 XP</span>`;
    document.body.appendChild(el);
    setTimeout(() => { el.classList.add('out'); }, 950);
    setTimeout(() => { el.remove(); resolve(); }, 1250);
  });
}

function particleBurst(originEl) {
  if (REDUCED_MOTION) return;
  const rect = originEl ? originEl.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#7c8aff', '#8b5cf6', '#22d3ee', '#34d399', '#fbbf24'];
  const holder = document.createElement('div');
  holder.className = 'particles';
  for (let i = 0; i < 38; i++) {
    const p = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 130;
    p.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i % colors.length]};
      width:${4 + Math.random() * 6}px;height:${4 + Math.random() * 6}px;
      transition-duration:${600 + Math.random() * 500}ms;`;
    p.dataset.tx = Math.cos(angle) * dist;
    p.dataset.ty = Math.sin(angle) * dist - 40;
    holder.appendChild(p);
  }
  document.body.appendChild(holder);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    holder.querySelectorAll('span').forEach((p) => {
      p.style.transform = `translate(${p.dataset.tx}px, ${p.dataset.ty}px) scale(0.3) rotate(${Math.random() * 300}deg)`;
      p.style.opacity = '0';
    });
  }));
  setTimeout(() => holder.remove(), 1400);
}

function countUp(el, target, suffix = '%') {
  if (REDUCED_MOTION) { el.textContent = target + suffix; return; }
  const t0 = performance.now();
  const dur = 800;
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  // rAF is paused in hidden tabs — make sure the final value always lands.
  setTimeout(() => { el.textContent = target + suffix; }, dur + 100);
}

// ---------- command palette (Cmd/Ctrl+K) ----------
const palette = {
  el: null, items: [], filtered: [], sel: 0,
  staticItems() {
    const acts = [
      { type: 'action', title: 'Go to Home', hint: 'Dashboard', run: () => { location.hash = '#/home'; } },
      { type: 'action', title: 'Go to Modules', hint: 'Neural path', run: () => { location.hash = '#/catalog'; } },
      { type: 'action', title: 'Go to My Learning', hint: 'Progress', run: () => { location.hash = '#/learning'; } },
      { type: 'action', title: 'Start daily review', hint: 'Flashcards', run: () => { location.hash = '#/review'; } },
      { type: 'action', title: 'Sign out', hint: 'Account', run: async () => { await api('/api/logout', { method: 'POST' }); me = null; render(); } },
    ];
    if (me?.role === 'admin' || me?.role === 'teacher') acts.push({ type: 'action', title: 'Open admin panel', hint: me.role === 'admin' ? 'Admin' : 'Teacher', run: () => { location.href = '/admin'; } });
    return acts;
  },
  async open() {
    if (!me) return;
    this.close();
    const el = document.createElement('div');
    el.className = 'palette-scrim';
    el.innerHTML = `
      <div class="palette" role="dialog" aria-label="Command palette">
        <div class="palette-input-row">${icon('search')}<input id="palette-input" placeholder="Search modules, lessons, actions…" autocomplete="off"></div>
        <ul class="palette-list" id="palette-list"></ul>
        <div class="palette-foot"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></div>
      </div>`;
    document.body.appendChild(el);
    this.el = el;
    el.addEventListener('mousedown', (e) => { if (e.target === el) this.close(); });
    this.items = this.staticItems();
    try {
      const d = await api('/api/palette');
      for (const it of d.items) {
        if (it.type === 'subject') this.items.push({ type: 'module', title: it.title, hint: 'Subject', run: () => { location.hash = `#/subject/${it.id}`; } });
        else if (it.type === 'module') this.items.push({ type: 'module', title: it.title, hint: it.owned ? 'Module' : 'Module · not owned', run: () => { location.hash = `#/module/${it.id}`; } });
        else this.items.push({ type: 'lesson', title: it.title, hint: it.module_title, run: () => { location.hash = `#/module/${it.module_id}/lesson/${it.idx}`; } });
      }
    } catch { /* palette still works with actions only */ }
    const input = $('#palette-input');
    input.focus();
    input.oninput = () => this.update(input.value);
    input.onkeydown = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); this.sel = Math.min(this.sel + 1, this.filtered.length - 1); this.paint(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.sel = Math.max(this.sel - 1, 0); this.paint(); }
      else if (e.key === 'Enter') { e.preventDefault(); this.exec(this.filtered[this.sel]); }
    };
    this.update('');
  },
  update(q) {
    const norm = q.trim().toLowerCase();
    const score = (title) => {
      const t = title.toLowerCase();
      if (!norm) return 1;
      if (t.includes(norm)) return 100 - t.indexOf(norm);
      let ti = 0;
      for (const ch of norm) { ti = t.indexOf(ch, ti); if (ti === -1) return 0; ti++; }
      return 10;
    };
    this.filtered = this.items
      .map((it) => ({ ...it, _s: score(it.title) + (it.type === 'action' ? 0.5 : 0) }))
      .filter((it) => it._s > 0)
      .sort((a, b) => b._s - a._s)
      .slice(0, 9);
    this.sel = 0;
    this.paint();
  },
  paint() {
    const list = $('#palette-list');
    if (!list) return;
    const typeIcon = { action: 'sparkle', module: 'layers' in ICONS ? 'layers' : 'book', lesson: 'book' };
    list.innerHTML = this.filtered.length ? this.filtered.map((it, i) => `
      <li class="${i === this.sel ? 'active' : ''}" data-pi="${i}">
        ${icon(it.type === 'action' ? 'sparkle' : it.type === 'module' ? 'logo' : 'book')}
        <span class="p-title">${esc(it.title)}</span>
        <span class="p-hint">${esc(it.hint || '')}</span>
      </li>`).join('') : '<li class="empty-row">No matches</li>';
    list.querySelectorAll('[data-pi]').forEach((li) => {
      li.onmouseenter = () => { this.sel = Number(li.dataset.pi); this.paint(); };
      li.onclick = () => this.exec(this.filtered[Number(li.dataset.pi)]);
    });
  },
  exec(item) { if (!item) return; this.close(); item.run(); },
  close() { this.el?.remove(); this.el = null; },
};
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette.el ? palette.close() : palette.open(); }
  if (e.key === 'Escape') palette.close();
});

// ---------- router ----------
function render() {
  if (!me) { renderAuth(); return; }
  const hash = location.hash || '#/home';
  const mModule = hash.match(/^#\/module\/(\d+)(?:\/lesson\/(\d+))?/);
  if (mModule) { drawQuiz._answers = {}; renderModule(Number(mModule[1]), mModule[2] ? Number(mModule[2]) : 0); return; }
  const mSubject = hash.match(/^#\/subject\/(\d+)/);
  if (mSubject) { renderSubject(Number(mSubject[1])); return; }
  if (hash.startsWith('#/learning')) { renderLearning(); return; }
  if (hash.startsWith('#/catalog')) { renderCatalog(); return; }
  if (hash.startsWith('#/review')) { renderReview(); return; }
  renderHome();
}
window.addEventListener('hashchange', render);

(async function init() {
  await refreshMe();
  render();
})();
