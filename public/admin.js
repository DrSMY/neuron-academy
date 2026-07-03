'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const app = $('#app');

const ICONS = {
  logo: '<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="nlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><rect width="48" height="48" rx="13" fill="url(#nlg)"/><g stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.9"><path d="M24 24 14 15.5M24 24l10.5-9M24 24l9 10M24 24l-9.5 9.5M24 24V13"/></g><circle cx="24" cy="24" r="4.2" fill="#fff"/><circle cx="14" cy="15.5" r="2.6" fill="#fff"/><circle cx="34.5" cy="15" r="3.2" fill="#67e8f9"/><circle cx="33" cy="34" r="2.8" fill="#fff" opacity="0.9"/><circle cx="14.5" cy="33.5" r="2.2" fill="#fff" opacity="0.75"/><circle cx="24" cy="13" r="2.4" fill="#fff" opacity="0.85"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8M5 9.5V21h14V9.5"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l10 5.5L12 13 2 7.5zM2 12.5 12 18l10-5.5M2 17.5 12 23l10-5.5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5M16 4.7a3.5 3.5 0 0 1 0 6.6M18 15.2c1.8.7 3 2.1 3.5 4.3"/></svg>',
  dollar: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M17 6.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 1.8 2.7 5 3.5 5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 5H5a1 1 0 0 0-1 1c0 2.2 1.8 4 4 4m8-5h3a1 1 0 0 1 1 1c0 2.2-1.8 4-4 4m-4 3v3m-4 4h8m-6-4h4l1 4H8z"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.5 12h10L20 8H6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5m6-6-6 6 6 6"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M12 9v5m0 3v.5M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15h4m-4-3h8"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
};
ICONS.sun = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.4m0 14.2v2.4M4.9 4.9l1.7 1.7m10.8 10.8 1.7 1.7M2.5 12h2.4m14.2 0h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/></svg>';
ICONS.moon = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>';
function icon(n) { return ICONS[n] || ''; }

