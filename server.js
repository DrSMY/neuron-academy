'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { db, createUser, verifyPassword } = require('./db');
const { makeCertificatePdf } = require('./pdf');

const PORT = process.env.PORT || 4655;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// ---------- helpers ----------
function send(res, status, data, headers = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e6) { reject(new Error('body too large')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('invalid JSON')); }
    });
  });
}
function getCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}
function currentUser(req) {
  const token = getCookie(req, 'session');
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.id, u.name, u.email, u.role FROM sessions s
    JOIN users u ON u.id = s.user_id WHERE s.token = ?`).get(token);
  return row || null;
}
function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId);
  res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax`);
}

// ---------- learner domain logic ----------
function effectivePrice(userId, mod) {
  const s = db.prepare('SELECT custom_price, free_access FROM user_module_settings WHERE user_id = ? AND module_id = ?').get(userId, mod.id);
  if (s && s.free_access) return 0;
  if (s && s.custom_price !== null && s.custom_price !== undefined) return s.custom_price;
  return mod.base_price;
}
function isOwned(userId, moduleId) {
  const e = db.prepare('SELECT 1 AS x FROM enrollments WHERE user_id = ? AND module_id = ?').get(userId, moduleId);
  if (e) return true;
  const s = db.prepare('SELECT free_access FROM user_module_settings WHERE user_id = ? AND module_id = ?').get(userId, moduleId);
  return !!(s && s.free_access);
}
function isCompleted(userId, moduleId) {
  return !!db.prepare('SELECT 1 AS x FROM module_completions WHERE user_id = ? AND module_id = ?').get(userId, moduleId);
}
// Sequential rule: a module's CONTENT is open when it's the first published
// module, or the previous published module is completed, or admin set an override.
function isSequentiallyUnlocked(userId, mod, publishedModules) {
  const s = db.prepare('SELECT unlock_override FROM user_module_settings WHERE user_id = ? AND module_id = ?').get(userId, mod.id);
  if (s && s.unlock_override) return true;
  const idx = publishedModules.findIndex((m) => m.id === mod.id);
  if (idx <= 0) return idx === 0;
  return isCompleted(userId, publishedModules[idx - 1].id);
}
function moduleProgress(userId, moduleId) {
  const total = db.prepare('SELECT COUNT(*) AS c FROM lessons WHERE module_id = ?').get(moduleId).c;
  const done = db.prepare(`
    SELECT COUNT(*) AS c FROM lesson_progress lp
    JOIN lessons l ON l.id = lp.lesson_id
    WHERE lp.user_id = ? AND l.module_id = ?`).get(userId, moduleId).c;
  return { lessonsTotal: total, lessonsDone: done };
}
// Modules visible to learners: published module inside a published track + subject.
function publishedTrackModules(trackId) {
  return db.prepare(`
    SELECT m.* FROM modules m
    JOIN tracks t ON t.id = m.track_id AND t.published = 1
    JOIN subjects s ON s.id = t.subject_id AND s.published = 1
    WHERE m.published = 1 AND m.track_id = ?
    ORDER BY m.position, m.id`).all(trackId);
}

function moduleState(userId, m, trackModules) {
  const owned = isOwned(userId, m.id);
  const completed = isCompleted(userId, m.id);
  const unlocked = isSequentiallyUnlocked(userId, m, trackModules);
  const progress = moduleProgress(userId, m.id);
  const best = db.prepare('SELECT MAX(score) AS s FROM quiz_attempts WHERE user_id = ? AND module_id = ?').get(userId, m.id).s;
  let state = 'available';
  if (completed) state = 'completed';
  else if (owned && unlocked) state = 'ready';
  else if (owned && !unlocked) state = 'owned_locked';
  else if (!owned && !unlocked) state = 'locked';
  return {
    id: m.id, title: m.title, description: m.description, level: m.level,
    duration_mins: m.duration_mins, position: m.position, pass_percent: m.pass_percent,
    track_id: m.track_id, price: effectivePrice(userId, m), base_price: m.base_price,
    owned, completed, unlocked, state, bestScore: best, ...progress,
  };
}

// Nested catalog (subjects → tracks → modules) plus a flat module list.
function catalogFor(userId) {
  const subjects = db.prepare('SELECT * FROM subjects WHERE published = 1 ORDER BY position, id').all().map((s) => {
    const tracks = db.prepare('SELECT * FROM tracks WHERE subject_id = ? AND published = 1 ORDER BY position, id').all(s.id).map((t) => {
      const mods = publishedTrackModules(t.id).map((m, _i, arr) => moduleState(userId, m, arr));
      return {
        id: t.id, title: t.title, description: t.description,
        modules: mods,
        completed: mods.filter((m) => m.completed).length,
      };
    }).filter((t) => t.modules.length > 0 || true);
    return {
      id: s.id, title: s.title, description: s.description, tracks,
      moduleCount: tracks.reduce((n, t) => n + t.modules.length, 0),
      completed: tracks.reduce((n, t) => n + t.completed, 0),
      ownedCount: tracks.reduce((n, t) => n + t.modules.filter((m) => m.owned).length, 0),
    };
  });
  const modules = subjects.flatMap((s) => s.tracks.flatMap((t) => t.modules));
  return { subjects, modules };
}
function award(userId, type, xp, moduleId = null) {
  db.prepare('INSERT INTO activity_events (user_id, type, xp, module_id) VALUES (?, ?, ?, ?)').run(userId, type, xp, moduleId);
}

function checkModuleCompletion(userId, moduleId) {
  const { lessonsTotal, lessonsDone } = moduleProgress(userId, moduleId);
  const qTotal = db.prepare('SELECT COUNT(*) AS c FROM quiz_questions WHERE module_id = ?').get(moduleId).c;
  const passed = qTotal === 0 || !!db.prepare('SELECT 1 AS x FROM quiz_attempts WHERE user_id = ? AND module_id = ? AND passed = 1').get(userId, moduleId);
  if (lessonsTotal > 0 && lessonsDone >= lessonsTotal && passed) {
    const r = db.prepare('INSERT OR IGNORE INTO module_completions (user_id, module_id) VALUES (?, ?)').run(userId, moduleId);
    if (r.changes > 0) { award(userId, 'module_complete', 50, moduleId); issueCertificate(userId, moduleId); }
    return true;
  }
  return false;
}

