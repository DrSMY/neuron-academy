'use strict';
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');

const db = new DatabaseSync(path.join(__dirname, 'platform.db'));
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'Beginner',
  duration_mins INTEGER NOT NULL DEFAULT 60,
  base_price REAL NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 0,
  pass_percent INTEGER NOT NULL DEFAULT 70,
  quiz_draw INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  blocks_json TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS enrollments (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  price_paid REAL NOT NULL DEFAULT 0,
  txn_id TEXT NOT NULL DEFAULT '',
  purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, module_id)
);
CREATE TABLE IF NOT EXISTS user_module_settings (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  custom_price REAL,
  free_access INTEGER NOT NULL DEFAULT 0,
  unlock_override INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, module_id)
);
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  answers_json TEXT,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS activity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  module_id INTEGER,
  day TEXT NOT NULL DEFAULT (date('now','localtime')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_user_day ON activity_events(user_id, day);
CREATE TABLE IF NOT EXISTS module_completions (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, module_id)
);
CREATE TABLE IF NOT EXISTS flashcards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'authored',
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS card_reviews (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  ease REAL NOT NULL DEFAULT 2.5,
  interval_days REAL NOT NULL DEFAULT 0,
  due TEXT NOT NULL DEFAULT (date('now','localtime')),
  reviews INTEGER NOT NULL DEFAULT 0,
  reviewed_at TEXT,
  PRIMARY KEY (user_id, card_id)
);
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions_html TEXT NOT NULL DEFAULT '',
  points INTEGER NOT NULL DEFAULT 100,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_text TEXT NOT NULL DEFAULT '',
  file_name TEXT,
  file_blob BLOB,
  status TEXT NOT NULL DEFAULT 'submitted',
  grade INTEGER,
  feedback TEXT,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  graded_at TEXT,
  UNIQUE (assignment_id, user_id)
);
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  issued_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, module_id)
);
`);

// ---- migrations for databases created before the block model ----
function hasColumn(table, col) {
  return db.prepare(`SELECT COUNT(*) AS c FROM pragma_table_info(?) WHERE name = ?`).get(table, col).c > 0;
}
if (!hasColumn('lessons', 'blocks_json')) db.exec('ALTER TABLE lessons ADD COLUMN blocks_json TEXT');
if (!hasColumn('modules', 'track_id')) db.exec('ALTER TABLE modules ADD COLUMN track_id INTEGER REFERENCES tracks(id) ON DELETE SET NULL');
if (!hasColumn('modules', 'quiz_draw')) db.exec('ALTER TABLE modules ADD COLUMN quiz_draw INTEGER NOT NULL DEFAULT 0');
if (!hasColumn('quiz_attempts', 'answers_json')) db.exec('ALTER TABLE quiz_attempts ADD COLUMN answers_json TEXT');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createUser(name, email, password, role = 'learner') {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  const stmt = db.prepare('INSERT INTO users (name, email, pass_hash, salt, role) VALUES (?, ?, ?, ?, ?)');
  const res = stmt.run(name, email, hash, salt, role);
  return Number(res.lastInsertRowid);
}

function verifyPassword(user, password) {
  const hash = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.pass_hash));
}

// ---- seed content (block model) ----
// Shared between fresh seeds and the one-time upgrade of untouched seed lessons.
const SEED_BLOCKS = {
  'What is Artificial Intelligence?': [
    { type: 'text', html: '<h3>Defining AI</h3><p>Artificial intelligence is the science of building systems that perform tasks which normally require human intelligence — recognising images, understanding language, making decisions.</p><p>Two useful lenses:</p><ul><li><strong>Narrow AI</strong> — systems built for one task (spam filters, recommendation engines).</li><li><strong>General AI</strong> — hypothetical systems with broad, human-level competence.</li></ul><p>Everything deployed today is narrow AI, and that is where the practical value lives.</p>' },
    { type: 'match', prompt: 'Match each concept to its description', pairs: [
      { l: 'Narrow AI', r: 'Built for a single task' },
      { l: 'General AI', r: 'Hypothetical broad competence' },
      { l: 'Spam filter', r: 'A real-world narrow AI' },
    ] },
  ],
  'A Brief History: From Turing to Transformers': [
    { type: 'text', html: '<h3>Key milestones</h3><p><strong>1950</strong> — Alan Turing proposes the imitation game. <strong>1956</strong> — the Dartmouth workshop coins “artificial intelligence”. <strong>1997</strong> — Deep Blue beats Kasparov. <strong>2012</strong> — deep learning wins ImageNet. <strong>2017</strong> — the Transformer architecture arrives, enabling today’s large language models.</p><p>Notice the pattern: each leap came from <em>more data, more compute, and simpler, more general methods</em>.</p>' },
    { type: 'video', url: 'https://www.youtube.com/embed/ad79nYk2keg' },
    { type: 'blank', prompt: 'Complete the sentence', text: 'In 2017 the {{Transformer}} architecture arrived, enabling today’s large language models.' },
  ],
  'How Machines Learn': [
    { type: 'text', html: '<h3>The learning loop</h3><p>Instead of hand-writing rules, we show a model examples and let it adjust itself to reduce error. The loop is always the same:</p><ol><li>Make a prediction</li><li>Measure how wrong it was (the <strong>loss</strong>)</li><li>Nudge internal parameters to be less wrong</li><li>Repeat, millions of times</li></ol><p>That loop — prediction, loss, update — is the heartbeat of all machine learning.</p>' },
    { type: 'order', prompt: 'Put the learning loop in order', items: ['Make a prediction', 'Measure the loss', 'Update the parameters', 'Repeat millions of times'] },
  ],
  'Supervised vs. Unsupervised Learning': [
    { type: 'text', html: '<h3>Two families</h3><p><strong>Supervised learning</strong> trains on labelled examples: inputs paired with correct answers. Classification (spam / not spam) and regression (predicting a price) both live here.</p><p><strong>Unsupervised learning</strong> finds structure in unlabelled data — clustering customers, compressing features, spotting anomalies.</p><p>Rule of thumb: if you have labels, start supervised.</p>' },
    { type: 'match', prompt: 'Match the task to the learning family', pairs: [
      { l: 'Spam / not spam', r: 'Supervised classification' },
      { l: 'Predicting a price', r: 'Supervised regression' },
      { l: 'Customer clusters', r: 'Unsupervised learning' },
    ] },
  ],
  'Training, Testing and Overfitting': [
    { type: 'text', html: '<h3>The cardinal sin</h3><p>A model that memorises its training data looks brilliant in development and fails in production. That is <strong>overfitting</strong>.</p><p>Defences:</p><ul><li>Hold out a <strong>test set</strong> the model never sees during training</li><li>Use a <strong>validation set</strong> for tuning decisions</li><li>Prefer simpler models when data is scarce</li></ul>' },
    { type: 'video', url: 'https://www.youtube.com/embed/EuBBz3bI-aA' },
    { type: 'blank', prompt: 'Fill in the missing terms', text: 'A model that memorises training data is {{overfitting}}. We defend against it with a held-out {{test}} set.' },
  ],
  'Evaluating Models Properly': [
    { type: 'text', html: '<h3>Beyond accuracy</h3><p>Accuracy alone misleads on imbalanced data — a fraud detector that says “never fraud” is 99.9% accurate and useless. Learn these instead:</p><ul><li><strong>Precision</strong> — of the positives you flagged, how many were real?</li><li><strong>Recall</strong> — of the real positives, how many did you catch?</li><li><strong>F1</strong> — the balance of both.</li></ul>' },
    { type: 'order', prompt: 'Rank the evaluation workflow', items: ['Split data into train and test', 'Train on the training set', 'Tune with a validation set', 'Report final metrics on the test set'] },
  ],
  'How LLMs Actually Work': [
    { type: 'text', html: '<h3>Next-token prediction</h3><p>A large language model does one thing: given text so far, predict the next token. Trained across trillions of tokens, that single objective yields translation, reasoning, coding and more — capabilities that <em>emerge</em> from scale.</p><p>Key vocabulary: <strong>tokens</strong> (sub-word units), <strong>context window</strong> (how much the model can “see”), <strong>temperature</strong> (randomness of sampling).</p>' },
    { type: 'code', instructions: 'A toy tokenizer: log how many space-separated tokens the sentence contains.', language: 'javascript',
      starter: "const text = 'AI models read text as tokens';\n// TODO: log how many space-separated tokens there are\n",
      expected_output: '6' },
  ],
  'Prompt Engineering that Works': [
    { type: 'text', html: '<h3>Reliable patterns</h3><ul><li><strong>Be explicit</strong> — state the role, task, format and constraints.</li><li><strong>Show examples</strong> — few-shot prompts anchor style and structure.</li><li><strong>Give it room to think</strong> — ask for step-by-step reasoning before the answer.</li><li><strong>Structure output</strong> — request JSON with a fixed schema when machines consume the result.</li></ul>' },
    { type: 'order', prompt: 'Order the parts of a well-structured prompt', items: ['Set the role', 'State the task', 'Give constraints and format', 'Provide examples', 'Ask for step-by-step reasoning'] },
  ],
  'RAG: Grounding Models in Your Data': [
    { type: 'text', html: '<h3>Retrieval-augmented generation</h3><p>LLMs know nothing about your private documents. RAG fixes that: <strong>embed</strong> your documents into vectors, <strong>retrieve</strong> the most relevant chunks for each question, and <strong>stuff</strong> them into the prompt as context.</p><p>Result: grounded answers, citable sources, dramatically fewer hallucinations.</p>' },
    { type: 'blank', prompt: 'Fill in the RAG pipeline', text: 'RAG first {{embeds|embed}} documents into vectors, then {{retrieves|retrieve}} the most relevant chunks for each question.' },
  ],
};

const SEED_QUESTIONS = {
  1: [ // Foundations of AI
    ['Which kind of AI describes every system deployed in production today?', ['General AI', 'Narrow AI', 'Sentient AI', 'Quantum AI'], 1],
    ['Which 2017 breakthrough architecture enabled modern large language models?', ['Convolutional networks', 'Decision trees', 'The Transformer', 'Genetic algorithms'], 2],
    ['In the learning loop, what does the "loss" measure?', ['Training speed', 'How wrong the prediction was', 'Memory usage', 'Dataset size'], 1],
    ['Who proposed the imitation game in 1950?', ['John McCarthy', 'Alan Turing', 'Geoffrey Hinton', 'Claude Shannon'], 1],
    ['Deep learning’s breakthrough ImageNet win happened in which year?', ['2005', '2012', '2017', '2020'], 1],
  ],
  2: [ // ML Essentials
    ['You have thousands of emails labelled spam / not-spam. Which approach fits?', ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Random search'], 1],
    ['A model scores 99% on training data but 60% on new data. What happened?', ['Underfitting', 'Perfect generalisation', 'Overfitting', 'Data leakage is impossible'], 2],
    ['Of all real fraud cases, the share your model catches is called…', ['Precision', 'Recall', 'Accuracy', 'Loss'], 1],
    ['Which dataset must the model NEVER see during training?', ['Training set', 'Validation set', 'Test set', 'All of them'], 2],
    ['Clustering customers without labels is an example of…', ['Supervised learning', 'Unsupervised learning', 'Regression', 'Fine-tuning'], 1],
  ],
  3: [ // Building with LLMs
    ['At its core, what single task is an LLM trained to do?', ['Translate languages', 'Predict the next token', 'Search the web', 'Store a knowledge graph'], 1],
    ['What does the context window limit?', ['Training data size', 'How much text the model can attend to at once', 'GPU memory only', 'Number of users'], 1],
    ['In RAG, what happens before generation?', ['Fine-tuning the model', 'Retrieving relevant document chunks', 'Deleting the context', 'Raising temperature'], 1],
    ['Which sampling parameter controls randomness of output?', ['Context window', 'Temperature', 'Embedding size', 'Batch size'], 1],
    ['Few-shot prompting means…', ['Training on few examples', 'Showing worked examples inside the prompt', 'Using a smaller model', 'Limiting output length'], 1],
  ],
};

function seed() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count > 0) return;

  createUser('Platform Admin', 'admin@platform.ai', 'admin123', 'admin');

  const addModule = db.prepare('INSERT INTO modules (title, description, level, duration_mins, base_price, position, published, pass_percent, quiz_draw) VALUES (?,?,?,?,?,?,?,?,?)');
  const addLesson = db.prepare('INSERT INTO lessons (module_id, title, blocks_json, position) VALUES (?,?,?,?)');
  const addQ = db.prepare('INSERT INTO quiz_questions (module_id, question, options_json, correct_index, position) VALUES (?,?,?,?,?)');

  const defs = [
    ['Foundations of AI', 'What artificial intelligence really is, how it evolved, and the core ideas — search, knowledge, and learning — that power every modern system.', 'Beginner', 90, 29, 1, 70,
      ['What is Artificial Intelligence?', 'A Brief History: From Turing to Transformers', 'How Machines Learn']],
    ['Machine Learning Essentials', 'Supervised and unsupervised learning, training vs. testing, overfitting, and how to evaluate a model like a professional.', 'Intermediate', 120, 49, 2, 70,
      ['Supervised vs. Unsupervised Learning', 'Training, Testing and Overfitting', 'Evaluating Models Properly']],
    ['Building with Large Language Models', 'Prompting, retrieval-augmented generation, tool use, and shipping production LLM features safely.', 'Advanced', 150, 79, 3, 75,
      ['How LLMs Actually Work', 'Prompt Engineering that Works', 'RAG: Grounding Models in Your Data']],
  ];

  defs.forEach(([title, desc, level, mins, price, pos, pass, lessonTitles], di) => {
    const mid = Number(addModule.run(title, desc, level, mins, price, pos, 1, pass, 3).lastInsertRowid);
    lessonTitles.forEach((lt, i) => addLesson.run(mid, lt, JSON.stringify(SEED_BLOCKS[lt]), i + 1));
    (SEED_QUESTIONS[di + 1] || []).forEach(([q, opts, ci], i) => addQ.run(mid, q, JSON.stringify(opts), ci, i + 1));
  });
}

// Upgrade pre-block lessons in place: known seed lessons get the enriched
// interactive blocks; anything else gets a faithful video+text conversion.
function migrateLessons() {
  const legacy = db.prepare('SELECT id, title, content_html, video_url FROM lessons WHERE blocks_json IS NULL').all();
  if (!legacy.length) return;
  const upd = db.prepare('UPDATE lessons SET blocks_json = ? WHERE id = ?');
  for (const l of legacy) {
    let blocks = SEED_BLOCKS[l.title];
    if (!blocks) {
      blocks = [];
      if (l.video_url) blocks.push({ type: 'video', url: l.video_url });
      if (l.content_html) blocks.push({ type: 'text', html: l.content_html });
    }
    upd.run(JSON.stringify(blocks), l.id);
  }
  // Seeded modules gain the expanded question bank + draw setting once.
  const mods = db.prepare('SELECT id, title FROM modules').all();
  const nameToBank = { 'Foundations of AI': 1, 'Machine Learning Essentials': 2, 'Building with Large Language Models': 3 };
  const addQ = db.prepare('INSERT INTO quiz_questions (module_id, question, options_json, correct_index, position) VALUES (?,?,?,?,?)');
  for (const m of mods) {
    const bank = nameToBank[m.title];
    if (!bank) continue;
    const existing = db.prepare('SELECT COUNT(*) AS c FROM quiz_questions WHERE module_id = ?').get(m.id).c;
    if (existing >= SEED_QUESTIONS[bank].length) continue;
    SEED_QUESTIONS[bank].slice(existing).forEach(([q, opts, ci], i) => addQ.run(m.id, q, JSON.stringify(opts), ci, existing + i + 1));
    db.prepare('UPDATE modules SET quiz_draw = 3 WHERE id = ? AND quiz_draw = 0').run(m.id);
  }
}

// Backfill XP events for progress made before the events table existed.
function backfillEvents() {
  const empty = db.prepare('SELECT COUNT(*) AS c FROM activity_events').get().c === 0;
  const hasProgress = db.prepare('SELECT COUNT(*) AS c FROM lesson_progress').get().c > 0;
  if (!empty || !hasProgress) return;
  db.exec(`
    INSERT INTO activity_events (user_id, type, xp, module_id, day, created_at)
      SELECT lp.user_id, 'lesson_complete', 10, l.module_id, date(lp.completed_at), lp.completed_at
      FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id;
    INSERT INTO activity_events (user_id, type, xp, module_id, day, created_at)
      SELECT user_id, 'quiz_pass', 30, module_id, date(MIN(attempted_at)), MIN(attempted_at)
      FROM quiz_attempts WHERE passed = 1 GROUP BY user_id, module_id;
    INSERT INTO activity_events (user_id, type, xp, module_id, day, created_at)
      SELECT user_id, 'module_complete', 50, module_id, date(completed_at), completed_at
      FROM module_completions;
  `);
}

// Derive flashcards from interactive lesson blocks (match pairs and blanks)
// for modules that don't have any cards yet. Admin can add more in the editor.
function deriveFlashcards() {
  const mods = db.prepare('SELECT id FROM modules').all();
  const ins = db.prepare('INSERT INTO flashcards (module_id, front, back, source, position) VALUES (?,?,?,?,?)');
  for (const m of mods) {
    const have = db.prepare('SELECT COUNT(*) AS c FROM flashcards WHERE module_id = ?').get(m.id).c;
    if (have > 0) continue;
    let pos = 0;
    for (const l of db.prepare('SELECT blocks_json FROM lessons WHERE module_id = ? ORDER BY position, id').all(m.id)) {
      for (const b of JSON.parse(l.blocks_json || '[]')) {
        if (b.type === 'match') for (const p of b.pairs || []) ins.run(m.id, p.l, p.r, 'derived', ++pos);
        if (b.type === 'blank') {
          const text = b.text || '';
          const answers = [...text.matchAll(/\{\{(.+?)\}\}/g)].map((mt) => mt[1].split('|')[0].trim());
          if (answers.length) ins.run(m.id, text.replace(/\{\{.+?\}\}/g, '_____'), answers.join(', '), 'derived', ++pos);
        }
      }
    }
  }
}

// Catalog taxonomy: subjects contain tracks, tracks contain modules.
// Existing installs get an "Artificial Intelligence / AI Fundamentals" home
// for their current modules so nothing disappears from the learner catalog.
function migrateTaxonomy() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM subjects').get().c;
  if (count === 0) {
    const sid = Number(db.prepare("INSERT INTO subjects (title, description, position, published) VALUES (?,?,1,1)")
      .run('Artificial Intelligence', 'Understand, evaluate and build with modern AI — from first principles to production LLM systems.').lastInsertRowid);
    const tid = Number(db.prepare("INSERT INTO tracks (subject_id, title, description, position, published) VALUES (?,?,?,1,1)")
      .run(sid, 'AI Fundamentals', 'The core path: what AI is, how machines learn, and how to build with large language models.').lastInsertRowid);
    db.prepare('UPDATE modules SET track_id = ? WHERE track_id IS NULL').run(tid);
  } else {
    // safety net: adopt any orphaned modules into the first track
    const firstTrack = db.prepare('SELECT id FROM tracks ORDER BY position, id LIMIT 1').get();
    if (firstTrack) db.prepare('UPDATE modules SET track_id = ? WHERE track_id IS NULL').run(firstTrack.id);
  }
}

seed();
migrateLessons();
backfillEvents();
deriveFlashcards();
migrateTaxonomy();

module.exports = { db, createUser, verifyPassword };