function currentTheme() { return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'; }
function toggleTheme(btn) {
  const next = currentTheme() === 'light' ? 'dark' : 'light';
  const root = document.documentElement;
  root.classList.add('theme-anim');
  setTimeout(() => root.classList.remove('theme-anim'), 420);
  root.dataset.theme = next;
  localStorage.setItem('na-theme', next);
  if (btn) {
    btn.innerHTML = icon(next === 'light' ? 'moon' : 'sun');
    btn.classList.remove('flip');
    void btn.offsetWidth;
    btn.classList.add('flip');
  }
}
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function money(n) { return '$' + Number(n).toFixed(2).replace(/\.00$/, ''); }

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Request failed'); e.status = res.status; throw e; }
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
  modalEl.querySelectorAll('[data-close]').forEach((b) => { b.onclick = closeModal; });
}
function closeModal() { scrim.classList.remove('open'); }
scrim.addEventListener('click', (e) => { if (e.target === scrim) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function confirmDialog(title, message, onYes) {
  openModal(`
    <div class="modal-head"><h3>${esc(title)}</h3><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <p style="color:var(--fg-muted);margin-bottom:24px">${esc(message)}</p>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn btn-ghost" data-close>Cancel</button>
      <button class="btn btn-danger" id="confirm-yes">Delete</button>
    </div>`);
  $('#confirm-yes').onclick = async () => { closeModal(); await onYes(); };
}

let me = null;
let view = 'overview';

// ---------- shell ----------
function shell(content) {
  return `
  <header class="topbar">
    <a class="brand" href="/admin"><span class="logo">${icon('logo')}</span><span class="brand-text">Neuron Academy</span> <span style="color:var(--fg-faint);font-weight:400;font-size:13px;margin-left:2px">Admin</span></a>
    <span class="spacer"></span>
    <div class="user-chip">
      <button class="icon-btn theme-btn" id="theme-btn" aria-label="Toggle theme">${icon(currentTheme() === 'light' ? 'moon' : 'sun')}</button>
      <a class="nav-link" href="/">Learner view</a>
      <span class="avatar" aria-hidden="true">${esc(me.name.charAt(0).toUpperCase())}</span>
      <button class="btn btn-ghost btn-sm" id="logout-btn">Sign out</button>
    </div>
  </header>
  <div class="admin-layout">
    <aside class="sidebar">
      <button class="side-link ${view === 'overview' ? 'active' : ''}" data-view="overview">${icon('home')} Overview</button>
      <button class="side-link ${view === 'modules' || view === 'editor' ? 'active' : ''}" data-view="modules">${icon('layers')} Modules</button>
      <button class="side-link ${view === 'users' || view === 'userDetail' ? 'active' : ''}" data-view="users">${icon('users')} Users & Pricing</button>
      <button class="side-link ${view === 'analytics' ? 'active' : ''}" data-view="analytics">${icon('chart')} Analytics</button>
    </aside>
    <main class="admin-main">${content}</main>
  </div>`;
}
function bindShell() {
  $('#logout-btn').onclick = async () => { await api('/api/logout', { method: 'POST' }); location.href = '/'; };
  const themeBtn = $('#theme-btn');
  if (themeBtn) themeBtn.onclick = () => toggleTheme(themeBtn);
  document.querySelectorAll('.side-link').forEach((b) => {
    b.onclick = () => { view = b.dataset.view; render(); };
  });
}

// ---------- overview ----------
async function renderOverview() {
  app.innerHTML = shell('<div class="skeleton" style="min-height:300px"></div>');
  bindShell();
  const d = await api('/api/admin/overview');
  $('.admin-main').innerHTML = `
    <div class="page-head"><span class="eyebrow">Dashboard</span><h1>Overview</h1></div>
    <div class="stat-grid">
      <div class="card stat-card"><div class="label">${icon('users')} Learners</div><div class="value">${d.learners}</div></div>
      <div class="card stat-card"><div class="label">${icon('layers')} Modules</div><div class="value">${d.published}<span style="font-size:15px;color:var(--fg-faint)"> / ${d.modules} live</span></div></div>
      <div class="card stat-card"><div class="label">${icon('cart')} Enrollments</div><div class="value">${d.enrollments}</div></div>
      <div class="card stat-card"><div class="label">${icon('dollar')} Revenue (sim)</div><div class="value">${money(d.revenue)}</div></div>
      <div class="card stat-card"><div class="label">${icon('trophy')} Completions</div><div class="value">${d.completions}</div></div>
    </div>
    <div class="section-head"><h2>Recent enrollments</h2></div>
    <div class="card table-card">
      ${d.recent.length ? `
      <table class="data">
        <thead><tr><th>Learner</th><th>Module</th><th>Paid</th><th>Transaction</th><th>Date</th></tr></thead>
        <tbody>${d.recent.map((r) => `
          <tr><td class="t-strong">${esc(r.user_name)}</td><td>${esc(r.module_title)}</td>
          <td class="num">${money(r.price_paid)}</td><td style="font-family:monospace;font-size:12.5px">${esc(r.txn_id)}</td>
          <td>${esc(r.purchased_at)}</td></tr>`).join('')}
        </tbody>
      </table>` : `<div class="empty">${icon('cart')}<h3>No enrollments yet</h3><p>When learners purchase modules they will appear here.</p></div>`}
    </div>`;
}

// ---------- catalog structure (subjects & tracks) ----------
function subjectForm(s) {
  openModal(`
    <div class="modal-head"><h3>${s ? 'Edit subject' : 'New subject'}</h3><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <form id="subject-form">
      <div class="field"><label>Subject title <span class="req">*</span></label><input name="title" value="${esc(s?.title || '')}" placeholder="e.g. Mathematics, Business, Design" required></div>
      <div class="field"><label>Description</label><textarea name="description">${esc(s?.description || '')}</textarea></div>
      ${s ? `<div class="field"><label>Position</label><input name="position" type="number" min="1" value="${s.position}"></div>` : ''}
      <label class="check-row field"><input type="checkbox" name="published" ${s?.published ? 'checked' : ''}> Published (visible to learners)</label>
      <button class="btn btn-primary" style="width:100%" type="submit">${s ? 'Save subject' : 'Create subject'}</button>
    </form>`);
  $('#subject-form').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = { title: fd.get('title'), description: fd.get('description'), published: fd.get('published') === 'on', position: s ? Number(fd.get('position')) : undefined };
    try {
      if (s) await api(`/api/admin/subjects/${s.id}`, { method: 'PUT', body });
      else await api('/api/admin/subjects', { method: 'POST', body });
      closeModal();
      toast(s ? 'Subject saved.' : 'Subject created.');
      renderModules();
    } catch (err) { toast(err.message, 'error'); }
  };
}

function trackForm(subjectId, t) {
  openModal(`
    <div class="modal-head"><h3>${t ? 'Edit track' : 'New track'}</h3><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <form id="track-form">
      <div class="field"><label>Track title <span class="req">*</span></label><input name="title" value="${esc(t?.title || '')}" placeholder="e.g. Algebra Basics, Marketing 101" required></div>
      <div class="field"><label>Description</label><textarea name="description">${esc(t?.description || '')}</textarea></div>
      ${t ? `<div class="field"><label>Position</label><input name="position" type="number" min="1" value="${t.position}"></div>` : ''}
      <label class="check-row field"><input type="checkbox" name="published" ${t?.published ? 'checked' : ''}> Published (visible to learners)</label>
      <button class="btn btn-primary" style="width:100%" type="submit">${t ? 'Save track' : 'Create track'}</button>
    </form>`);
  $('#track-form').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = { title: fd.get('title'), description: fd.get('description'), published: fd.get('published') === 'on', subject_id: subjectId, position: t ? Number(fd.get('position')) : undefined };
    try {
      if (t) await api(`/api/admin/tracks/${t.id}`, { method: 'PUT', body });
      else await api('/api/admin/tracks', { method: 'POST', body });
      closeModal();
      toast(t ? 'Track saved.' : 'Track created.');
      renderModules();
    } catch (err) { toast(err.message, 'error'); }
  };
}