// ---------- gamification ----------
// Level L starts at 50·L·(L+1) XP: 0, 100, 300, 600, 1000, …
function levelInfo(xp) {
  let level = 0;
  while (50 * (level + 1) * (level + 2) <= xp) level++;
  const floor = 50 * level * (level + 1);
  const ceil = 50 * (level + 1) * (level + 2);
  return { level: level + 1, xp, levelFloor: floor, levelCeil: ceil, levelProgress: Math.round(((xp - floor) / (ceil - floor)) * 100) };
}
function userXp(userId) {
  return db.prepare('SELECT COALESCE(SUM(xp), 0) AS s FROM activity_events WHERE user_id = ?').get(userId).s;
}
function userStreak(userId) {
  const days = new Set(db.prepare("SELECT DISTINCT day FROM activity_events WHERE user_id = ? AND day >= date('now','localtime','-400 days')").all(userId).map((r) => r.day));
  const dstr = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  // A streak survives until the end of today, so start counting at today or yesterday.
  let start = days.has(dstr(0)) ? 0 : days.has(dstr(1)) ? 1 : -1;
  if (start === -1) return { streak: 0, activeToday: false };
  let streak = 0;
  while (days.has(dstr(start + streak))) streak++;
  return { streak, activeToday: start === 0 };
}
function userBadges(userId) {
  const lessons = db.prepare('SELECT COUNT(*) AS c FROM lesson_progress WHERE user_id = ?').get(userId).c;
  const mods = db.prepare('SELECT COUNT(*) AS c FROM module_completions WHERE user_id = ?').get(userId).c;
  const perfect = db.prepare('SELECT COUNT(*) AS c FROM quiz_attempts WHERE user_id = ? AND score = 100').get(userId).c;
  const published = db.prepare('SELECT COUNT(*) AS c FROM modules WHERE published = 1').get().c;
  const done = db.prepare('SELECT COUNT(*) AS c FROM module_completions mc JOIN modules m ON m.id = mc.module_id AND m.published = 1 WHERE mc.user_id = ?').get(userId).c;
  const { streak } = userStreak(userId);
  const xp = userXp(userId);
  return [
    { id: 'first-steps', name: 'First Steps', desc: 'Complete your first lesson', icon: 'play', earned: lessons >= 1 },
    { id: 'sharpshooter', name: 'Sharpshooter', desc: 'Score 100% on a quiz', icon: 'sparkle', earned: perfect >= 1 },
    { id: 'module-master', name: 'Module Master', desc: 'Complete a module', icon: 'trophy', earned: mods >= 1 },
    { id: 'streak-3', name: 'On Fire', desc: 'Learn 3 days in a row', icon: 'flame', earned: streak >= 3 },
    { id: 'streak-7', name: 'Unstoppable', desc: 'Learn 7 days in a row', icon: 'flame', earned: streak >= 7 },
    { id: 'xp-500', name: 'Rising Mind', desc: 'Earn 500 XP', icon: 'zap', earned: xp >= 500 },
    { id: 'path-complete', name: 'Neural Navigator', desc: 'Finish every module', icon: 'logo', earned: published > 0 && done >= published },
  ];
}
function resumeTarget(userId) {
  const tracks = db.prepare(`
    SELECT t.id FROM tracks t JOIN subjects s ON s.id = t.subject_id
    WHERE t.published = 1 AND s.published = 1 ORDER BY s.position, s.id, t.position, t.id`).all();
  const candidates = tracks.flatMap((t) => {
    const mods = publishedTrackModules(t.id);
    return mods.map((m) => ({ m, mods }));
  });
  for (const { m, mods } of candidates) {
    if (!isOwned(userId, m.id) || isCompleted(userId, m.id) || !isSequentiallyUnlocked(userId, m, mods)) continue;
    const lessons = db.prepare('SELECT id, title, position FROM lessons WHERE module_id = ? ORDER BY position, id').all(m.id);
    const doneSet = new Set(db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE module_id = ?)').all(userId, m.id).map((r) => r.lesson_id));
    let idx = lessons.findIndex((l) => !doneSet.has(l.id));
    let label;
    if (idx === -1) { idx = lessons.length; label = 'Final quiz'; } else label = lessons[idx].title;
    const { lessonsTotal, lessonsDone } = moduleProgress(userId, m.id);
    return {
      module_id: m.id, module_title: m.title, level: m.level,
      lesson_idx: idx, lesson_label: label,
      pct: lessonsTotal ? Math.round((lessonsDone / lessonsTotal) * 100) : 0,
      lessonsDone, lessonsTotal,
    };
  }
  return null;
}

function issueCertificate(userId, moduleId) {
  const existing = db.prepare('SELECT code FROM certificates WHERE user_id = ? AND module_id = ?').get(userId, moduleId);
  if (existing) return existing.code;
  const code = 'NA-' + crypto.randomBytes(5).toString('hex').toUpperCase();
  db.prepare('INSERT INTO certificates (user_id, module_id, code) VALUES (?, ?, ?)').run(userId, moduleId, code);
  return code;
}

// SM-2-lite spaced repetition scheduling.
function scheduleReview(state, grade) {
  let { ease, interval_days: interval } = state;
  if (grade === 'again') { interval = 0; ease = Math.max(1.3, ease - 0.2); }
  else if (grade === 'hard') { interval = Math.max(1, interval * 1.2); ease = Math.max(1.3, ease - 0.15); }
  else if (grade === 'good') { interval = interval === 0 ? 1 : interval * ease; }
  else { interval = interval === 0 ? 2 : interval * ease * 1.3; ease = Math.min(3.2, ease + 0.15); }
  return { ease, interval: Math.round(interval * 10) / 10 };
}

