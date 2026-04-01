# PR 7 — Submit Your Own Question (final, schema-verified)

## Schema reference (from live Supabase table)
```
question_id   serial PK
category      text         e.g. "History", "Culture"
difficulty    text         "Purple" | "Orange" | "Yellow"
question      text
options       text         JSON string: "[\"opt1\",\"opt2\",\"opt3\",\"opt4\"]"
answer        integer      0-based index of correct option
date_added    timestamptz  auto
asked_status  boolean      false = not yet served to players
asked_count   integer      default 0
expiry_status boolean      default false
source        text         nullable
submitted_by  text         user ID or "admin"
corrected_date text        nullable
corrected_by  text         nullable
image_url     text         nullable
```

**Key insight:** `options` is stored as a JSON *string*, not a native Postgres JSON column.
So you must `JSON.stringify(array)` before inserting.

No `is_approved` column — use `asked_status: false` as the moderation gate.
New submissions sit with `asked_status: false` until you flip them to `true` in Supabase dashboard.

---

## New File: `src/components/SubmitQuestionModal.jsx`

```jsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = ['History', 'Technology', 'Sports', 'Culture', 'Connect'];
const DIFFICULTIES = [
  { value: 'Purple', label: 'Hard (15 pts)' },
  { value: 'Orange', label: 'Medium (9 pts)' },
  { value: 'Yellow', label: 'Easy (3 pts)' },
];

function getOrCreateUserId() {
  let id = localStorage.getItem('15to100_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('15to100_user_id', id);
  }
  return id;
}

const EMPTY_FORM = {
  question: '',
  options: ['', '', '', ''],
  answer: null,
  category: 'Culture',
  difficulty: 'Orange',
  source: '',
};

export default function SubmitQuestionModal({ onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const optionLabels = ['A', 'B', 'C', 'D'];

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = value;
    setForm(prev => ({ ...prev, options: updated }));
  };

  const validate = () => {
    if (!form.question.trim()) return 'Please enter a question.';
    if (form.question.trim().length < 10) return 'Question is too short.';
    if (form.options.some(o => !o.trim())) return 'Please fill in all 4 answer options.';
    if (form.answer === null) return 'Please select the correct answer by clicking a letter.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setErrorMsg(validationError); return; }

    setStatus('submitting');
    setErrorMsg('');

    const { error: dbError } = await supabase
      .from('questions')
      .insert([{
        question:      form.question.trim(),
        options:       JSON.stringify(form.options.map(o => o.trim())), // stored as JSON string
        answer:        form.answer,                                      // integer index
        category:      form.category,
        difficulty:    form.difficulty,
        source:        form.source.trim() || null,
        submitted_by:  getOrCreateUserId(),
        asked_status:  false,   // sits in queue until you approve in Supabase dashboard
        asked_count:   0,
        expiry_status: false,
        image_url:     null,
        corrected_date: null,
        corrected_by:  null,
      }]);

    if (dbError) {
      setStatus('error');
      setErrorMsg(dbError.message || 'Something went wrong. Please try again.');
    } else {
      setStatus('success');
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <ModalShell onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
          <CheckCircle className="w-16 h-16 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Question Submitted!</h2>
          <p className="text-slate-400 max-w-xs">
            Thanks for contributing. Your question will be reviewed before going live.
            We'll track how many players it stumps! 🎯
          </p>
          <button
            onClick={() => { setForm(EMPTY_FORM); setStatus('idle'); }}
            className="mt-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold transition-colors"
          >
            Submit Another
          </button>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm">
            Close
          </button>
        </div>
      </ModalShell>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-xl font-bold text-white mb-1">Submit a Question</h2>
      <p className="text-slate-400 text-sm mb-6">
        Think you can stump players? Add your question to the pool.
      </p>

      {/* Question text */}
      <label className="block mb-4">
        <span className="text-slate-300 text-sm font-semibold mb-1 block">Your Question *</span>
        <textarea
          value={form.question}
          onChange={e => setForm(prev => ({ ...prev, question: e.target.value }))}
          placeholder="e.g. Which planet has the most moons?"
          rows={3}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2
                     text-white placeholder-slate-500 text-sm
                     focus:outline-none focus:border-brand-500 resize-none"
        />
      </label>

      {/* Options */}
      <div className="mb-4">
        <span className="text-slate-300 text-sm font-semibold mb-1 block">
          Answer Options *{' '}
          <span className="text-slate-500 font-normal">click a letter to mark correct</span>
        </span>
        <div className="flex flex-col gap-2">
          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, answer: i }))}
                className={`w-8 h-8 rounded-full flex items-center justify-center
                            font-bold text-sm shrink-0 transition-all border-2
                            ${form.answer === i
                              ? 'bg-green-500 border-green-400 text-white scale-110'
                              : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-400'}`}
              >
                {optionLabels[i]}
              </button>
              <input
                value={opt}
                onChange={e => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${optionLabels[i]}`}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2
                           text-white placeholder-slate-500 text-sm
                           focus:outline-none focus:border-brand-500"
              />
            </div>
          ))}
        </div>
        {form.answer !== null && (
          <p className="text-green-400 text-xs mt-1">
            ✓ Option {optionLabels[form.answer]} is the correct answer
          </p>
        )}
      </div>

      {/* Category + Difficulty */}
      <div className="flex gap-4 mb-4">
        <label className="flex-1">
          <span className="text-slate-300 text-sm font-semibold mb-1 block">Category</span>
          <select
            value={form.category}
            onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2
                       text-white text-sm focus:outline-none focus:border-brand-500"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex-1">
          <span className="text-slate-300 text-sm font-semibold mb-1 block">Difficulty</span>
          <select
            value={form.difficulty}
            onChange={e => setForm(prev => ({ ...prev, difficulty: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2
                       text-white text-sm focus:outline-none focus:border-brand-500"
          >
            {DIFFICULTIES.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Source (optional) */}
      <label className="block mb-6">
        <span className="text-slate-300 text-sm font-semibold mb-1 block">
          Source <span className="text-slate-500 font-normal">(optional — e.g. Wikipedia, Britannica)</span>
        </span>
        <input
          value={form.source}
          onChange={e => setForm(prev => ({ ...prev, source: e.target.value }))}
          placeholder="e.g. Wikipedia"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2
                     text-white placeholder-slate-500 text-sm
                     focus:outline-none focus:border-brand-500"
        />
      </label>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-400 text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={status === 'submitting'}
        className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50
                   disabled:cursor-not-allowed text-white font-bold rounded-lg
                   transition-colors text-sm"
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit Question'}
      </button>

      <p className="text-slate-600 text-xs mt-3 text-center">
        Questions are reviewed before going live. Keep them factual and family-friendly.
      </p>
    </ModalShell>
  );
}

// ── Shared modal shell ────────────────────────────────────────────────────────
function ModalShell({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg
                      max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
```

---

## Edit: `src/components/Header.jsx`

```jsx
import React, { useState } from 'react';
import SubmitQuestionModal from './SubmitQuestionModal';
// ... keep your existing imports

const Header = () => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  return (
    <>
      <header className="...your existing className...">
        {/* ... existing header content ... */}

        {/* ADD alongside existing header buttons */}
        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold
                     bg-brand-600/20 hover:bg-brand-600/40 text-brand-300
                     border border-brand-600/30 hover:border-brand-500/60
                     rounded-lg transition-all duration-200"
        >
          <span className="text-base leading-none">✏️</span>
          <span className="hidden sm:inline">Submit Question</span>
        </button>
      </header>

      {showSubmitModal && (
        <SubmitQuestionModal onClose={() => setShowSubmitModal(false)} />
      )}
    </>
  );
};
```

---

## Edit: `src/store/gameStore.js` — gate on asked_status

Your existing query already uses `.limit(count)` but doesn't filter out unreviewed submissions.
Add one line to `fetchByDiff`:

```js
const fetchByDiff = async (diff, count) => {
  if (count === 0) return []
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .ilike('category', categoryId === 'wildcard' ? 'Wildcard' : categoryId)
    .eq('difficulty', diff)
    .eq('asked_status', false)   // ← only serve questions not yet asked
    .limit(count)

  if (error) throw error
  return data || []
}
```

> Wait — you're already using `asked_status` as "has this question been shown before",
> not as an approval flag. If that's the case, **don't add this filter**.
> Instead, approve submitted questions manually in the Supabase dashboard by
> setting a dedicated column. See the Supabase note below.

---

## Supabase: recommended approval setup

Since `asked_status` already has a different meaning (tracks whether a question has been shown),
add a proper approval column:

```sql
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- Mark existing questions as approved
UPDATE questions SET is_approved = true;

-- New user submissions will insert with is_approved = false (add to insert payload)
-- Update fetchByDiff filter:
-- .eq('is_approved', true)
```

Then update the insert in `SubmitQuestionModal.jsx` to include `is_approved: false`,
and update `fetchByDiff` to filter `.eq('is_approved', true)`.

---

## Files changed summary

| File | Action |
|------|--------|
| `src/components/SubmitQuestionModal.jsx` | New file |
| `src/components/Header.jsx` | Add button + modal state |
| `src/store/gameStore.js` | Add approval filter to fetchByDiff |
| Supabase SQL | `ALTER TABLE questions ADD COLUMN is_approved BOOLEAN DEFAULT true` |