// ---------- modules list ----------
async function renderModules() {
  app.innerHTML = shell('<div class="skeleton" style="min-height:300px"></div>');
  bindShell();
  const [{ modules }, { subjects }] = await Promise.all([api('/api/admin/modules'), api('/api/admin/structure')]);
  $('.admin-main').innerHTML = `
    <div class="toolbar">
      <div class="page-head" style="margin:0"><span class="eyebrow">Content</span><h1>Catalog</h1></div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-ghost" id="new-subject">${icon('plus')} New subject</button>
        <button class="btn btn-primary" id="new-module">${icon('plus')} New module</button>
      </div>
    </div>

    <div class="section-head" style="margin-top:6px"><h2>Subjects & tracks</h2></div>
    ${subjects.length ? subjects.map((s) => `
    <div class="card editor-block">
      <div class="block-head">
        <h4>${esc(s.title)} ${s.published ? `<span class="badge completed" style="margin-left:8px">${icon('check')} Live</span>` : '<span class="badge draft" style="margin-left:8px">Draft</span>'}</h4>
        <div class="actions">
          <button class="btn btn-ghost btn-sm" data-add-track="${s.id}">${icon('plus')} Track</button>
          <button class="btn btn-ghost btn-sm" data-edit-subject="${s.id}">${icon('edit')}</button>
          <button class="btn btn-danger btn-sm" data-del-subject="${s.id}" aria-label="Delete subject">${icon('trash')}</button>
        </div>
      </div>
      ${s.tracks.length ? s.tracks.map((t) => `
      <div class="track-row">
        <span class="track-row-title">${esc(t.title)}</span>
        <span class="drag-hint">${t.module_count} module${t.module_count === 1 ? '' : 's'}</span>
        ${t.published ? '<span class="badge completed">Live</span>' : '<span class="badge draft">Draft</span>'}
        <span style="flex:1"></span>
        <button class="icon-btn" data-edit-track="${t.id}" data-subject="${s.id}" aria-label="Edit track">${icon('edit')}</button>
        <button class="icon-btn" data-del-track="${t.id}" aria-label="Delete track">${icon('trash')}</button>
      </div>`).join('') : '<p class="drag-hint" style="margin-top:4px">No tracks yet — add one to hold modules.</p>'}
    </div>`).join('') : `<div class="card empty" style="padding:36px">${icon('layers')}<h3>No subjects yet</h3><p>Create a subject (e.g. Mathematics), add tracks inside it, then assign modules to tracks.</p></div>`}

    <div class="section-head"><h2>Modules</h2></div>
    <div class="card table-card">
      <table class="data">
        <thead><tr><th>#</th><th>Module</th><th>Track</th><th>Content</th><th>Base price</th><th>Pass %</th><th>Enrolled</th><th>Status</th><th></th></tr></thead>
        <tbody>${modules.map((m) => `
          <tr>
            <td class="num">${m.position}</td>
            <td class="t-strong">${esc(m.title)}</td>
            <td>${m.track_title ? `${esc(m.subject_title)} › ${esc(m.track_title)}` : '<span class="badge draft">Unassigned</span>'}</td>
            <td>${m.lesson_count} lessons · ${m.question_count} Qs</td>
            <td class="num">${money(m.base_price)}</td>
            <td class="num">${m.pass_percent}%</td>
            <td class="num">${m.enrollment_count}</td>
            <td>${m.published ? `<span class="badge completed">${icon('check')} Live</span>` : '<span class="badge draft">Draft</span>'}</td>
            <td style="text-align:right;white-space:nowrap">
              <button class="btn btn-ghost btn-sm" data-edit="${m.id}">${icon('edit')} Edit</button>
              <button class="btn btn-danger btn-sm" data-del="${m.id}" aria-label="Delete ${esc(m.title)}">${icon('trash')}</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  $('#new-subject').onclick = () => subjectForm(null);
  $('#new-module').onclick = () => moduleForm(null);
  document.querySelectorAll('[data-edit-subject]').forEach((b) => {
    b.onclick = () => subjectForm(subjects.find((s) => s.id === Number(b.dataset.editSubject)));
  });
  document.querySelectorAll('[data-del-subject]').forEach((b) => {
    b.onclick = () => confirmDialog('Delete subject?', 'Its tracks are removed too. Subjects with modules cannot be deleted.', async () => {
      try {
        await api(`/api/admin/subjects/${b.dataset.delSubject}`, { method: 'DELETE' });
        toast('Subject deleted.');
        renderModules();
      } catch (err) { toast(err.message, 'error'); }
    });
  });
  document.querySelectorAll('[data-add-track]').forEach((b) => {
    b.onclick = () => trackForm(Number(b.dataset.addTrack), null);
  });
  document.querySelectorAll('[data-edit-track]').forEach((b) => {
    const s = subjects.find((x) => x.id === Number(b.dataset.subject));
    b.onclick = () => trackForm(s.id, s.tracks.find((t) => t.id === Number(b.dataset.editTrack)));
  });
  document.querySelectorAll('[data-del-track]').forEach((b) => {
    b.onclick = () => confirmDialog('Delete track?', 'Tracks with modules cannot be deleted — move the modules first.', async () => {
      try {
        await api(`/api/admin/tracks/${b.dataset.delTrack}`, { method: 'DELETE' });
        toast('Track deleted.');
        renderModules();
      } catch (err) { toast(err.message, 'error'); }
    });
  });
  document.querySelectorAll('[data-edit]').forEach((b) => { b.onclick = () => { view = 'editor'; renderEditor(Number(b.dataset.edit)); }; });
  document.querySelectorAll('[data-del]').forEach((b) => {
    b.onclick = () => confirmDialog('Delete module?', 'This permanently removes the module, its lessons, quiz and all enrollment records.', async () => {
      await api(`/api/admin/modules/${b.dataset.del}`, { method: 'DELETE' });
      toast('Module deleted.');
      renderModules();
    });
  });
}