// ---------- routing ----------
const routes = [];
function route(method, pattern, handler, opts = {}) {
  const keys = [];
  const rx = new RegExp('^' + pattern.replace(/:([a-z]+)/g, (_, k) => { keys.push(k); return k === 'code' ? '([A-Za-z0-9-]+)' : '(\\d+)'; }) + '$');
  routes.push({ method, rx, keys, handler, ...opts });
}

// ----- auth -----
route('POST', '/api/signup', async (req, res) => {
  const { name, email, password } = await readBody(req);
  if (!name || !email || !password) return send(res, 400, { error: 'Name, email and password are required.' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return send(res, 400, { error: 'Please enter a valid email address.' });
  if (password.length < 6) return send(res, 400, { error: 'Password must be at least 6 characters.' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return send(res, 409, { error: 'An account with this email already exists.' });
  const id = createUser(name.trim(), email.trim(), password, 'learner');
  startSession(res, id);
  send(res, 200, { ok: true });
});
route('POST', '/api/login', async (req, res) => {
  const { email, password } = await readBody(req);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email || '');
  if (!user || !verifyPassword(user, password || '')) return send(res, 401, { error: 'Incorrect email or password.' });
  startSession(res, user.id);
  send(res, 200, { ok: true });
});
route('POST', '/api/logout', async (req, res) => {
  const token = getCookie(req, 'session');
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
  send(res, 200, { ok: true });
});
route('GET', '/api/me', async (req, res, _p, user) => {
  const { streak, activeToday } = userStreak(user.id);
  send(res, 200, { user, streak, activeToday, dueReviews: dueReviewCards(user.id).length, ...levelInfo(userXp(user.id)) });
}, { auth: true });

route('GET', '/api/dashboard', async (req, res, _p, user) => {
  const { streak, activeToday } = userStreak(user.id);
  const heat = db.prepare("SELECT day, COUNT(*) AS n, SUM(xp) AS xp FROM activity_events WHERE user_id = ? AND day >= date('now','localtime','-139 days') GROUP BY day").all(user.id);
  const owned = db.prepare(`
    SELECT COUNT(*) AS c FROM (
      SELECT module_id FROM enrollments WHERE user_id = ?
      UNION
      SELECT module_id FROM user_module_settings WHERE user_id = ? AND free_access = 1
    )`).get(user.id, user.id).c;
  const completed = db.prepare('SELECT COUNT(*) AS c FROM module_completions WHERE user_id = ?').get(user.id).c;
  const lessonsDone = db.prepare('SELECT COUNT(*) AS c FROM lesson_progress WHERE user_id = ?').get(user.id).c;
  send(res, 200, {
    streak, activeToday, ...levelInfo(userXp(user.id)),
    heatmap: heat, badges: userBadges(user.id), resume: resumeTarget(user.id),
    stats: { owned, completed, lessonsDone },
  });
}, { auth: true });

// ----- learner -----
route('GET', '/api/catalog', async (req, res, _p, user) => {
  send(res, 200, catalogFor(user.id));
}, { auth: true });

route('GET', '/api/module/:id', async (req, res, p, user) => {
  const mod = db.prepare('SELECT * FROM modules WHERE id = ? AND published = 1').get(p.id);
  if (!mod) return send(res, 404, { error: 'Module not found.' });
  const trackMods = publishedTrackModules(mod.track_id);
  if (!trackMods.some((m) => m.id === mod.id)) return send(res, 404, { error: 'Module not found.' });
  if (!isOwned(user.id, mod.id)) return send(res, 403, { error: 'You have not purchased this module yet.', reason: 'not_owned' });
  if (!isSequentiallyUnlocked(user.id, mod, trackMods)) return send(res, 403, { error: 'Complete the previous module in this track to unlock this one.', reason: 'sequential' });
  const lessons = db.prepare('SELECT id, title, blocks_json, position FROM lessons WHERE module_id = ? ORDER BY position, id').all(mod.id);
  const doneRows = db.prepare(`SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE module_id = ?)`).all(user.id, mod.id);
  const doneSet = new Set(doneRows.map((r) => r.lesson_id));
  // Question bank: draw quiz_draw random questions (0 = all) and shuffle
  // options. Each option keeps its original index `k` so scoring is stable.
  const bankSize = db.prepare('SELECT COUNT(*) AS c FROM quiz_questions WHERE module_id = ?').get(mod.id).c;
  const drawN = mod.quiz_draw > 0 ? Math.min(mod.quiz_draw, bankSize) : bankSize;
  const questions = db.prepare('SELECT id, question, options_json FROM quiz_questions WHERE module_id = ? ORDER BY RANDOM() LIMIT ?').all(mod.id, drawN)
    .map((q) => {
      const opts = JSON.parse(q.options_json).map((text, k) => ({ k, text }));
      for (let i = opts.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      return { id: q.id, question: q.question, options: opts };
    });
  const best = db.prepare('SELECT MAX(score) AS s FROM quiz_attempts WHERE user_id = ? AND module_id = ?').get(user.id, mod.id).s;
  send(res, 200, {
    module: {
      id: mod.id, title: mod.title, description: mod.description, level: mod.level,
      duration_mins: mod.duration_mins, pass_percent: mod.pass_percent,
      completed: isCompleted(user.id, mod.id), bestScore: best,
      lessons: lessons.map((l) => ({ id: l.id, title: l.title, position: l.position, blocks: JSON.parse(l.blocks_json || '[]'), done: doneSet.has(l.id) })),
      quiz: questions, quiz_bank_size: bankSize,
    },
  });
}, { auth: true });

route('POST', '/api/module/:id/purchase', async (req, res, p, user) => {
  const mod = db.prepare('SELECT * FROM modules WHERE id = ? AND published = 1').get(p.id);
  if (!mod || !publishedTrackModules(mod.track_id).some((m) => m.id === mod.id)) return send(res, 404, { error: 'Module not found.' });
  if (isOwned(user.id, mod.id)) return send(res, 409, { error: 'You already own this module.' });
  const { cardNumber, cardName, expiry, cvc } = await readBody(req);
  const price = effectivePrice(user.id, mod);
  if (price > 0) {
    if (!cardName || !/^[\d\s]{12,23}$/.test(cardNumber || '')) return send(res, 400, { error: 'Please enter a valid card number and name.' });
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(expiry || '')) return send(res, 400, { error: 'Expiry must be in MM/YY format.' });
    if (!/^\d{3,4}$/.test(cvc || '')) return send(res, 400, { error: 'CVC must be 3 or 4 digits.' });
  }
  const txn = 'SIM-' + crypto.randomBytes(5).toString('hex').toUpperCase();
  db.prepare('INSERT INTO enrollments (user_id, module_id, price_paid, txn_id) VALUES (?, ?, ?, ?)').run(user.id, mod.id, price, txn);
  send(res, 200, { ok: true, txn_id: txn, price_paid: price });
}, { auth: true });

route('POST', '/api/lesson/:id/complete', async (req, res, p, user) => {
  const lesson = db.prepare('SELECT l.*, m.published FROM lessons l JOIN modules m ON m.id = l.module_id WHERE l.id = ?').get(p.id);
  if (!lesson || !lesson.published) return send(res, 404, { error: 'Lesson not found.' });
  if (!isOwned(user.id, lesson.module_id)) return send(res, 403, { error: 'Not enrolled in this module.' });
  const r = db.prepare('INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id) VALUES (?, ?)').run(user.id, p.id);
  let xpGained = 0;
  if (r.changes > 0) { award(user.id, 'lesson_complete', 10, lesson.module_id); xpGained = 10; }
  const completedModule = checkModuleCompletion(user.id, lesson.module_id);
  send(res, 200, { ok: true, moduleCompleted: completedModule, xpGained, firstTime: r.changes > 0 });
}, { auth: true });

route('POST', '/api/module/:id/quiz', async (req, res, p, user) => {
  const mod = db.prepare('SELECT * FROM modules WHERE id = ? AND published = 1').get(p.id);
  if (!mod) return send(res, 404, { error: 'Module not found.' });
  if (!isOwned(user.id, mod.id)) return send(res, 403, { error: 'Not enrolled in this module.' });
  const { answers } = await readBody(req); // { questionId: original option index }
  const bank = db.prepare('SELECT id, correct_index FROM quiz_questions WHERE module_id = ?').all(mod.id);
  if (bank.length === 0) return send(res, 400, { error: 'This module has no quiz.' });
  const byId = new Map(bank.map((q) => [q.id, q]));
  const answeredIds = Object.keys(answers || {}).map(Number).filter((id) => byId.has(id));
  const expected = mod.quiz_draw > 0 ? Math.min(mod.quiz_draw, bank.length) : bank.length;
  if (answeredIds.length < expected) return send(res, 400, { error: 'Please answer every question first.' });
  let correct = 0;
  const detail = answeredIds.map((id) => {
    const q = byId.get(id);
    const ok = answers[id] === q.correct_index;
    if (ok) correct++;
    return { id, correct: ok, correct_index: q.correct_index };
  });
  const score = Math.round((correct / answeredIds.length) * 100);
  const passed = score >= mod.pass_percent ? 1 : 0;
  const priorPass = !!db.prepare('SELECT 1 AS x FROM quiz_attempts WHERE user_id = ? AND module_id = ? AND passed = 1').get(user.id, mod.id);
  db.prepare('INSERT INTO quiz_attempts (user_id, module_id, score, passed, answers_json) VALUES (?, ?, ?, ?, ?)')
    .run(user.id, mod.id, score, passed, JSON.stringify(answers));
  let xpGained = 0;
  if (passed && !priorPass) { award(user.id, 'quiz_pass', 30, mod.id); xpGained = 30; }
  const completedModule = passed ? checkModuleCompletion(user.id, mod.id) : false;
  const nextModule = completedModule ? (() => {
    const mods = publishedTrackModules(mod.track_id);
    const i = mods.findIndex((m) => m.id === mod.id);
    return i >= 0 && mods[i + 1] ? { id: mods[i + 1].id, title: mods[i + 1].title } : null;
  })() : null;
  send(res, 200, { score, passed: !!passed, pass_percent: mod.pass_percent, detail, moduleCompleted: completedModule, xpGained, nextModule });
}, { auth: true });

// ----- flashcard review -----
function ownedModuleIds(userId) {
  return db.prepare(`
    SELECT m.id FROM modules m WHERE m.published = 1 AND (
      EXISTS (SELECT 1 FROM enrollments e WHERE e.user_id = ? AND e.module_id = m.id)
      OR EXISTS (SELECT 1 FROM user_module_settings s WHERE s.user_id = ? AND s.module_id = m.id AND s.free_access = 1)
    )`).all(userId, userId).map((r) => r.id);
}
function dueReviewCards(userId) {
  const mods = ownedModuleIds(userId);
  if (!mods.length) return [];
  return db.prepare(`
    SELECT f.id, f.front, f.back, m.title AS module_title,
           cr.ease, cr.interval_days, cr.due, cr.reviews
    FROM flashcards f
    JOIN modules m ON m.id = f.module_id
    LEFT JOIN card_reviews cr ON cr.card_id = f.id AND cr.user_id = ?
    WHERE f.module_id IN (${mods.map(() => '?').join(',')})
      AND (cr.due IS NULL OR cr.due <= date('now','localtime'))
    ORDER BY cr.due IS NULL, cr.due, f.module_id, f.position
    LIMIT 20`).all(userId, ...mods);
}

route('GET', '/api/review/queue', async (req, res, _p, user) => {
  send(res, 200, { cards: dueReviewCards(user.id) });
}, { auth: true });

route('POST', '/api/review/:id', async (req, res, p, user) => {
  const { grade } = await readBody(req);
  if (!['again', 'hard', 'good', 'easy'].includes(grade)) return send(res, 400, { error: 'Invalid grade.' });
  const card = db.prepare('SELECT id, module_id FROM flashcards WHERE id = ?').get(p.id);
  if (!card) return send(res, 404, { error: 'Card not found.' });
  const state = db.prepare('SELECT ease, interval_days, reviewed_at FROM card_reviews WHERE user_id = ? AND card_id = ?').get(user.id, p.id)
    || { ease: 2.5, interval_days: 0, reviewed_at: null };
  const { ease, interval } = scheduleReview(state, grade);
  db.prepare(`
    INSERT INTO card_reviews (user_id, card_id, ease, interval_days, due, reviews, reviewed_at)
    VALUES (?, ?, ?, ?, date('now','localtime', ?), 1, datetime('now'))
    ON CONFLICT(user_id, card_id) DO UPDATE SET ease = excluded.ease, interval_days = excluded.interval_days,
      due = excluded.due, reviews = reviews + 1, reviewed_at = excluded.reviewed_at`)
    .run(user.id, p.id, ease, interval, `+${Math.max(0, Math.round(interval))} days`);
  const firstToday = !state.reviewed_at || state.reviewed_at.slice(0, 10) !== new Date().toISOString().slice(0, 10);
  if (firstToday) award(user.id, 'review', 2, card.module_id);
  send(res, 200, { ok: true, nextDueDays: Math.round(interval) });
}, { auth: true });

// ----- notes & highlights -----
route('GET', '/api/lesson/:id/notes', async (req, res, p, user) => {
  const notes = db.prepare('SELECT id, kind, content, created_at FROM notes WHERE user_id = ? AND lesson_id = ? ORDER BY id DESC').all(user.id, p.id);
  send(res, 200, { notes });
}, { auth: true });

route('POST', '/api/lesson/:id/notes', async (req, res, p, user) => {
  const { kind, content } = await readBody(req);
  if (!content || !content.trim()) return send(res, 400, { error: 'The note is empty.' });
  if (!['note', 'highlight'].includes(kind)) return send(res, 400, { error: 'Invalid kind.' });
  const r = db.prepare('INSERT INTO notes (user_id, lesson_id, kind, content) VALUES (?, ?, ?, ?)').run(user.id, p.id, kind, content.trim());
  send(res, 200, { id: Number(r.lastInsertRowid) });
}, { auth: true });

route('DELETE', '/api/notes/:id', async (req, res, p, user) => {
  db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(p.id, user.id);
  send(res, 200, { ok: true });
}, { auth: true });

// ----- certificates -----
route('GET', '/api/certificate/:id', async (req, res, p, user) => {
  const mod = db.prepare('SELECT * FROM modules WHERE id = ?').get(p.id);
  if (!mod) return send(res, 404, { error: 'Module not found.' });
  const done = db.prepare('SELECT completed_at FROM module_completions WHERE user_id = ? AND module_id = ?').get(user.id, p.id);
  if (!done) return send(res, 403, { error: 'Complete the module to earn its certificate.' });
  const code = issueCertificate(user.id, p.id);
  const pdf = makeCertificatePdf({
    name: user.name,
    moduleTitle: mod.title,
    date: new Date(done.completed_at + 'Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    code,
    verifyUrl: `http://localhost:${PORT}/verify.html?code=${code}`,
  });
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="neuron-academy-certificate-${code}.pdf"`,
    'Content-Length': pdf.length,
  });
  res.end(pdf);
}, { auth: true });

route('GET', '/api/verify/:code', async (req, res, p) => {
  const cert = db.prepare(`
    SELECT c.code, c.issued_at, u.name, m.title FROM certificates c
    JOIN users u ON u.id = c.user_id JOIN modules m ON m.id = c.module_id
    WHERE c.code = ?`).get(p.code.toUpperCase());
  if (!cert) return send(res, 404, { valid: false, error: 'No certificate with this code.' });
  send(res, 200, { valid: true, name: cert.name, module: cert.title, issued_at: cert.issued_at, code: cert.code });
});

// ----- command palette -----
route('GET', '/api/palette', async (req, res, _p, user) => {
  const { subjects, modules } = catalogFor(user.id);
  const items = [];
  for (const s of subjects) items.push({ type: 'subject', id: s.id, title: s.title });
  for (const m of modules) {
    items.push({ type: 'module', id: m.id, title: m.title, owned: m.owned });
    if (m.owned) {
      db.prepare('SELECT title, position FROM lessons WHERE module_id = ? ORDER BY position, id').all(m.id)
        .forEach((l, i) => items.push({ type: 'lesson', module_id: m.id, idx: i, title: l.title, module_title: m.title }));
    }
  }
  send(res, 200, { items });
}, { auth: true });

// ----- AI tutor (extension point) -----
// Wiring in Claude later should only touch this route: read the key, call the
// API with the lesson context, and return { configured: true, reply }.
route('POST', '/api/tutor', async (req, res, _p, user) => {
  const { message } = await readBody(req);
  if (!message || !message.trim()) return send(res, 400, { error: 'Ask the tutor something first.' });
  if (!process.env.ANTHROPIC_API_KEY) {
    return send(res, 200, {
      configured: false,
      reply: 'The AI tutor is not configured yet. Once the platform admin adds an Anthropic API key, I will be able to answer questions about this lesson.',
    });
  }
  // TODO(tutor): call Claude here with the lesson context + message.
  send(res, 200, { configured: true, reply: 'Tutor backend is configured but not yet wired to a model.' });
}, { auth: true });

// ----- admin -----
route('GET', '/api/admin/overview', async (req, res, _p, user) => {
  const learners = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'learner'").get().c;
  const modules = db.prepare('SELECT COUNT(*) AS c FROM modules').get().c;
  const published = db.prepare('SELECT COUNT(*) AS c FROM modules WHERE published = 1').get().c;
  const enrollments = db.prepare('SELECT COUNT(*) AS c FROM enrollments').get().c;
  const revenue = db.prepare('SELECT COALESCE(SUM(price_paid), 0) AS s FROM enrollments').get().s;
  const completions = db.prepare('SELECT COUNT(*) AS c FROM module_completions').get().c;
  const recent = db.prepare(`
    SELECT e.purchased_at, e.price_paid, e.txn_id, u.name AS user_name, m.title AS module_title
    FROM enrollments e JOIN users u ON u.id = e.user_id JOIN modules m ON m.id = e.module_id
    ORDER BY e.purchased_at DESC LIMIT 8`).all();
  send(res, 200, { learners, modules, published, enrollments, revenue, completions, recent });
}, { admin: true });

// ----- catalog structure (subjects & tracks) -----
route('GET', '/api/admin/structure', async (req, res) => {
  const subjects = db.prepare('SELECT * FROM subjects ORDER BY position, id').all().map((s) => ({
    ...s,
    tracks: db.prepare(`
      SELECT t.*, (SELECT COUNT(*) FROM modules WHERE track_id = t.id) AS module_count
      FROM tracks t WHERE t.subject_id = ? ORDER BY t.position, t.id`).all(s.id),
  }));
  send(res, 200, { subjects });
}, { admin: true });

route('POST', '/api/admin/subjects', async (req, res) => {
  const b = await readBody(req);
  if (!b.title || !b.title.trim()) return send(res, 400, { error: 'The subject needs a title.' });
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), 0) AS m FROM subjects').get().m;
  const r = db.prepare('INSERT INTO subjects (title, description, position, published) VALUES (?,?,?,?)')
    .run(b.title.trim(), b.description || '', maxPos + 1, b.published ? 1 : 0);
  send(res, 200, { id: Number(r.lastInsertRowid) });
}, { admin: true });

route('PUT', '/api/admin/subjects/:id', async (req, res, p) => {
  const b = await readBody(req);
  if (!b.title || !b.title.trim()) return send(res, 400, { error: 'The subject needs a title.' });
  db.prepare('UPDATE subjects SET title = ?, description = ?, position = ?, published = ? WHERE id = ?')
    .run(b.title.trim(), b.description || '', b.position || 0, b.published ? 1 : 0, p.id);
  send(res, 200, { ok: true });
}, { admin: true });

route('DELETE', '/api/admin/subjects/:id', async (req, res, p) => {
  const mods = db.prepare('SELECT COUNT(*) AS c FROM modules m JOIN tracks t ON t.id = m.track_id WHERE t.subject_id = ?').get(p.id).c;
  if (mods > 0) return send(res, 409, { error: `This subject still contains ${mods} module${mods === 1 ? '' : 's'}. Move or delete them first.` });
  db.prepare('DELETE FROM subjects WHERE id = ?').run(p.id);
  send(res, 200, { ok: true });
}, { admin: true });

route('POST', '/api/admin/tracks', async (req, res) => {
  const b = await readBody(req);
  if (!b.title || !b.title.trim()) return send(res, 400, { error: 'The track needs a title.' });
  const subject = db.prepare('SELECT id FROM subjects WHERE id = ?').get(b.subject_id || 0);
  if (!subject) return send(res, 400, { error: 'Pick a subject for this track.' });
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), 0) AS m FROM tracks WHERE subject_id = ?').get(subject.id).m;
  const r = db.prepare('INSERT INTO tracks (subject_id, title, description, position, published) VALUES (?,?,?,?,?)')
    .run(subject.id, b.title.trim(), b.description || '', maxPos + 1, b.published ? 1 : 0);
  send(res, 200, { id: Number(r.lastInsertRowid) });
}, { admin: true });

route('PUT', '/api/admin/tracks/:id', async (req, res, p) => {
  const b = await readBody(req);
  if (!b.title || !b.title.trim()) return send(res, 400, { error: 'The track needs a title.' });
  db.prepare('UPDATE tracks SET title = ?, description = ?, position = ?, published = ?, subject_id = COALESCE(?, subject_id) WHERE id = ?')
    .run(b.title.trim(), b.description || '', b.position || 0, b.published ? 1 : 0, b.subject_id || null, p.id);
  send(res, 200, { ok: true });
}, { admin: true });

route('DELETE', '/api/admin/tracks/:id', async (req, res, p) => {
  const mods = db.prepare('SELECT COUNT(*) AS c FROM modules WHERE track_id = ?').get(p.id).c;
  if (mods > 0) return send(res, 409, { error: `This track still contains ${mods} module${mods === 1 ? '' : 's'}. Move or delete them first.` });
  db.prepare('DELETE FROM tracks WHERE id = ?').run(p.id);
  send(res, 200, { ok: true });
}, { admin: true });

route('GET', '/api/admin/modules', async (req, res) => {
  const mods = db.prepare(`
    SELECT m.*, t.title AS track_title, s.title AS subject_title,
           (SELECT COUNT(*) FROM lessons WHERE module_id = m.id) AS lesson_count,
           (SELECT COUNT(*) FROM quiz_questions WHERE module_id = m.id) AS question_count,
           (SELECT COUNT(*) FROM enrollments WHERE module_id = m.id) AS enrollment_count
    FROM modules m
    LEFT JOIN tracks t ON t.id = m.track_id
    LEFT JOIN subjects s ON s.id = t.subject_id
    ORDER BY s.position, s.id, t.position, t.id, m.position, m.id`).all();
  send(res, 200, { modules: mods });
}, { admin: true });

route('POST', '/api/admin/modules', async (req, res) => {
  const b = await readBody(req);
  if (!b.title) return send(res, 400, { error: 'Title is required.' });
  const track = db.prepare('SELECT id FROM tracks WHERE id = ?').get(b.track_id || 0);
  if (!track) return send(res, 400, { error: 'Pick a track for this module.' });
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), 0) AS m FROM modules WHERE track_id = ?').get(track.id).m;
  const r = db.prepare('INSERT INTO modules (title, description, level, duration_mins, base_price, position, published, pass_percent, quiz_draw, track_id) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(b.title, b.description || '', b.level || 'Beginner', b.duration_mins || 60, b.base_price || 0, maxPos + 1, b.published ? 1 : 0, b.pass_percent || 70, b.quiz_draw || 0, track.id);
  send(res, 200, { id: Number(r.lastInsertRowid) });
}, { admin: true });

route('PUT', '/api/admin/modules/:id', async (req, res, p) => {
  const b = await readBody(req);
  const mod = db.prepare('SELECT id FROM modules WHERE id = ?').get(p.id);
  if (!mod) return send(res, 404, { error: 'Module not found.' });
  db.prepare('UPDATE modules SET title = ?, description = ?, level = ?, duration_mins = ?, base_price = ?, position = ?, published = ?, pass_percent = ?, quiz_draw = ?, track_id = COALESCE(?, track_id) WHERE id = ?')
    .run(b.title, b.description || '', b.level || 'Beginner', b.duration_mins || 60, b.base_price || 0, b.position || 0, b.published ? 1 : 0, b.pass_percent || 70, b.quiz_draw || 0, b.track_id || null, p.id);
  send(res, 200, { ok: true });
}, { admin: true });

route('DELETE', '/api/admin/modules/:id', async (req, res, p) => {
  db.prepare('DELETE FROM modules WHERE id = ?').run(p.id);
  send(res, 200, { ok: true });
}, { admin: true });

route('GET', '/api/admin/modules/:id/content', async (req, res, p) => {
  const mod = db.prepare('SELECT * FROM modules WHERE id = ?').get(p.id);
  if (!mod) return send(res, 404, { error: 'Module not found.' });
  const lessons = db.prepare('SELECT id, module_id, title, blocks_json, position FROM lessons WHERE module_id = ? ORDER BY position, id').all(p.id)
    .map((l) => ({ id: l.id, module_id: l.module_id, title: l.title, position: l.position, blocks: JSON.parse(l.blocks_json || '[]') }));
  const questions = db.prepare('SELECT * FROM quiz_questions WHERE module_id = ? ORDER BY position, id').all(p.id)
    .map((q) => ({ ...q, options: JSON.parse(q.options_json) }));
  const cards = db.prepare('SELECT id, front, back, source FROM flashcards WHERE module_id = ? ORDER BY position, id').all(p.id);
  send(res, 200, { module: mod, lessons, questions, cards });
}, { admin: true });

const BLOCK_TYPES = new Set(['text', 'video', 'code', 'order', 'match', 'blank']);
function validateBlocks(blocks) {
  if (!Array.isArray(blocks)) return 'blocks must be an array.';
  for (const bl of blocks) {
    if (!bl || !BLOCK_TYPES.has(bl.type)) return `Unknown block type "${bl && bl.type}".`;
    if (bl.type === 'order' && (!Array.isArray(bl.items) || bl.items.length < 2)) return 'Ordering blocks need at least 2 items.';
    if (bl.type === 'match' && (!Array.isArray(bl.pairs) || bl.pairs.length < 2)) return 'Matching blocks need at least 2 pairs.';
    if (bl.type === 'blank' && !/\{\{.+?\}\}/.test(bl.text || '')) return 'Fill-in-the-blank blocks need at least one {{answer}} placeholder.';
  }
  return null;
}

route('POST', '/api/admin/modules/:id/lessons', async (req, res, p) => {
  const b = await readBody(req);
  if (!b.title) return send(res, 400, { error: 'Lesson title is required.' });
  const err = validateBlocks(b.blocks || []);
  if (err) return send(res, 400, { error: err });
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), 0) AS m FROM lessons WHERE module_id = ?').get(p.id).m;
  const r = db.prepare('INSERT INTO lessons (module_id, title, blocks_json, position) VALUES (?,?,?,?)')
    .run(p.id, b.title, JSON.stringify(b.blocks || []), maxPos + 1);
  send(res, 200, { id: Number(r.lastInsertRowid) });
}, { admin: true });

route('PUT', '/api/admin/lessons/:id', async (req, res, p) => {
  const b = await readBody(req);
  const err = validateBlocks(b.blocks || []);
  if (err) return send(res, 400, { error: err });
  db.prepare('UPDATE lessons SET title = ?, blocks_json = ?, position = ? WHERE id = ?')
    .run(b.title, JSON.stringify(b.blocks || []), b.position || 0, p.id);
  send(res, 200, { ok: true });
}, { admin: true });

route('DELETE', '/api/admin/lessons/:id', async (req, res, p) => {
  db.prepare('DELETE FROM lessons WHERE id = ?').run(p.id);
  send(res, 200, { ok: true });
}, { admin: true });

route('PUT', '/api/admin/modules/:id/quiz', async (req, res, p) => {
  const { questions } = await readBody(req);
  if (!Array.isArray(questions)) return send(res, 400, { error: 'questions must be an array.' });
  for (const q of questions) {
    if (!q.question || !Array.isArray(q.options) || q.options.length < 2) return send(res, 400, { error: 'Each question needs text and at least 2 options.' });
    if (typeof q.correct_index !== 'number' || q.correct_index < 0 || q.correct_index >= q.options.length) return send(res, 400, { error: 'Each question needs a valid correct answer.' });
  }
  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM quiz_questions WHERE module_id = ?').run(p.id);
    const ins = db.prepare('INSERT INTO quiz_questions (module_id, question, options_json, correct_index, position) VALUES (?,?,?,?,?)');
    questions.forEach((q, i) => ins.run(p.id, q.question, JSON.stringify(q.options), q.correct_index, i + 1));
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  send(res, 200, { ok: true });
}, { admin: true });

route('GET', '/api/admin/analytics', async (req, res) => {
  const mods = db.prepare('SELECT id, title, position FROM modules ORDER BY position, id').all();
  const analytics = mods.map((m) => {
    const enrolled = db.prepare(`
      SELECT COUNT(*) AS c FROM (
        SELECT user_id FROM enrollments WHERE module_id = ?
        UNION SELECT user_id FROM user_module_settings WHERE module_id = ? AND free_access = 1)`).get(m.id, m.id).c;
    const started = db.prepare(`
      SELECT COUNT(DISTINCT lp.user_id) AS c FROM lesson_progress lp
      JOIN lessons l ON l.id = lp.lesson_id WHERE l.module_id = ?`).get(m.id).c;
    const passedQuiz = db.prepare('SELECT COUNT(DISTINCT user_id) AS c FROM quiz_attempts WHERE module_id = ? AND passed = 1').get(m.id).c;
    const completed = db.prepare('SELECT COUNT(*) AS c FROM module_completions WHERE module_id = ?').get(m.id).c;
    const lessons = db.prepare(`
      SELECT l.id, l.title, l.position,
        (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.lesson_id = l.id) AS done_by
      FROM lessons l WHERE l.module_id = ? ORDER BY l.position, l.id`).all(m.id);
    // quiz item analysis from stored answer maps
    const questions = db.prepare('SELECT id, question, options_json, correct_index FROM quiz_questions WHERE module_id = ? ORDER BY position, id').all(m.id)
      .map((q) => ({ ...q, options: JSON.parse(q.options_json), shown: 0, correct: 0, wrongPicks: {} }));
    const byId = new Map(questions.map((q) => [q.id, q]));
    for (const at of db.prepare('SELECT answers_json FROM quiz_attempts WHERE module_id = ? AND answers_json IS NOT NULL').all(m.id)) {
      let ans;
      try { ans = JSON.parse(at.answers_json); } catch { continue; }
      for (const [qid, given] of Object.entries(ans)) {
        const q = byId.get(Number(qid));
        if (!q) continue;
        q.shown++;
        if (given === q.correct_index) q.correct++;
        else q.wrongPicks[given] = (q.wrongPicks[given] || 0) + 1;
      }
    }
    const items = questions.map((q) => {
      const worstWrong = Object.entries(q.wrongPicks).sort((a, b) => b[1] - a[1])[0];
      return {
        id: q.id, question: q.question, shown: q.shown,
        pctCorrect: q.shown ? Math.round((q.correct / q.shown) * 100) : null,
        topWrong: worstWrong ? q.options[Number(worstWrong[0])] : null,
      };
    });
    return { module_id: m.id, title: m.title, funnel: { enrolled, started, passedQuiz, completed }, lessons, items };
  });
  send(res, 200, { analytics });
}, { admin: true });

route('POST', '/api/admin/modules/:id/cards', async (req, res, p) => {
  const { front, back } = await readBody(req);
  if (!front || !back) return send(res, 400, { error: 'A card needs both a front and a back.' });
  const maxPos = db.prepare('SELECT COALESCE(MAX(position), 0) AS m FROM flashcards WHERE module_id = ?').get(p.id).m;
  const r = db.prepare("INSERT INTO flashcards (module_id, front, back, source, position) VALUES (?, ?, ?, 'authored', ?)").run(p.id, front.trim(), back.trim(), maxPos + 1);
  send(res, 200, { id: Number(r.lastInsertRowid) });
}, { admin: true });

route('DELETE', '/api/admin/cards/:id', async (req, res, p) => {
  db.prepare('DELETE FROM flashcards WHERE id = ?').run(p.id);
  send(res, 200, { ok: true });
}, { admin: true });

route('GET', '/api/admin/users', async (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.created_at,
      (SELECT COUNT(*) FROM enrollments WHERE user_id = u.id) AS owned_count,
      (SELECT COUNT(*) FROM module_completions WHERE user_id = u.id) AS completed_count,
      (SELECT COALESCE(SUM(price_paid), 0) FROM enrollments WHERE user_id = u.id) AS spent
    FROM users u ORDER BY u.created_at DESC`).all();
  send(res, 200, { users });
}, { admin: true });

route('GET', '/api/admin/users/:id', async (req, res, p) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(p.id);
  if (!user) return send(res, 404, { error: 'User not found.' });
  const mods = db.prepare('SELECT * FROM modules ORDER BY position, id').all();
  const rows = mods.map((m) => {
    const s = db.prepare('SELECT * FROM user_module_settings WHERE user_id = ? AND module_id = ?').get(p.id, m.id);
    const e = db.prepare('SELECT * FROM enrollments WHERE user_id = ? AND module_id = ?').get(p.id, m.id);
    return {
      module_id: m.id, title: m.title, base_price: m.base_price, published: m.published,
      custom_price: s ? s.custom_price : null,
      free_access: !!(s && s.free_access),
      unlock_override: !!(s && s.unlock_override),
      purchased: !!e, price_paid: e ? e.price_paid : null,
      completed: isCompleted(Number(p.id), m.id),
    };
  });
  send(res, 200, { user, modules: rows });
}, { admin: true });

route('PUT', '/api/admin/users/:id/modules/:mid', async (req, res, p) => {
  const b = await readBody(req);
  const custom = (b.custom_price === '' || b.custom_price === null || b.custom_price === undefined) ? null : Number(b.custom_price);
  if (custom !== null && (Number.isNaN(custom) || custom < 0)) return send(res, 400, { error: 'Custom price must be a positive number.' });
  db.prepare(`
    INSERT INTO user_module_settings (user_id, module_id, custom_price, free_access, unlock_override)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, module_id) DO UPDATE SET custom_price = excluded.custom_price,
      free_access = excluded.free_access, unlock_override = excluded.unlock_override`)
    .run(p.id, p.mid, custom, b.free_access ? 1 : 0, b.unlock_override ? 1 : 0);
  if (b.revoke_purchase) db.prepare('DELETE FROM enrollments WHERE user_id = ? AND module_id = ?').run(p.id, p.mid);
  send(res, 200, { ok: true });
}, { admin: true });

// ---------- server ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = pathname.match(r.rx);
      if (!m) continue;
      const params = {};
      r.keys.forEach((k, i) => { params[k] = m[i + 1]; });
      try {
        const user = currentUser(req);
        if ((r.auth || r.admin) && !user) return send(res, 401, { error: 'Please sign in.' });
        if (r.admin && user.role !== 'admin') return send(res, 403, { error: 'Admin access required.' });
        return await r.handler(req, res, params, user);
      } catch (e) {
        console.error(e);
        return send(res, 500, { error: 'Something went wrong on the server.' });
      }
    }
    return send(res, 404, { error: 'Not found.' });
  }

  // static files
  let file = pathname === '/' ? '/index.html' : pathname;
  if (file === '/admin') file = '/admin.html';
  const full = path.join(PUBLIC_DIR, path.normalize(file));
  if (!full.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Neuron Academy running at http://localhost:${PORT}`);
  console.log(`Admin panel:            http://localhost:${PORT}/admin`);
});