async function moduleForm(mod) {
  const { subjects } = await api('/api/admin/structure');
  const hasTracks = subjects.some((s) => s.tracks.length);
  if (!hasTracks) { toast('Create a subject and a track first — modules live inside tracks.', 'error'); return; }
  const trackSelect = subjects.filter((s) => s.tracks.length).map((s) => `
    <optgroup label="${esc(s.title)}">
      ${s.tracks.map((t) => `<option value="${t.id}" ${mod?.track_id === t.id ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}
    </optgroup>`).join('');
  openModal(`
    <div class="modal-head">
      <h3>${mod ? 'Edit module' : 'New module'}</h3>
      <button class="icon-btn" data-close aria-label="Close">${icon('x')}</button>
    </div>
    <form id="mod-form">
      <div class="field"><label>Title <span class="req">*</span></label><input name="title" value="${esc(mod?.title || '')}" required></div>
      <div class="field"><label>Track <span class="req">*</span></label>
        <select name="track_id">${trackSelect}</select>
        <div class="hint">Learners unlock this track's modules in order.</div>
      </div>
      <div class="field"><label>Description</label><textarea name="description">${esc(mod?.description || '')}</textarea></div>
      <div class="row-2">
        <div class="field"><label>Level</label>
          <select name="level">
            ${['Beginner', 'Intermediate', 'Advanced'].map((l) => `<option ${mod?.level === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>Duration (minutes)</label><input name="duration_mins" type="number" min="1" value="${mod?.duration_mins ?? 60}"></div>
      </div>
      <div class="row-2">
        <div class="field"><label>Base price (USD)</label><input name="base_price" type="number" min="0" step="0.01" value="${mod?.base_price ?? 0}">
          <div class="hint">Per-user overrides are set in Users & Pricing.</div>
        </div>
        <div class="field"><label>Quiz pass mark (%)</label><input name="pass_percent" type="number" min="0" max="100" value="${mod?.pass_percent ?? 70}"></div>
      </div>
      <div class="field"><label>Questions per quiz attempt</label><input name="quiz_draw" type="number" min="0" value="${mod?.quiz_draw ?? 0}">
        <div class="hint">Drawn at random from the question bank on every attempt. 0 = ask all questions.</div>
      </div>
      ${mod ? `<div class="field"><label>Position in path</label><input name="position" type="number" min="1" value="${mod.position}"><div class="hint">Learners unlock modules in this order.</div></div>` : ''}
      <label class="check-row field"><input type="checkbox" name="published" ${mod?.published ? 'checked' : ''}> Published (visible to learners)</label>
      <button class="btn btn-primary" style="width:100%" type="submit">${mod ? 'Save changes' : 'Create module'}</button>
    </form>`);
  $('#mod-form').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      title: fd.get('title'), description: fd.get('description'), level: fd.get('level'),
      duration_mins: Number(fd.get('duration_mins')), base_price: Number(fd.get('base_price')),
      pass_percent: Number(fd.get('pass_percent')), published: fd.get('published') === 'on',
      quiz_draw: Number(fd.get('quiz_draw')) || 0,
      track_id: Number(fd.get('track_id')),
      position: mod ? Number(fd.get('position')) : undefined,
    };
    try {
      if (mod) await api(`/api/admin/modules/${mod.id}`, { method: 'PUT', body });
      else await api('/api/admin/modules', { method: 'POST', body });
      closeModal();
      toast(mod ? 'Module updated.' : 'Module created.');
      if (view === 'editor' && mod) renderEditor(mod.id); else renderModules();
    } catch (err) { toast(err.message, 'error'); }
  };
}

// ---------- module editor (lessons + quiz) ----------
async function renderEditor(moduleId) {
  app.innerHTML = shell('<div class="skeleton" style="min-height:300px"></div>');
  bindShell();
  const d = await api(`/api/admin/modules/${moduleId}/content`);
  const { module: mod, lessons, questions, cards } = d;

  $('.admin-main').innerHTML = `
    <button class="back-link" id="back-mods">${icon('arrowLeft')} All modules</button>
    <div class="toolbar">
      <div class="page-head" style="margin:0">
        <span class="eyebrow">${mod.published ? 'Live' : 'Draft'} · ${money(mod.base_price)} base</span>
        <h1 style="font-size:26px">${esc(mod.title)}</h1>
      </div>
      <button class="btn btn-ghost" id="edit-meta">${icon('settings')} Module settings</button>
    </div>

    <div class="section-head"><h2>Lessons</h2><button class="btn btn-primary btn-sm" id="add-lesson">${icon('plus')} Add lesson</button></div>
    <div id="lesson-list">
      ${lessons.length ? lessons.map((l) => `
        <div class="card editor-block">
          <div class="block-head">
            <h4><span style="color:var(--fg-faint);margin-right:8px">${l.position}.</span>${esc(l.title)}</h4>
            <div class="actions">
              <button class="btn btn-ghost btn-sm" data-edit-lesson="${l.id}">${icon('edit')} Edit</button>
              <button class="btn btn-danger btn-sm" data-del-lesson="${l.id}" aria-label="Delete lesson">${icon('trash')}</button>
            </div>
          </div>
          <span class="drag-hint">${l.blocks.length} block${l.blocks.length === 1 ? '' : 's'}: ${l.blocks.map((b) => b.type).join(', ') || 'empty'}</span>
        </div>`).join('') : `<div class="card empty" style="padding:40px">${icon('layers')}<h3>No lessons yet</h3><p>Add the first lesson to start building this module.</p></div>`}
    </div>

    <div class="section-head"><h2>Quiz (${questions.length} questions)</h2><button class="btn btn-primary btn-sm" id="edit-quiz">${icon('edit')} Edit quiz</button></div>
    <div class="card editor-block">
      ${questions.length ? questions.map((q, i) => `
        <p style="margin:6px 0;color:var(--fg-muted)"><span style="color:var(--accent-bright);font-weight:600">${i + 1}.</span> ${esc(q.question)}
        <span style="color:var(--success);font-size:13px"> — ${esc(q.options[q.correct_index])}</span></p>`).join('')
      : '<p style="color:var(--fg-muted)">No quiz yet — learners complete this module by finishing all lessons. Add questions to require a passing score.</p>'}
      <p class="drag-hint" style="margin-top:10px">Pass mark: ${mod.pass_percent}%${mod.quiz_draw > 0 ? ` · each attempt draws ${mod.quiz_draw} random question${mod.quiz_draw === 1 ? '' : 's'} from the bank` : ' · every attempt asks all questions'}</p>
    </div>

    <div class="section-head"><h2>Flashcards (${cards.length})</h2></div>
    <div class="card editor-block">
      ${cards.length ? cards.map((c) => `
        <div class="block-head" style="margin:6px 0;align-items:flex-start">
          <p style="color:var(--fg-muted);flex:1;margin:0"><strong style="color:var(--fg)">${esc(c.front)}</strong> — ${esc(c.back)}
          ${c.source === 'derived' ? '<span class="badge locked" style="margin-left:8px">auto</span>' : ''}</p>
          <button class="icon-btn" data-del-card="${c.id}" aria-label="Delete card">${icon('x')}</button>
        </div>`).join('') : '<p style="color:var(--fg-muted)">No flashcards yet. Cards are auto-derived from match and fill-blank blocks, or add your own below.</p>'}
      <div class="row-2" style="margin-top:14px">
        <div class="field" style="margin:0"><input id="card-front" placeholder="Front (term or question)"></div>
        <div class="field" style="margin:0"><input id="card-back" placeholder="Back (definition or answer)"></div>
      </div>
      <button class="btn btn-ghost btn-sm" id="add-card" style="margin-top:10px">${icon('plus')} Add flashcard</button>
    </div>`;

  $('#back-mods').onclick = () => { view = 'modules'; render(); };
  $('#edit-meta').onclick = () => moduleForm(mod);
  $('#add-lesson').onclick = () => lessonForm(moduleId, null);
  document.querySelectorAll('[data-edit-lesson]').forEach((b) => {
    b.onclick = () => lessonForm(moduleId, lessons.find((l) => l.id === Number(b.dataset.editLesson)));
  });
  document.querySelectorAll('[data-del-lesson]').forEach((b) => {
    b.onclick = () => confirmDialog('Delete lesson?', 'Learner progress on this lesson will also be removed.', async () => {
      await api(`/api/admin/lessons/${b.dataset.delLesson}`, { method: 'DELETE' });
      toast('Lesson deleted.');
      renderEditor(moduleId);
    });
  });
  $('#edit-quiz').onclick = () => quizEditor(moduleId, mod, questions);
  $('#add-card').onclick = async () => {
    const front = $('#card-front').value.trim();
    const back = $('#card-back').value.trim();
    if (!front || !back) { toast('A card needs both a front and a back.', 'error'); return; }
    try {
      await api(`/api/admin/modules/${moduleId}/cards`, { method: 'POST', body: { front, back } });
      toast('Flashcard added.');
      renderEditor(moduleId);
    } catch (err) { toast(err.message, 'error'); }
  };
  document.querySelectorAll('[data-del-card]').forEach((b) => {
    b.onclick = async () => {
      await api(`/api/admin/cards/${b.dataset.delCard}`, { method: 'DELETE' });
      toast('Flashcard deleted.');
      renderEditor(moduleId);
    };
  });
}

// ---------- block composer ----------
const BLOCK_META = {
  text: { label: 'Text', hint: 'Rich HTML content' },
  video: { label: 'Video', hint: 'Embedded video' },
  code: { label: 'Code playground', hint: 'Runnable JS with goal output' },
  order: { label: 'Put in order', hint: 'Drag-to-order exercise' },
  match: { label: 'Match pairs', hint: 'Term ↔ definition' },
  blank: { label: 'Fill blanks', hint: '{{answer}} placeholders' },
};

function blockEditorHTML(b, i) {
  const meta = BLOCK_META[b.type];
  let body = '';
  if (b.type === 'text') body = `
    <div class="field"><label>HTML content</label><textarea data-f="html" data-i="${i}" style="min-height:150px;font-family:monospace;font-size:13px">${esc(b.html || '')}</textarea>
    <div class="hint">Supports &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;strong&gt;, &lt;em&gt;…</div></div>`;
  if (b.type === 'video') body = `
    <div class="field"><label>Embed URL</label><input data-f="url" data-i="${i}" value="${esc(b.url || '')}" placeholder="https://www.youtube.com/embed/VIDEO_ID"></div>`;
  if (b.type === 'code') body = `
    <div class="field"><label>Instructions</label><input data-f="instructions" data-i="${i}" value="${esc(b.instructions || '')}" placeholder="What should the learner make the code do?"></div>
    <div class="field"><label>Starter code (JavaScript)</label><textarea data-f="starter" data-i="${i}" style="min-height:110px;font-family:monospace;font-size:13px">${esc(b.starter || '')}</textarea></div>
    <div class="field"><label>Goal console output</label><input data-f="expected_output" data-i="${i}" value="${esc(b.expected_output || '')}" placeholder="Leave empty to accept any error-free run">
    <div class="hint">Compared against everything the code logs with console.log.</div></div>`;
  if (b.type === 'order') body = `
    <div class="field"><label>Prompt</label><input data-f="prompt" data-i="${i}" value="${esc(b.prompt || '')}"></div>
    <div class="field"><label>Items — one per line, in the CORRECT order (shuffled for learners)</label>
    <textarea data-f="items" data-i="${i}" style="min-height:100px">${esc((b.items || []).join('\n'))}</textarea></div>`;
  if (b.type === 'match') body = `
    <div class="field"><label>Prompt</label><input data-f="prompt" data-i="${i}" value="${esc(b.prompt || '')}"></div>
    <div class="field"><label>Pairs — one per line as: term = definition</label>
    <textarea data-f="pairs" data-i="${i}" style="min-height:100px">${esc((b.pairs || []).map((p) => `${p.l} = ${p.r}`).join('\n'))}</textarea></div>`;
  if (b.type === 'blank') body = `
    <div class="field"><label>Prompt</label><input data-f="prompt" data-i="${i}" value="${esc(b.prompt || '')}"></div>
    <div class="field"><label>Text with {{answer}} placeholders</label>
    <textarea data-f="text" data-i="${i}" style="min-height:90px">${esc(b.text || '')}</textarea>
    <div class="hint">Accept alternates with a pipe: {{embed|embeds}}</div></div>`;
  return `
  <div class="card q-editor" data-block="${i}">
    <div class="block-head" style="margin-bottom:12px">
      <h4 style="font-size:14px"><span class="badge ready" style="margin-right:8px">${meta.label}</span><span style="color:var(--fg-faint);font-weight:400;font-size:12.5px">${meta.hint}</span></h4>
      <div class="actions">
        <button class="icon-btn" data-bmove="up:${i}" aria-label="Move block up">↑</button>
        <button class="icon-btn" data-bmove="down:${i}" aria-label="Move block down">↓</button>
        <button class="btn btn-danger btn-sm" data-bdel="${i}" aria-label="Delete block">${icon('trash')}</button>
      </div>
    </div>
    ${body}
  </div>`;
}

function lessonForm(moduleId, lesson) {
  let title = lesson?.title || '';
  let position = lesson?.position;
  let blocks = (lesson?.blocks || []).map((b) => JSON.parse(JSON.stringify(b)));
  if (!lesson) blocks = [{ type: 'text', html: '' }];

  function syncFromDOM() {
    title = $('#lesson-title-input').value;
    const posInp = $('#lesson-pos-input');
    if (posInp) position = Number(posInp.value);
    modalEl.querySelectorAll('[data-f]').forEach((el) => {
      const b = blocks[Number(el.dataset.i)];
      const f = el.dataset.f;
      if (f === 'items') b.items = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
      else if (f === 'pairs') b.pairs = el.value.split('\n').map((s) => s.trim()).filter(Boolean)
        .map((line) => { const ix = line.indexOf('='); return { l: line.slice(0, ix).trim(), r: line.slice(ix + 1).trim() }; })
        .filter((p) => p.l && p.r);
      else b[f] = el.value;
    });
  }

  function draw() {
    openModal(`
      <div class="modal-head">
        <div><h3>${lesson ? 'Edit lesson' : 'New lesson'}</h3><div class="sub">Compose the lesson from blocks — learners must solve every exercise block to continue.</div></div>
        <button class="icon-btn" data-close aria-label="Close">${icon('x')}</button>
      </div>
      <div class="row-2">
        <div class="field"><label>Lesson title <span class="req">*</span></label><input id="lesson-title-input" value="${esc(title)}" required></div>
        ${lesson ? `<div class="field"><label>Position</label><input id="lesson-pos-input" type="number" min="1" value="${position}"></div>` : ''}
      </div>
      <div id="blocks-list">${blocks.map(blockEditorHTML).join('')}</div>
      <div class="field" style="margin-top:14px">
        <label>Add block</label>
        <div class="add-block-row">
          ${Object.entries(BLOCK_META).map(([t, m]) => `<button class="btn btn-ghost btn-sm" data-badd="${t}">${icon('plus')} ${m.label}</button>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:8px" id="save-lesson">${lesson ? 'Save lesson' : 'Add lesson'}</button>`, true);

    modalEl.querySelectorAll('[data-badd]').forEach((btn) => {
      btn.onclick = () => {
        syncFromDOM();
        const t = btn.dataset.badd;
        const fresh = { text: { type: 'text', html: '' }, video: { type: 'video', url: '' },
          code: { type: 'code', instructions: '', starter: '', expected_output: '', language: 'javascript' },
          order: { type: 'order', prompt: '', items: [] }, match: { type: 'match', prompt: '', pairs: [] },
          blank: { type: 'blank', prompt: '', text: '' } }[t];
        blocks.push(fresh);
        draw();
      };
    });
    modalEl.querySelectorAll('[data-bdel]').forEach((btn) => {
      btn.onclick = () => { syncFromDOM(); blocks.splice(Number(btn.dataset.bdel), 1); draw(); };
    });
    modalEl.querySelectorAll('[data-bmove]').forEach((btn) => {
      btn.onclick = () => {
        syncFromDOM();
        const [dir, iS] = btn.dataset.bmove.split(':');
        const i = Number(iS);
        const j = dir === 'up' ? i - 1 : i + 1;
        if (j < 0 || j >= blocks.length) return;
        [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        draw();
      };
    });
    $('#save-lesson').onclick = async () => {
      syncFromDOM();
      if (!title.trim()) { toast('The lesson needs a title.', 'error'); return; }
      const body = { title: title.trim(), blocks, position: lesson ? position : undefined };
      try {
        if (lesson) await api(`/api/admin/lessons/${lesson.id}`, { method: 'PUT', body });
        else await api(`/api/admin/modules/${moduleId}/lessons`, { method: 'POST', body });
        closeModal();
        toast(lesson ? 'Lesson saved.' : 'Lesson added.');
        renderEditor(moduleId);
      } catch (err) { toast(err.message, 'error'); }
    };
  }
  draw();
}

function quizEditor(moduleId, mod, questions) {
  let qs = questions.length ? questions.map((q) => ({ question: q.question, options: [...q.options], correct_index: q.correct_index }))
    : [{ question: '', options: ['', ''], correct_index: 0 }];

  function draw() {
    openModal(`
      <div class="modal-head">
        <div><h3>Quiz editor</h3><div class="sub">${esc(mod.title)} — select the radio next to the correct answer</div></div>
        <button class="icon-btn" data-close aria-label="Close">${icon('x')}</button>
      </div>
      <div id="q-list">
        ${qs.map((q, qi) => `
        <div class="card q-editor">
          <div class="block-head" style="margin-bottom:10px">
            <h4 style="font-size:14px;color:var(--fg-muted)">Question ${qi + 1}</h4>
            <button class="btn btn-danger btn-sm" data-del-q="${qi}" aria-label="Remove question">${icon('trash')}</button>
          </div>
          <div class="field"><input data-q="${qi}" placeholder="Type the question…" value="${esc(q.question)}"></div>
          ${q.options.map((opt, oi) => `
          <div class="opt-row">
            <input type="radio" name="correct-${qi}" data-correct="${qi}:${oi}" ${q.correct_index === oi ? 'checked' : ''} aria-label="Mark option ${oi + 1} correct">
            <input type="text" data-opt="${qi}:${oi}" placeholder="Option ${oi + 1}" value="${esc(opt)}">
            ${q.options.length > 2 ? `<button class="icon-btn" data-del-opt="${qi}:${oi}" aria-label="Remove option">${icon('x')}</button>` : ''}
          </div>`).join('')}
          <button class="btn btn-ghost btn-sm" data-add-opt="${qi}" style="margin-top:6px">${icon('plus')} Add option</button>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;margin-top:16px">
        <button class="btn btn-ghost" id="add-q">${icon('plus')} Add question</button>
        <span style="flex:1"></span>
        <button class="btn btn-primary" id="save-quiz">Save quiz</button>
      </div>`, true);

    const sync = () => {
      modalEl.querySelectorAll('[data-q]').forEach((i) => { qs[Number(i.dataset.q)].question = i.value; });
      modalEl.querySelectorAll('[data-opt]').forEach((i) => {
        const [qi, oi] = i.dataset.opt.split(':').map(Number);
        qs[qi].options[oi] = i.value;
      });
      modalEl.querySelectorAll('[data-correct]').forEach((r) => {
        if (r.checked) { const [qi, oi] = r.dataset.correct.split(':').map(Number); qs[qi].correct_index = oi; }
      });
    };

    modalEl.querySelectorAll('[data-del-q]').forEach((b) => { b.onclick = () => { sync(); qs.splice(Number(b.dataset.delQ), 1); draw(); }; });
    modalEl.querySelectorAll('[data-add-opt]').forEach((b) => { b.onclick = () => { sync(); qs[Number(b.dataset.addOpt)].options.push(''); draw(); }; });
    modalEl.querySelectorAll('[data-del-opt]').forEach((b) => {
      b.onclick = () => {
        sync();
        const [qi, oi] = b.dataset.delOpt.split(':').map(Number);
        qs[qi].options.splice(oi, 1);
        if (qs[qi].correct_index >= qs[qi].options.length) qs[qi].correct_index = 0;
        draw();
      };
    });
    $('#add-q').onclick = () => { sync(); qs.push({ question: '', options: ['', ''], correct_index: 0 }); draw(); };
    $('#save-quiz').onclick = async () => {
      sync();
      const clean = qs.filter((q) => q.question.trim());
      for (const q of clean) {
        q.options = q.options.map((o) => o.trim());
        if (q.options.some((o) => !o)) { toast('Every option needs text.', 'error'); return; }
      }
      try {
        await api(`/api/admin/modules/${moduleId}/quiz`, { method: 'PUT', body: { questions: clean } });
        closeModal();
        toast('Quiz saved.');
        renderEditor(moduleId);
      } catch (err) { toast(err.message, 'error'); }
    };
  }
  draw();
}

// ---------- analytics ----------
function funnelBar(label, value, max, cls = '') {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return `
  <div class="funnel-row">
    <span class="funnel-label">${esc(label)}</span>
    <div class="funnel-track"><div class="funnel-fill ${cls}" style="width:${Math.max(pct, value > 0 ? 4 : 0)}%"></div></div>
    <span class="funnel-num">${value}</span>
  </div>`;
}

async function renderAnalytics() {
  app.innerHTML = shell('<div class="skeleton" style="min-height:300px"></div>');
  bindShell();
  const { analytics } = await api('/api/admin/analytics');
  $('.admin-main').innerHTML = `
    <div class="page-head"><span class="eyebrow">Insights</span><h1>Analytics</h1>
    <p>Where learners flow, where they stall, and which quiz questions bite.</p></div>
    ${analytics.map((a) => {
      const max = Math.max(a.funnel.enrolled, 1);
      return `
      <div class="card editor-block" style="padding:24px 26px">
        <h3 style="font-size:17px;margin-bottom:16px">${esc(a.title)}</h3>
        <div class="analytics-cols">
          <div>
            <h4 class="mini-head">Funnel</h4>
            ${funnelBar('Enrolled', a.funnel.enrolled, max)}
            ${funnelBar('Started', a.funnel.started, max)}
            ${funnelBar('Passed quiz', a.funnel.passedQuiz, max)}
            ${funnelBar('Completed', a.funnel.completed, max, 'done')}
          </div>
          <div>
            <h4 class="mini-head">Lesson drop-off</h4>
            ${a.lessons.length ? a.lessons.map((l) => funnelBar(`${l.position}. ${l.title.slice(0, 28)}${l.title.length > 28 ? '…' : ''}`, l.done_by, Math.max(a.funnel.started, 1))).join('') : '<p class="drag-hint">No lessons.</p>'}
          </div>
        </div>
        <h4 class="mini-head" style="margin-top:18px">Quiz item analysis</h4>
        ${a.items.length ? `
        <table class="data">
          <thead><tr><th>Question</th><th>Answered</th><th>% correct</th><th>Most-picked wrong answer</th></tr></thead>
          <tbody>${a.items.map((q) => `
            <tr>
              <td style="max-width:340px">${esc(q.question)}</td>
              <td class="num">${q.shown}</td>
              <td class="num">${q.pctCorrect === null ? '—' : `<span style="color:${q.pctCorrect < 50 ? 'var(--danger)' : q.pctCorrect < 80 ? 'var(--warning)' : 'var(--success)'}">${q.pctCorrect}%</span>`}</td>
              <td>${q.topWrong ? esc(q.topWrong) : '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>` : '<p class="drag-hint">No quiz for this module.</p>'}
      </div>`;
    }).join('')}`;
}

// ---------- users ----------
async function renderUsers() {
  app.innerHTML = shell('<div class="skeleton" style="min-height:300px"></div>');
  bindShell();
  const { users } = await api('/api/admin/users');
  $('.admin-main').innerHTML = `
    <div class="page-head"><span class="eyebrow">Access control</span><h1>Users & Pricing</h1>
    <p>Click a user to set custom per-module prices, grant free access, or override the sequential lock.</p></div>
    <div class="card table-card">
      <table class="data">
        <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Owns</th><th>Completed</th><th>Spent</th><th>Joined</th><th></th></tr></thead>
        <tbody>${users.map((u) => `
          <tr>
            <td class="t-strong">${esc(u.name)}</td>
            <td>${esc(u.email)}</td>
            <td>${u.role === 'admin' ? '<span class="badge ready">Admin</span>' : 'Learner'}</td>
            <td class="num">${u.owned_count}</td>
            <td class="num">${u.completed_count}</td>
            <td class="num">${money(u.spent)}</td>
            <td>${esc(u.created_at.slice(0, 10))}</td>
            <td style="text-align:right"><button class="btn btn-ghost btn-sm" data-user="${u.id}">${icon('settings')} Manage</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  document.querySelectorAll('[data-user]').forEach((b) => {
    b.onclick = () => { view = 'userDetail'; renderUserDetail(Number(b.dataset.user)); };
  });
}

async function renderUserDetail(userId) {
  app.innerHTML = shell('<div class="skeleton" style="min-height:300px"></div>');
  bindShell();
  const d = await api(`/api/admin/users/${userId}`);
  $('.admin-main').innerHTML = `
    <button class="back-link" id="back-users">${icon('arrowLeft')} All users</button>
    <div class="page-head">
      <span class="eyebrow">${esc(d.user.email)}</span>
      <h1 style="font-size:26px">${esc(d.user.name)}</h1>
      <p>Set this user's price per module, grant free access, or unlock modules out of order.</p>
    </div>
    <div class="card table-card">
      <table class="data">
        <thead><tr><th>Module</th><th>Base price</th><th>Custom price</th><th>Free access</th><th>Unlock override</th><th>Status</th><th></th></tr></thead>
        <tbody>${d.modules.map((m) => `
          <tr data-row="${m.module_id}">
            <td class="t-strong">${esc(m.title)} ${m.published ? '' : '<span class="badge draft" style="margin-left:6px">Draft</span>'}</td>
            <td class="num">${money(m.base_price)}</td>
            <td><input type="number" min="0" step="0.01" placeholder="—" value="${m.custom_price ?? ''}" data-price="${m.module_id}" style="width:110px;min-height:36px" aria-label="Custom price for ${esc(m.title)}"></td>
            <td><label class="check-row"><input type="checkbox" data-free="${m.module_id}" ${m.free_access ? 'checked' : ''} aria-label="Free access to ${esc(m.title)}"></label></td>
            <td><label class="check-row"><input type="checkbox" data-unlock="${m.module_id}" ${m.unlock_override ? 'checked' : ''} aria-label="Unlock override for ${esc(m.title)}"></label></td>
            <td>${m.completed ? `<span class="badge completed">${icon('check')} Completed</span>`
              : m.purchased ? `<span class="badge ready">Purchased ${m.price_paid !== null ? money(m.price_paid) : ''}</span>`
              : m.free_access ? '<span class="badge ready">Granted</span>' : '<span class="badge locked">No access</span>'}</td>
            <td style="text-align:right;white-space:nowrap">
              <button class="btn btn-primary btn-sm" data-save="${m.module_id}">Save</button>
              ${m.purchased ? `<button class="btn btn-danger btn-sm" data-revoke="${m.module_id}">Revoke</button>` : ''}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  $('#back-users').onclick = () => { view = 'users'; render(); };

  const save = async (mid, revoke = false) => {
    const price = $(`[data-price="${mid}"]`).value;
    const body = {
      custom_price: price === '' ? null : Number(price),
      free_access: $(`[data-free="${mid}"]`).checked,
      unlock_override: $(`[data-unlock="${mid}"]`).checked,
      revoke_purchase: revoke,
    };
    try {
      await api(`/api/admin/users/${userId}/modules/${mid}`, { method: 'PUT', body });
      toast(revoke ? 'Purchase revoked.' : 'Settings saved.');
      if (revoke) renderUserDetail(userId);
    } catch (err) { toast(err.message, 'error'); }
  };
  document.querySelectorAll('[data-save]').forEach((b) => { b.onclick = () => save(Number(b.dataset.save)); });
  document.querySelectorAll('[data-revoke]').forEach((b) => {
    b.onclick = () => confirmDialog('Revoke purchase?', 'The user will lose access to this module (progress is kept).', () => save(Number(b.dataset.revoke), true));
  });
}

// ---------- router ----------
function render() {
  const views = { overview: renderOverview, modules: renderModules, users: renderUsers, analytics: renderAnalytics };
  (views[view] || renderOverview)().catch((err) => {
    if (err.status === 401 || err.status === 403) location.href = '/';
    else toast(err.message, 'error');
  });
}

(async function init() {
  try {
    const d = await api('/api/me');
    me = d.user;
    if (me.role !== 'admin') { location.href = '/'; return; }
    render();
  } catch {
    location.href = '/';
  }
})();
