# FIX_PROGRESS.md

# Aetherion-Pennywise Frontend Bug Fix Progress

## PURPOSE

This file is the persistent handoff/progress tracker for the frontend bug-fixing workflow.

OpenCode MUST read this file BEFORE doing any work.

---

## CORE RULES

1. FRONTEND ONLY
   - Only modify files inside `frontend/`.
   - NEVER modify `Backend/` or backend/server/database files.

2. ONE ISSUE AT A TIME
   - Fix ONLY the issue currently marked as `NEXT`.
   - Do NOT fix additional audit issues even if they are noticed while working.

3. DO NOT COMMIT
   - OpenCode must NEVER commit changes automatically.
   - The user will review and commit the changes manually.

4. WAIT FOR COMMIT CONFIRMATION
   - After fixing and verifying an issue, STOP.
   - Do NOT proceed to the next issue until the user confirms that the previous issue has been committed.

5. ALREADY-RESOLVED ISSUES
   - If an issue was already fixed as a consequence of an earlier fix, verify it.
   - Do NOT make duplicate changes.
   - Mark it as ALREADY RESOLVED if appropriate.

6. PRESERVE EXISTING BEHAVIOR
   - Do not refactor unrelated code.
   - Keep changes minimal and focused on the current issue.

7. VERIFICATION
   - Run relevant frontend checks after every fix.
   - Report pre-existing errors separately.
   - Do NOT fix unrelated lint/build issues as part of the current issue.

8. STOP AFTER ONE ISSUE
   - After completing the current issue and verification, STOP.
   - Provide a report and wait for the user's confirmation.

9. UPDATE THIS FILE AFTER EACH ISSUE
   - After the user confirms an issue is fixed/committed, update `FIX_PROGRESS.md`:
     - move the completed issue into COMPLETED ISSUES
     - mark the next audit issue as NEXT
     - update CURRENT STATUS
   - This keeps the workflow continuable across sessions.

---

# CURRENT STATUS

## Last committed issue

D5

## Next issue

D6

## Current state

- The last committed issue is D5 (FIXED + COMMITTED + PUSHED + USER CONFIRMED).
- S3 has been reviewed — NO CODE CHANGE (documented by-design tradeoff).
- A1 is fixed and pushed.
- A2 is fixed, committed and pushed.
- A3 is fixed, committed and pushed.
- A4 is fixed, committed and pushed.
- A5 is fixed, committed and pushed.
- The ACCESSIBILITY queue (A1-A5) is now complete.
- P1 is fixed, committed and pushed.
- P2 is fixed, committed and pushed.
- P3 is fixed, committed and pushed.
- P4 is fixed, committed and pushed.
- The PERFORMANCE / QUALITY queue (P1-P4) is now complete.
- D1 is fixed, committed and pushed.
- D2 is fixed, committed and pushed.
- D3 is fixed, committed and pushed.
- D4 is fixed, committed and pushed.
- D5 is fixed, committed and pushed.
- D6 is the next issue.
- Do NOT start D6 until the user explicitly tells you to continue.
- S1 was verified as already resolved by C1.
- There is NO C5 in the original audit.
- Do NOT invent issue numbers.

---

# COMPLETED ISSUES

## C1 — Google OAuth sign-in completely broken

STATUS: FIXED + COMMITTED

Files changed:
- frontend/src/main.tsx
- frontend/src/pages/Login.jsx

Fix:
- Centralized OAuth token handling in `main.tsx`.
- Reads `?token=` before React mounts.
- Stores the token in localStorage.
- Removes the token from the URL using `history.replaceState`.
- Redirects to `/dashboard` without the token in the URL.
- Removed redundant OAuth handling from Login.jsx.

---

## C2 — Setup-profile ↔ Dashboard redirect loop

STATUS: FIXED + COMMITTED

File changed:
- frontend/src/pages/SetupProfile.jsx

Fix:
- Phone number is now required.
- Account number is now required.
- This matches the existing Dashboard/Login completeness checks.

---

## C3 — Failed payments were silent

STATUS: FIXED + COMMITTED

Files changed:
- frontend/src/pages/Dashboard.jsx
- frontend/src/components/PaymentModal.jsx

Fix:
- Payment modal now waits for the real payment request.
- Modal remains open if payment fails.
- User receives an inline error.
- Entered payment information is preserved for retry.
- Pay button is disabled during the request.
- Modal cannot be accidentally closed during an in-flight payment.
- Modal closes only after successful payment.

---

## C4 — ESLint did not lint application JS/JSX

STATUS: FIXED + COMMITTED

File changed:
- frontend/eslint.config.js

Fix:
- ESLint now covers JS/JSX in addition to TS/TSX.

IMPORTANT:
C4 exposed 9 pre-existing lint violations.

These were intentionally NOT fixed as part of C4.

Known pre-existing violations:
- ContactCard.jsx
- PaymentModal.jsx
- QRScanner.jsx
- RoundUpPopup.jsx

DO NOT fix these automatically as part of another issue.

---

## S1 — JWT token left in URL

STATUS: ALREADY RESOLVED BY C1

No additional code changes were made.

C1 already:
- captures `?token=`
- stores the token
- removes the query string using `history.replaceState`

Repo-wide inspection confirmed OAuth token URL handling is centralized in `main.tsx`.

DO NOT create another S1 fix.

---

## F3 — Chatbot authentication/status/request handling

STATUS: FIXED + COMMITTED

File changed:
- frontend/src/pages/Chatbot.jsx

Fix:
- Added authentication guard.
- Missing token redirects to `/login`.
- 401 clears token and redirects to `/login`.
- Prevents concurrent chatbot requests.
- Suggestion chips are disabled while a request is running.
- Removed the decorative always-green "Online" indicator.

No backend health endpoint was added.

---

## F4 — QR scanner accepted non-UPI QR codes

STATUS: FIXED + COMMITTED

Files changed:
- frontend/src/utils/parseUpiQR.js
- frontend/src/pages/Dashboard.jsx

Fix:
- Only `upi:` protocol is accepted.
- `pa` payee address is required.
- HTTP/HTTPS QR codes are rejected.
- Random/malformed QR payloads are rejected.
- Invalid QR feedback is shown inline.

---

## F5 — "Paid to Enter Details"

STATUS: FIXED + COMMITTED

File changed:
- frontend/src/components/RoundUpPopup.jsx

Fix:
- Send Money / Pay Contacts no longer displays `"Enter Details"` as the recipient.
- Recipient label uses existing frontend data:
  1. phone number
  2. UPI
  3. contact name
  4. `"merchant"` fallback

IMPORTANT:
The separate transaction-description issue involving `"Enter Details"` was intentionally NOT fixed because it was outside F5.

---

## F6 — Delete-goal failure was silent

STATUS: FIXED + COMMITTED

File changed:
- frontend/src/pages/Goals.jsx

Fix:
- Failed delete now shows a visible error.
- 401 clears token and redirects to `/login`.
- Successful delete behavior remains unchanged.

---

## F7 — "Add to Goals" could be double-fired

STATUS: FIXED + COMMITTED

File changed:
- frontend/src/components/AddGoalFromLink.jsx

Fix:
- Added `adding` pending state.
- Awaits the add operation.
- Prevents duplicate submissions.
- Disables the button while pending.
- Shows `Adding...`.
- Resets pending state in `finally`.

USER CONFIRMED F7 IS COMMITTED.

---

## F8 — Dashboard "View all" contacts button does nothing

STATUS: FIXED + COMMITTED + PUSHED

File changed:
- frontend/src/pages/Dashboard.jsx

Fix:
- The "View all" button in the Recent People section now opens an "All Contacts" modal listing every contact.
- Reused the existing ContactCard component to render contacts.
- Reused the existing PaymentModal flow (`handleContactPay`) — clicking a contact in the modal opens the pay flow.
- No new routes, pages, or components were added.
- No backend changes — the existing static `dummyContacts` data was reused.

Verification:
- `npx eslint src/pages/Dashboard.jsx` passed.
- `npm run build` passed.
- Pre-existing lint errors remain in untouched files (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — intentionally NOT fixed as part of F8.

USER CONFIRMED F8 IS COMMITTED AND PUSHED.

---

## S2 — "Continue with Google" hard-codes localhost:5000

STATUS: FIXED + COMMITTED + PUSHED

Files changed:
- frontend/src/services/api.js
- frontend/src/pages/Login.jsx

Fix:
- Extracted the API origin into an exported `API_BASE_URL` constant in `api.js`
  (`import.meta.env.VITE_API_URL || "http://localhost:5000/api"`), which the axios
  instance now uses as its `baseURL`.
- Login.jsx now redirects to `` `${API_BASE_URL}/auth/google` `` instead of a
  hard-coded `http://localhost:5000/api/auth/google`.
- The OAuth URL now respects the same API origin configuration as all API calls.

Verification:
- `npx eslint src/pages/Login.jsx src/services/api.js` passed.
- `npm run build` passed.
- No hard-coded OAuth URL remains; `localhost:5000` only exists as the fallback default in `api.js`.

USER CONFIRMED S2 IS COMMITTED AND PUSHED.

---

## S3 — JWT stored in localStorage

STATUS: REVIEWED — NO CODE CHANGE

Reason:
Documented by-design tradeoff; no justified frontend-only fix.

Investigation findings:
- JWTs are stored in localStorage (Login.jsx, main.tsx), attached to requests via the
  axios interceptor in api.js, and removed on logout / 401 responses.
- Changing to httpOnly cookies requires backend changes — out of scope.
- sessionStorage does not provide meaningful XSS protection.
- An in-memory solution would require an authentication architecture rewrite.
- No XSS vector was found in the frontend (no dangerouslySetInnerHTML / innerHTML / eval).
- No concrete frontend-only fix is justified within the project's current scope.

S3 should NOT be treated as a bug requiring a code fix.

USER CONFIRMED: NO CODE CHANGE — DOCUMENTED BY-DESIGN TRADEOFF.

---

## A1 — Modals lack focus trap, ARIA roles, ESC handling

STATUS: FIXED + COMMITTED + PUSHED

Files changed:
- frontend/src/hooks/useFocusTrap.js (NEW)
- frontend/src/components/PaymentModal.jsx
- frontend/src/components/RoundUpPopup.jsx
- frontend/src/components/QRScanner.jsx
- frontend/src/pages/Dashboard.jsx

Fix:
- Added a shared `useFocusTrap(containerRef, { onEscape, active })` hook.
  The hook keeps Tab / Shift+Tab focus inside the dialog, moves focus in on
  open, pins focus to the container when it has no tabbable elements, and
  restores focus to the trigger element on close.
  `onEscape` is held in a ref so the effect is not re-run by inline arrow props.
- PaymentModal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on a new
  `sr-only` heading ("Pay {contact}"), `tabIndex={-1}`, and a focus trap.
- PaymentModal: Escape is routed through the EXISTING `handleClose`, so the
  `if (processing) return;` guard from C3 still blocks dismissal while a
  payment is in flight.
- RoundUpPopup: the backdrop is now clickable (`onClick={onSkip}`), consistent
  with the X button and the Skip button. This was the specific A1 sub-defect.
- RoundUpPopup: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on the
  existing "Payment Successful!" heading, `aria-describedby` on the payment
  summary paragraph, `tabIndex={-1}`, and a focus trap.
- QRScanner: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on the
  existing "Scan UPI QR" heading, `tabIndex={-1}`, and a focus trap.
- Dashboard "All Contacts" modal: same dialog semantics, labelling, Escape and
  focus trap. It is conditionally rendered inside Dashboard, so the hook is
  called at top level with `active: allContactsOpen`.
- Close controls in all four modals got explicit `aria-label`s so they stay
  accessible.

Deliberately NOT changed (per-component behaviour differences):
- PaymentModal backdrop click behaviour is unchanged.
- QRScanner backdrop was left NON-clickable. It was not flagged by the audit,
  and making a camera view dismiss on a stray tap would be a regression.
- RoundUpPopup Escape/backdrop dismissal during the 1s post-`handleSave` timer
  matches the X button's pre-existing behaviour.
- `AddGoalFromLink` and the Goals/auth-page panels were inspected and are inline
  page content, not overlays — out of scope.
- RoundUpPopup's `handleRoundUpSave` is currently a no-op in Dashboard; that is
  a separate issue and was NOT touched.

Verification:
- `npx eslint src/hooks/useFocusTrap.js src/components/PaymentModal.jsx src/components/RoundUpPopup.jsx src/components/QRScanner.jsx src/pages/Dashboard.jsx`
  reported only the 8 pre-existing C4 violations (useFocusTrap.js and
  Dashboard.jsx clean).
- `npm run lint` reported the identical 9 pre-existing violations — same rules,
  same count as the pre-change baseline. NOT fixed (C4 dead-code violations).
- `npm run build` passed.
- No true browser interaction test was available (the project has no test
  framework and no test files). Keyboard paths were verified by code review
  only.

USER CONFIRMED A1 IS COMMITTED AND PUSHED.

---

## A2 — Icon-only buttons lack accessible names

STATUS: FIXED + COMMITTED + PUSHED

Files changed:
- frontend/src/components/Navbar.jsx
- frontend/src/components/GoalRow.jsx
- frontend/src/components/GoalsTable.jsx
- frontend/src/components/AddGoalFromLink.jsx
- frontend/src/pages/Chatbot.jsx
- frontend/src/pages/Goals.jsx
- frontend/src/pages/Dashboard.jsx

Fix (frontend accessibility fix only — no functional change):
- Added `aria-label` to every live icon-only button so each one exposes an
  accessible name instead of being announced as a bare "button".
- Navbar hamburger: `aria-label={mobileOpen ? "Close menu" : "Open menu"}` so
  the name tracks the Menu / X icon toggle.
- GoalRow (desktop table row) delete button: `aria-label={`Delete goal ${goal.name}`}`.
  The existing `title="Delete goal"` tooltip was kept, so the hover affordance
  and visuals are unchanged.
- GoalsTable (mobile card) delete button: same `Delete goal {name}` label.
- Chatbot submit button: `aria-label="Send message"`.
- Additional live icon-only buttons found during the required A2 sweep
  ("find every icon-only button in the frontend"):
  - Goals.jsx error banner dismiss (X) — `aria-label="Dismiss error message"`
  - Dashboard.jsx QR scan error banner dismiss (X) — `aria-label="Dismiss QR scan error"`
  - AddGoalFromLink.jsx panel close (X) — `aria-label="Close Add from Product Link panel"`
- Every other `<button>` in the frontend was inspected and already has visible
  text (PaymentActions, QRScanner, Goals add / create / mode toggles, Chatbot
  suggestion chips, ContactCard, Login, Register, SetupProfile), so no
  redundant `aria-label` contradicting visible text was added.

Already resolved by A1 (verified, deliberately NOT modified again):
- PaymentModal close X already had `aria-label="Close payment dialog"`.
- RoundUpPopup close X already had `aria-label="Skip round-up and close"`.
- Dashboard "All Contacts" modal close X already had `aria-label="Close all contacts"`.

Deliberately NOT changed:
- `GoalCard.jsx` has an icon-only `Trash2` delete button, but `GoalCard` is
  dead code scheduled for removal under D1, so it was NOT modified. Tracked
  under D1 instead of A2.
- No `aria-expanded` was added to the Navbar hamburger — that is a state hint,
  not an accessible name, so it is out of A2 scope.
- No source file, layout, styling, or behaviour was refactored.
- No backend changes.

Verification:
- Targeted `npx eslint` on all 7 changed files: clean, 0 problems.
- `npm run lint`: the same 9 pre-existing C4 violations (ContactCard.jsx,
  PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same rules, same count
  as the pre-change baseline. NOT fixed (C4 dead-code violations).
- `npm run build` passed.
- `git diff --stat` confirmed attribute-only changes (7 files, +11 / -1).
- The project has no test framework and no browser / screen-reader automated
  testing, so the accessibility behaviour was verified by source and code
  inspection only.

LIMITATIONS:
- No automated accessibility/browser verification exists in this project.
- `GoalCard.jsx` remains unlabelled (dead code, see D1).

USER CONFIRMED A2 IS COMMITTED AND PUSHED.

---

## A3 — Placeholder-only form inputs (no `<label>`)

STATUS: FIXED + COMMITTED + PUSHED

Files changed:
- frontend/src/pages/SetupProfile.jsx
- frontend/src/components/PaymentModal.jsx
- frontend/src/components/AddGoalFromLink.jsx
- frontend/src/pages/Chatbot.jsx

Fix (frontend accessibility fix only — no functional change):
- Root cause: a `placeholder` is not an accessible name. It is only a hint, it is
  exposed unreliably by assistive tech, and it disappears as soon as the user
  types. These inputs therefore had no programmatic accessible name at all.
- SetupProfile.jsx: all four banking fields (phone number, account number, IFSC
  code, UPI ID) received a visually-hidden `sr-only` `<label>` with `htmlFor`
  plus a matching `id`. Static ids were used because the existing `name`
  attributes are already unique form-wide and the page renders one instance.
- PaymentModal.jsx: the amount, phone number and note inputs received
  `sr-only` labels ("Amount", "Phone number", "Note (optional)") wired with
  `htmlFor` / `id`. Three new `useId()` hooks (`amountId`, `phoneNumberId`,
  `noteId`) sit next to the existing `titleId` from A1, so no static id can
  collide if the modal ever renders more than once.
- AddGoalFromLink.jsx: the nickname and manual-price captions were plain
  `<span>` elements. A `<span>` is not programmatically associated with its
  input, so the visible caption was decorative as far as AT was concerned. Both
  were converted in place to `<label htmlFor>` keeping the identical
  `text-[11px] text-slate-500` classes, and each input got the matching `id`.
  The only behavioural delta is that clicking the caption now focuses the input.
  The Product URL input (icon only, no adjacent text) uses `aria-label`
  instead, per the audit's "where a visible label is not suitable" allowance.
- Chatbot.jsx: the message composer sits in a `flex gap-3` row where a visible
  label would break the design, so it uses an `sr-only` label ("Message") plus
  `id={messageInputId}` from a new `useId()`.
- No `placeholder` value, `className`, handler, state or render path was
  changed. Layout is provably unaffected: `sr-only` is `position: absolute`,
  and a `<label>` is an inline box, so the converted captions render exactly as
  the `<span>`s did.
- `.sr-only` was already an established utility in this codebase (the A1 dialog
  heading in PaymentModal.jsx), and was confirmed to be emitted in the Tailwind
  build output.

Additional live placeholder-only inputs found during the required A3 sweep
(same defect, same issue — repo-wide `placeholder=` sweep, following the A2
precedent):
- PaymentModal.jsx amount input — the worst case: `placeholder="0"` with no
  `name` and no other identifier at all.
- AddGoalFromLink.jsx Product URL input.
- Chatbot.jsx message input.

Deliberately NOT changed:
- `Login.jsx:79,98`, `Register.jsx:65,84,103` and `Goals.jsx:321,333` render a
  visible `<label>` but do not associate it (no `htmlFor`/`id`, no wrapping).
  Those are NOT placeholder-only inputs, so "visible label not associated" is a
  different defect class than A3's title. A different issue is needed for them;
  do NOT fold them into another issue silently.
- `GoalCard.jsx` is dead code scheduled for removal under D1, so it was NOT
  modified and remains unlabelled. Tracked under D1.
- Format hints such as `"Phone number (10 digits)"` were deliberately left in
  the `placeholder` only. Promoting them to a visible or `aria-described` hint
  would alter the current design, so it is out of A3 scope.
- No A1/A2 work was redone. Modal close controls already had `aria-label`s.
- No source file, layout, styling, or behaviour was refactored.
- No backend changes.

Verification:
- Targeted `npx eslint src/pages/SetupProfile.jsx src/components/PaymentModal.jsx
  src/components/AddGoalFromLink.jsx src/pages/Chatbot.jsx`: the only error is
  the pre-existing C4 dead-code `avatarColors` in PaymentModal.jsx:5.
  SetupProfile.jsx, AddGoalFromLink.jsx and Chatbot.jsx are clean.
- `npm run lint`: the same 9 pre-existing C4 violations (ContactCard.jsx,
  PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same rules, same count
  as the pre-change baseline. NOT fixed (C4 dead-code violations).
- `npm run build` passed (`tsc -b && vite build`). The >500 kB chunk-size
  warning is pre-existing (see P1).
- `.sr-only` rule confirmed present in the emitted `dist/assets/index-*.css`.
- `git diff --stat` confirmed label/aria wiring only (4 files, +47 / -10).
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.

LIMITATIONS:
- No automated browser / screen-reader verification exists in this project
  (no test framework, no test files). The accessible-name wiring was verified
  by source review, the ESLint/TypeScript build and the CSS output check only.
- The additional inputs listed above were not in the audit's original line
  list; if the user considers that scope too wide, they can be reverted
  independently without affecting the audit-named locations.

USER CONFIRMED A3 IS COMMITTED AND PUSHED.

---

## A4 — Native `alert()` for inline validation errors

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Files changed:
- frontend/src/components/PaymentModal.jsx

Scope check performed BEFORE any edit (the recorded audit line numbers had
drifted, so the current source was swept instead of trusting them):
- A repo-wide sweep for `alert(`, `window.alert`, `confirm(`, `window.confirm`
  and `prompt(` across `frontend/src` found exactly TWO native dialogs in the
  whole frontend.
- `frontend/src/components/PaymentModal.jsx` — audit recorded `:25`, actual
  position `:32` (A1 and A3 added dialog ARIA / focus-trap code and three
  `useId()` hooks above it). This was the ONE real A4 validation defect.
- `frontend/src/pages/Dashboard.jsx` — audit recorded `:118`, but the file now
  contains NO `alert()` at all. ALREADY RESOLVED BY F4 (see below).
- `frontend/src/pages/Goals.jsx` — audit recorded `:183`, actual position
  `:189`. Present, but it is NOT a validation error (see below).

Root cause:
- `PaymentModal.jsx` validated the phone number correctly but reported the
  failure through the native `window.alert()`. A native alert is a blocking,
  OS-styled dialog that ignores the app's dark theme, interrupts and steals
  focus from the dialog A1 had just made focus-trapped, and bypassed the
  component's own `error` state, which C3 had already built for exactly this
  purpose. The validation LOGIC was correct — only the reporting channel was
  wrong.

Already resolved — Dashboard.jsx (verified, NOT modified again):
- F4 (commit `c6ec338`, "Fix(frontend) : Validate UPI QR codes") had already
  replaced the original `alert("Invalid UPI QR")` with a `setScanError(...)`
  call plus a new `scanError` state and an inline `AlertCircle` banner — which
  is exactly the pattern A4 mandates. Confirmed via
  `git log -S "alert(" -- frontend/src/pages/Dashboard.jsx` and by reading the
  pre-F4 source at `39d88f9`. No Dashboard.jsx change was needed or made.
  (F6 later added that banner's `aria-label`.)
- DO NOT create a second Dashboard fix for A4.

Deliberately NOT changed:
- `frontend/src/pages/Goals.jsx:189` still contains
  `alert(message || \`🎉 Purchased "${goal.name}" for ₹…!\`)`. That is the
  fallback SUCCESS confirmation used when a goal has no `goal.url` to open, so
  it fires after a successful purchase and never on a validation failure. It is
  therefore NOT an A4 inline validation error. It was left untouched because the
  only inline pattern in that file is the red ERROR banner, and rendering
  "🎉 Purchased …" in a red error box would be a UX regression and a misuse of
  the error pattern. It also sits directly on the code path covered by the
  pending issue E6 ("Buy success can be invisible if `window.open` is blocked"),
  so it needs a proper SUCCESS-notification treatment rather than a hasty A4
  patch. If the user later decides this belongs to A4, it must be raised as a
  new decision — do NOT silently convert it to `setError(...)`.
- No `role="alert"` / `aria-live` was added to the error banner. C3's, F6's and
  F4's existing banners all lack one, so adding it only in PaymentModal would
  break the established convention. Possible separate consistency issue.
- The error is not cleared on field edit — the user corrects the number and
  presses Pay again, which clears it. Live re-validation would be new
  behaviour, so it was left alone.
- The error-handling architecture was NOT redesigned: no shared component, no
  toast/notification library, no centralization.
- No source file, layout, styling, or behaviour was refactored.
- No backend changes.

Fix:
- `PaymentModal.jsx` `handlePay()`: `alert(...)` was changed to the EXISTING
  `setError(...)` call. The message wording is preserved verbatim
  ("Please enter a valid 10-digit phone number"), and the error renders in the
  pre-existing C3 red-tinted `AlertCircle` box between the note field and the
  Pay button. No new state, no new CSS, no new component.
- Behaviour preserved: the early `return` is unchanged, so no payment request
  is fired on invalid input and `processing` is never set (the C3 in-flight
  guard is unaffected). The error lifecycle is correct because `setError(null)`
  runs after this check, so a stale error is replaced by the validation message
  and a subsequent valid attempt clears it.
- `frontend/src/components/PaymentModal.jsx` was the ONLY file modified for A4
  (2 insertions, 2 deletions — the `alert(...)` call and its now-obsolete
  `// simple inline alert` comment).
- `Backend/` was untouched.

Verification:
- Targeted `npx eslint src/components/PaymentModal.jsx`: the only error is the
  pre-existing C4 dead-code `avatarColors` at PaymentModal.jsx:5. No new
  violations.
- `npm run lint`: the same 9 pre-existing C4 violations (ContactCard.jsx,
  PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same rules, same count
  as the pre-change baseline. NOT fixed (C4 dead-code violations).
- `npm run build` passed (`tsc -b && vite build`). The >500 kB chunk-size
  warning is pre-existing (see P1).
- Post-fix `alert()` sweep across the frontend: the only remaining native
  dialog is the non-validation success message at `Goals.jsx:189`. No native
  `alert()` remains in any validation path.
- `git status --porcelain` showed only
  `M frontend/src/components/PaymentModal.jsx`.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.

LIMITATIONS:
- No automated browser / screen-reader verification exists in this project
  (no test framework, no test files). The change was verified by source
  review, ESLint, the TypeScript/Vite build, and a post-fix grep only.
- A4 did not eliminate every native `alert()` in the app — the Goals.jsx
  success message remains by design (see "Deliberately NOT changed").

USER CONFIRMED A4 IS COMMITTED AND PUSHED.

---

## A5 — Low-contrast text and no reduced-motion handling

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Files changed (14 — the commit stat is +83 / -64):
- frontend/src/index.css
- frontend/src/components/AddGoalFromLink.jsx
- frontend/src/components/GoalRow.jsx
- frontend/src/components/GoalsTable.jsx
- frontend/src/components/Navbar.jsx
- frontend/src/components/PaymentModal.jsx
- frontend/src/components/PredictionGraph.jsx
- frontend/src/components/PriorityGoalCard.jsx
- frontend/src/components/RoundUpPopup.jsx
- frontend/src/components/TransactionList.jsx
- frontend/src/pages/Chatbot.jsx
- frontend/src/pages/Goals.jsx
- frontend/src/pages/Login.jsx
- frontend/src/pages/Register.jsx

Note: A5 was the FIRST issue in this workflow with no recorded audit locations,
so the concrete scope was derived by read-only inspection before any edit, as
the A5 NEXT ISSUE entry required. A1-A4 each named files/lines; A5 named none.

Root cause (two independent halves):
- Reduced motion: `index.css` defines five custom animations (`.animate-fadeIn`,
  `.animate-slideUp`, `.animate-progressFill`, `.animate-float` (infinite) and
  `.animate-pop`) plus transitions inside `.btn-emerald`, `.tag` and
  `.card-hover`. Components add Tailwind `animate-spin` / `animate-pulse` /
  `animate-bounce` and roughly 90 `transition-*` utilities. NOT ONE of them was
  gated on the user's OS "reduce motion" preference — there was no
  `prefers-reduced-motion` query and no Tailwind `motion-reduce:` variant
  anywhere in the codebase.
- Low contrast: the app renders light text on very dark surfaces (`body` is
  `#030617`; cards are translucent `slate-800/50` / `slate-900/50` over it).
  Two greys in the app's OWN token scale fall below WCAG AA 4.5:1 on every
  background the app actually uses. Measured with the WCAG relative-luminance
  formula, not eyeballed:
  - `text-slate-400` `#94a3b8` — 7.86:1 (body) / 6.96:1 (card) / 6.96:1
    (slate-900) => PASSES AA.
  - `text-slate-500` `#64748b` — 4.23:1 / 3.75:1 / 3.75:1 => FAILS 4.5:1
    EVERYWHERE.
  - `text-slate-600` `#475569` — 2.66:1 / 2.36:1 / 2.36:1 => FAILS 4.5:1 AND
    the 3:1 non-text threshold.
  - `text-accent` `#06b6d4` — 8.28:1 and `text-primary` `#16a34a` — 6.10:1 both
    PASS, so they were left alone.
  Because the failure is UNIFORM (`slate-500` misses 4.5:1 on the lightest
  surface in the app), there was no defensible per-element judgement call and
  no reason to fix only "some" occurrences.

Reduced-motion fix — `frontend/src/index.css` (one block after `.animate-pop`):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
- Uses `0.01ms` rather than `animation: none` on purpose. Removing the animation
  would strand elements at their PRE-animation value — `fadeIn` would leave
  modals transparent, `slideUp` would leave them offset 40px, `progressFill`
  would leave bars at 0% width. Collapsing the duration lets each animation run
  instantly and land on its final state.
- `animation-iteration-count: 1` also neutralises the infinite `animate-float`.
- Because the entire block is inside a media query, the default appearance for
  users WITHOUT the setting is bit-for-bit unchanged.

JS smooth-scroll fix — `frontend/src/pages/Chatbot.jsx`:
- `scrollIntoView({ behavior: "smooth" })` could NOT be suppressed by the CSS
  above, because an explicit JS `behavior` option takes precedence over the
  `scroll-behavior` property. It is now guarded:
  `const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;`
  then `scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" })`.

Contrast fix — a single mechanical token correction across the 13 live files:
- `text-slate-500` -> `text-slate-400` (all variants, including `hover:`,
  `group-hover:` and `placeholder:text-slate-500`)
- `text-slate-600` -> `text-slate-400`
- `placeholder-slate-500` / `placeholder-slate-600` -> `placeholder-slate-400`
- This targets the NEAREST ALREADY-PASSING token in the app's own scale. No new
  colours, no `@theme` edits, no re-theming of the app. Every affected element
  moves from 2.36-4.23:1 to 6.96:1.
- No markup, logic, class structure or component API changed; the diff is
  colour tokens only.

Deliberately NOT changed:
- Dead code D1-D4, which still contains the failing tokens:
  `GoalCard.jsx` (2 occurrences), `ProgressBar.jsx` (1), `SavingsCard.jsx` (1),
  and the 2 occurrences inside `TransactionList.jsx:87-88` (the unused summary
  bar). These are D1, D2, D3 and D4 respectively, so they were left untouched
  per the standing instruction not to modify D1-D7. They are unrendered, so
  they cause no user-visible contrast failure today, and they will disappear
  with the dead-code items.
- Non-text `slate-500` / `slate-600` usages were PRESERVED: `border-slate-600/50`,
  `border-slate-600/40`, `bg-slate-700/40`, `divide-slate-700/20`, the custom
  scrollbar colours, and the Chatbot typing-dot `bg-slate-500`. Borders and
  backgrounds are not text, and altering them would have changed the design.
- `TransactionList.jsx:52` — the empty-state `Receipt` icon uses
  `text-slate-700`, which computes to 1.94:1 (below even the 3:1 non-text
  threshold). It was deliberately NOT changed: it is arguably decorative, it
  sits beside the PASSING "No transactions yet" heading in `text-slate-400`,
  and `text-slate-700` is used the same decorative way in `GoalsTable.jsx:29`.
  The WCAG 1.4.3 decorative exemption was judged to apply rather than invent a
  target for it.
- `AddGoalFromLink.jsx:151` — `disabled:text-slate-500` was caught by the token
  sweep and became `disabled:text-slate-400`. Disabled controls are WCAG-exempt
  so this was not required; it very slightly reduces how "muted" the disabled
  Fetch button looks. Trivially revertable.
- The 9 pre-existing C4 lint violations were NOT fixed.
- No source file, layout, styling, or behaviour was refactored beyond the above.
- No backend changes.

Verification:
- Targeted `npx eslint` on all 13 changed JSX files: 3 errors, all pre-existing
  C4 dead code — `PaymentModal.jsx:5` `avatarColors`, `RoundUpPopup.jsx:2`
  `ArrowUp`, `RoundUpPopup.jsx:20` `walletBalance`. The other 11 files clean.
- `npm run lint`: the same 9 pre-existing C4 violations (ContactCard.jsx,
  PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same rules, same count
  as the pre-change baseline. NO NEW VIOLATIONS INTRODUCED. NOT fixed.
- `npm run build` passed (`tsc -b && vite build`, 2381 modules). Re-run after the
  TransactionList cleanup. The >500 kB chunk-size warning is pre-existing (P1).
- Built-CSS check: `prefers-reduced-motion` confirmed present in the emitted
  `dist/assets/index-*.css`.
- Token sweep after the fix: zero `text-slate-500/600` and zero
  `placeholder-slate-500/600` remain in any LIVE file.
- EOL integrity: all 14 files verified 0 bare-LF (the repo uses
  `core.autocrlf=true` with CRLF). One stray bare LF and one indentation slip in
  `TransactionList.jsx` were caught and corrected mid-task; the final diff there
  is 4 clean one-token lines.
- `git diff --stat` confirmed 14 files, +83 / -64, all A5-related.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- `git status --porcelain` at commit time showed only the 14 A5 frontend files.
- No later issue (P1-P4, D1-D7, E1-E8) was started.

LIMITATIONS:
- No automated browser / screen-reader verification exists in this project
  (no test framework, no test files). The contrast numbers were computed from
  the WCAG relative-luminance formula against the app's own three real
  background values, and the media query was confirmed present in the built
  CSS, but NEITHER was confirmed in a rendering engine.
- The result was NOT visually inspected. The change is uniform and predictable,
  but secondary text across the app is now one step lighter, so a designer may
  want to eyeball it.
- The contrast fix is broader than a "spot fix". A5 named no locations, so the
  whole failing token class was fixed rather than cherry-picking elements. If
  this is judged too wide, the 13 files are independent and revert cleanly.
- This does not address WCAG 2.3.3 in general — it only makes the app HONOUR
  the preference. Motion that is essential (e.g. the `progressFill` bar) is now
  instant rather than removed.

USER CONFIRMED A5 IS COMMITTED AND PUSHED.

---

## P1 — Large main bundle / no route-level code splitting

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

File changed:
- frontend/src/App.tsx

Committed as `50b0e92` "Fix(frontend) : Reduce initial bundle with route-level
code splitting" (1 file, +28 / -16).

Root cause:
- `App.tsx` statically imported all six page components at module scope
  (`import Login from "./pages/Login"` and so on). Because `App.tsx` is the
  static entry graph (via `main.tsx`) and eagerly rendered all of them through a
  single `<Routes>` block, the bundler had no dynamic boundary anywhere in the
  app. Every page AND its entire private component tree collapsed into the one
  main chunk — including `recharts` (~371 kB, reached via `Goals` →
  `PredictionGraph`) and the whole payment / QR / transaction modal surface
  reached via `Dashboard`. The build emitted Vite's explicit
  `(!) Some chunks are larger than 500 kB ... Consider: Using dynamic import() to
  code-split the application` warning.

Fix:
- The six page imports were converted to `React.lazy()` dynamic imports:
  `const Login = lazy(() => import("./pages/Login"));` and likewise for
  `Register`, `Dashboard`, `Goals`, `Chatbot` and `SetupProfile`.
  All six pages already had default exports, so no export shape changed and no
  `vite.config.ts` change or `manualChunks` was needed.
- `<Routes>` is wrapped in a single `<Suspense>` boundary. It sits INSIDE the
  existing layout div and AFTER `{!hideNavbar && <Navbar />}`, so the gradient
  shell and the Navbar still render immediately and never flash behind the
  fallback.
- The `Suspense` fallback REUSES the app's existing loading UI, copied verbatim
  from the existing Dashboard loading state (`Dashboard.jsx:195-196`):
  `<div className="flex items-center justify-center h-[60vh]">` with
  `<Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />`.
  `Loader2` comes from `lucide-react`, which was already a dependency already
  used across the app, so no new dependency and no new styling were introduced.
- All eight route declarations are UNCHANGED: `/`, `/login`, `/register`,
  `/dashboard`, `/setup-profile`, `/goals`, `/chat` and the `*` catch-all. No
  path, `element`, `Navigate` target or `replace` prop was altered.
- Incidental only: the `/setup-profile` route line had broken indentation at
  HEAD (`  <Route ...>`); it was re-indented to match its siblings.
- No backend, Vite, TypeScript or ESLint configuration change. No new file.
  No new dependency.

Deliberately NOT changed:
- `Navbar` stays eagerly imported. It is the app shell rendered on every
  non-auth route, so lazy-loading it would only delay navigation; it is not a
  route.
- The routing architecture was NOT rewritten. Still one `BrowserRouter` in
  `main.tsx`, one `<Routes>`, one `AppLayout`. No loaders, no `defer`, no lazy
  `Navbar`, no error boundary.
- Google OAuth handling in `main.tsx` is untouched and unaffected: it reads
  `?token=`, writes `localStorage`, strips the query with `history.replaceState`
  and redirects BEFORE `createRoot(...).render()`, so no lazy component is
  involved in that flow.
- The per-page auth guards were NOT moved into the router. Each page still runs
  its own `localStorage` / token guard in a `useEffect` and calls
  `navigate("/login")` itself. The only observable delta is that a guard now
  fires after its chunk resolves, so an unauthenticated deep link shows the
  spinner briefly before redirecting. Redirect destinations and token clearing
  are unchanged.
- The 9 pre-existing C4 lint violations were NOT fixed.
- `recharts` was NOT split into its own chunk. Splitting a third-party library
  is a library-level optimisation, not route-level code splitting, and was
  outside P1's stated scope.
- No bundle-size targets or performance requirements were invented. Only
  measured before/after numbers are recorded.
- No UI, layout, styling, state-management or asset change. No accessibility
  change. No re-doing of A1-A5. No dead-code (D1-D7) or edge-case (E1-E8) work.
- No later issue (P2, P3, P4, D1-D7, E1-E8) was started.

Build evidence (baseline captured by stashing `App.tsx` to HEAD, building, then
restoring — measured, not estimated):

| | BEFORE | AFTER |
| --- | --- | --- |
| Main entry chunk | 696.36 kB (gzip 209.51 kB) | 229.54 kB (gzip 73.59 kB) |
| JS chunks emitted | 2 | 17 |
| Route page chunks | 0 | 6 |
| >500 kB chunk warning | present | gone |

- Main entry reduced from 696.36 kB to 229.54 kB, i.e. −466.82 kB raw
  (−67.0%).
- gzip reduced from 209.51 kB by 135.92 kB, to 73.59 kB (−64.9%).
- Route-specific chunks were emitted: `Login` 4.53 kB, `Register` 4.42 kB,
  `SetupProfile` 2.84 kB, `Chatbot` 5.74 kB, `Dashboard` 31.95 kB,
  `Goals` 371.52 kB, plus shared `api` 36.66 kB, `jsx-runtime` 8.52 kB,
  `createLucideIcon` 1.19 kB and six tiny per-icon chunks.
- `Goals` / `recharts` moved off the initial entry chunk: `recharts` is present
  in the `Goals` chunk and absent from the main entry chunk (`ResponsiveContainer`
  likewise). Page-specific UI literals ("Continue with Google",
  "Create your account", "Add to Goals", "Scan UPI QR", "Payment Successful",
  "Send Money", "Ask PennyWise") are all absent from the main entry chunk, which
  now holds only the shell: React, the router and Navbar.
- The emitted `dist/index.html` loads only the 229.54 kB entry chunk plus
  `modulepreload` for `jsx-runtime` and `createLucideIcon`. NO page chunk is
  preloaded — they are fetched on demand.
- Module count was identical before and after (2381), and the CSS output was
  byte-identical (`index-B4_6plzD.css` 67.18 kB both builds), so nothing was
  dropped — only re-bucketed.

Verification:
- Targeted `npx eslint src/App.tsx`: clean, 0 problems.
- `npm run build` passed (`tsc -b && vite build`, 2381 modules, clean `dist`
  rebuild).
- `npm run lint`: exactly the same 9 pre-existing C4 violations
  (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same
  rules, same count as the pre-change baseline. NO NEW VIOLATIONS INTRODUCED.
  NOT fixed.
- All eight routes verified still declared in `App.tsx`: `/login`, `/register`,
  `/dashboard`, `/setup-profile`, `/goals`, `/chat` (plus `/` and the `*`
  catch-all).
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- `git diff --stat` confirmed a single file: `frontend/src/App.tsx`, +28 / -16.
- The P1 commit `50b0e92` touches `frontend/src/App.tsx` ONLY. It does not
  touch `Backend/` and does not touch any of the four C4 files.
- No test framework and no browser / E2E verification exists in this project,
  so splitting was proven by build artifacts and content probes rather than by
  observing network requests in a browser.

LIMITATIONS:
- No browser / E2E verification exists in this project (no test framework, no
  test files). Route-level splitting was verified by build output, chunk
  inspection and string probes only. Dev-mode on-demand fetching was not
  manually exercised.
- The `Goals` chunk remains large at ~371.52 kB because it statically imports
  `recharts` through `PredictionGraph`. It is now off the critical path, but it
  was deliberately NOT split further.
- No error boundary was added. If a page chunk 404s (stale hashed asset after a
  deploy without a cache purge) React will throw. This matches the pre-change
  behaviour — no error boundary existed before either — and adding one would be
  scope creep.
- No bundle-size targets were set, so this issue has no numeric acceptance
  criterion beyond the measured before/after reduction recorded above.

USER CONFIRMED P1 IS COMMITTED AND PUSHED.

---

## P2 — Unused server dependencies in frontend package

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Original audit finding:

Backend-only packages incorrectly listed as frontend dependencies.

Files changed:
- frontend/package.json
- frontend/package-lock.json

Committed as `0c044b3` "Fix(frontend) : Remove unused server dependencies"
(2 files, +9 / -1061).

Root cause:
- `frontend/package.json` declared three Node/Express SERVER packages in the
  browser app's `dependencies`: `cheerio@^1.2.0`, `cors@^2.8.6` and
  `express@^5.2.1`. All three are server-side (`express` HTTP framework, `cors`
  Express middleware, `cheerio` server-side HTML scraping) and are declared in,
  and used by, `Backend/package.json`.
- A repo-wide sweep of `frontend/` for `express|cors|cheerio` found matches in
  exactly TWO files — `frontend/package.json` and `frontend/package-lock.json` —
  and ZERO in `src/`, `vite.config.ts`, `eslint.config.js`, `index.html` or any
  tsconfig. They were therefore pure dead weight in the frontend manifest,
  inflating every frontend install with 79 extra packages and misleadingly
  advertising the frontend as an Express application.
- `axios` was deliberately KEPT. It appears in both manifests but is genuinely
  used by the frontend (`src/services/api.js`).

Fix:
- Removed exactly three entries from `frontend/package.json` `dependencies`;
  nothing else. `dependencies` is now `@tailwindcss/vite`,
  `@yudiel/react-qr-scanner`, `axios`, `lucide-react`, `react`, `react-dom`,
  `react-router-dom`, `recharts`, `tailwindcss`.
- `frontend/package-lock.json` was regenerated with
  `npm install --package-lock-only` so it stays in sync with `package.json`.
  Editing `package.json` alone would have desynced the lockfile and made
  `npm ci` fail with "package.json and package-lock.json are not in sync", so
  the lockfile sync is part of the fix, not scope creep.
- Nothing was MOVED to `devDependencies`. These packages belong nowhere in the
  frontend manifest, because the backend declares its own copies.
- No source file, config file, or `Backend/` file was touched.

Deliberately NOT changed:
- `Backend/package.json` still declares its own `express@^4.21.2`,
  `cors@^2.8.5` and `cheerio@^1.2.0`. This was inspected read-only to identify
  which packages are backend-only and was NOT modified. Note the backend
  intentionally pins different major/range values than the frontend had
  (`express@^4` vs the frontend's `^5.2.1`, `cors@^2.8.5` vs `^2.8.6`); that
  divergence is the backend's business and was left alone.
- `@tailwindcss/vite` and `tailwindcss` remain in `dependencies`. They are
  build-time-only and would conventionally belong in `devDependencies`, but they
  are NOT backend-only packages, so this is a different concern from P2's
  finding. Recorded here as an observation only — do NOT treat it as a new
  issue and do NOT fold it into another issue.
- A stray `frontend/frontend/.lint-test/comp.jsx` exists (leftover from the C4
  lint-coverage work). It is unrelated to dependencies and was left untouched.
- The 9 pre-existing C4 lint violations were NOT fixed.
- No source file, layout, styling, behaviour or accessibility change. No new
  dependency added and NO dependency version changed anywhere.
- No later issue (P3, P4, D1-D7, E1-E8) was started.

Lockfile impact (verified mechanically by diffing every entry before/after):
- **0** retained packages had a version change.
- **0** entries added.
- **82** entries removed — exactly `cheerio`, `cors`, `express` and their
  exclusive transitive trees: `accepts`, `body-parser`, `boolbase`, `bytes`,
  `call-bound`, `cheerio-select`, `content-disposition`, `content-type`,
  `cookie-signature`, `css-select`, `css-what`, `dom-serializer`,
  `domelementtype`, `domhandler`, `domutils`, `ee-first`, `encodeurl`,
  `encoding-sniffer`, `entities`, `escape-html`, `etag`, `finalhandler`,
  `forwarded`, `fresh`, `htmlparser2`, `http-errors`, `iconv-lite`, `inherits`,
  `ipaddr.js`, `is-promise`, `media-typer`, `merge-descriptors`,
  `negotiator`, `nth-check`, `object-assign`, `object-inspect`,
  `on-finished`, `once`, `parse5`, `parse5-htmlparser2-tree-adapter`,
  `parse5-parser-stream`, `parseurl`, `path-to-regexp`, `proxy-addr`, `qs`,
  `range-parser`, `raw-body`, `router`, `safer-buffer`, `send`,
  `serve-static`, `setprototypeof`, `side-channel`, `side-channel-list`,
  `side-channel-map`, `side-channel-weakmap`, `statuses`, `toidentifier`,
  `type-is`, `undici`, `unpipe`, `vary`, `whatwg-encoding`, `whatwg-mimetype`,
  `wrappy`.

Verification:
- Repo-wide sweep for `express|cors|cheerio` across `frontend/`: matches only in
  `package.json` and `package-lock.json`; zero real usage in source or config.
- `package.json` and `package-lock.json` are SYNCHRONIZED (root dependency lists
  compared programmatically — identical, order preserved).
- `npm ci --dry-run` succeeded with "up to date", closing the desync failure
  mode.
- A real reinstall from the new lockfile completed
  (`added 215 packages, removed 12, changed 54`). `node_modules` afterwards
  contains NO `express`, `cors` or `cheerio`, while every genuine frontend
  dependency is still present.
- `npm ls --depth=0` reported a clean tree of 21 packages with no missing or
  invalid dependencies and no server packages.
- `npm run build` passed (`tsc -b && vite build`, 2381 modules — the same module
  count as before the change).
- Bundle output remains BYTE-IDENTICAL to the P1 baseline: the same hashed
  filenames and sizes were emitted (`index-BLTMO660.js` 229.54 kB / gzip
  73.59 kB, `Goals-djeLjkya.js` 371.52 kB, `Dashboard-DWb27MDv.js` 31.95 kB,
  etc.). This confirms zero runtime or bundle impact — these packages were
  never bundled in the first place. The benefit is a correct manifest and a
  79-package-smaller frontend install, NOT a smaller bundle.
- `npm run lint`: exactly the same 9 pre-existing C4 violations
  (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same
  rules, same count as the pre-change baseline. NO NEW VIOLATIONS INTRODUCED.
  NOT fixed.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- The P2 commit `0c044b3` touches ONLY `frontend/package.json` and
  `frontend/package-lock.json`. It does not touch `Backend/`, `frontend/src/`,
  or any frontend config file (`vite.config.ts`, `eslint.config.js`,
  `index.html`, `tsconfig*.json`).

LIMITATIONS:
- `npm ci` initially FAILED with `EPERM` on
  `node_modules/@rolldown/binding-win32-x64-msvc/rolldown-binding.win32-x64-msvc.node`.
  Cause: a `vite preview --port 4173` server that was already running held that
  native binary open. The failed `npm ci` had already begun deleting
  `node_modules`, leaving it partial (`react` and `tailwindcss` missing). It was
  restored with `npm install`, which succeeded. The final state was verified
  correct afterwards (193 package directories, clean `npm ls`, build and lint
  both green). The user's running preview server was NOT killed.
- ONE leftover npm temp staging directory remains:
  `node_modules/@tailwindcss/.node-AdpGeKIR`. It could not be deleted for the
  same reason — it holds a `lightningcss.win32-x64-msvc.node` that the running
  preview server has open. It is INSIDE gitignored `node_modules`, so it does
  not affect the repository, the commit or the build, and it will disappear the
  next time `node_modules` is reinstalled after the preview server is stopped.
- The build emitted a one-off informational `[PLUGIN_TIMINGS]` notice and took
  34.97 s instead of ~0.4 s. This was a cold-cache / reinstall artifact of the
  dependency tree being rebuilt on disk, NOT a regression — the emitted chunk
  hashes and sizes were identical.
- No test framework and no browser / E2E verification exists in this project,
  so runtime behaviour was verified by build output and content comparison
  rather than in a browser. No dev server was started and the user's running
  preview server was left undisturbed.
- The removal changes nothing that ships to users. If a reviewer expects a
  bundle-size win from this issue, there is none — the packages were already
  unbundled dead entries in the manifest.

USER CONFIRMED P2 IS COMMITTED AND PUSHED.

---

## P3 — Dashboard profile-check effect runs on every render

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Original audit finding:

Dashboard profile-check effect runs on every render.

Files changed:
- frontend/src/pages/Dashboard.jsx

Committed as `b183b49` "Fix(frontend) : Prevent dashboard profile-check effect
reruns" (1 file, +6 / -2).

Root cause:
- `Dashboard.jsx` parsed the stored profile on every render:
  `const user = JSON.parse(localStorage.getItem("pennywise_user") || "{}");`
  so `user` was a brand-new object identity on every render.
- The profile-check effect that redirects to `/setup-profile` listed that
  recreated object in its dependency array (`[navigate, user]`), so React saw a
  changed dependency on every render and re-ran the effect even when the actual
  profile data had not changed.
- Every unrelated Dashboard state change (`goals`, `totalSavings`, `loading`,
  `txRefreshKey`, `paymentModal`, `roundUpPopup`, `scannerOpen`, `scanError`,
  `allContactsOpen`, focus-trap internals) therefore re-executed the profile
  check and re-issued the redirect decision.

Fix:
- Two stable primitive values were read from the parsed user:
  `const userPhoneNumber = user?.phoneNumber;` and
  `const userAccountNumber = user?.accountNumber;`
- The effect now depends on `[navigate, userPhoneNumber, userAccountNumber]`
  instead of the recreated `user` object, and its guard reads those primitives.
- The effect now re-runs only when the phone number or account number actually
  changes value, never because of an unrelated re-render.
- The redundant `!user` check was dropped: with the existing `|| "{}"` fallback
  `user` is always a truthy object, and `!userPhoneNumber` covers the same cases
  (a missing key or a null store both yield `undefined`).
- The `user` variable itself was left in place and unchanged, because the
  greeting still reads `user.name?.split(" ")[0]`.
- No visible UI change. No route, redirect target or token handling changed.

Deliberately NOT changed:
- `pennywise_user` is still parsed once per render, because the greeting reads
  it and the parse is cheap. Only the effect's DEPENDENCY was made stable; the
  parse itself was not moved into a `useMemo` or a module-level read.
- The redirect target `/setup-profile` and the completeness rule
  (phone number AND account number) are unchanged, so the C2 required-field
  behavior is preserved.
- The separate auth guard and 401 handling in `fetchData` (token check,
  `navigate("/login")`, `localStorage.removeItem("token")`) were NOT touched.
- Google OAuth handling in `main.tsx` and `Login.jsx` was NOT touched.
- No other `useEffect` in Dashboard was modified. The `fetchData` effect was
  already correctly memoized with `useCallback`.
- The 9 pre-existing C4 lint violations were NOT fixed.
- No source file, layout, styling or behaviour was refactored beyond the above.
- No backend changes.
- No later issue (P4, D1-D7, E1-E8) was started.

Verification:
- Targeted `npx eslint src/pages/Dashboard.jsx`: clean, 0 problems.
- `npm run build` passed (`tsc -b && vite build`). Bundle output matches the P2
  baseline (entry `index-*.js` 229.54 kB / gzip 73.59 kB, CSS 67.18 kB,
  `Goals` 371.52 kB, `Dashboard` 31.96 kB). The `[PLUGIN_TIMINGS]` notice is the
  same informational notice recorded in P2, not a regression.
- `npm run lint`: exactly the same 9 pre-existing C4 violations
  (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same
  rules, same count as the pre-change baseline. NO NEW VIOLATIONS INTRODUCED.
  NOT fixed.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- The P3 commit `b183b49` touches ONLY `frontend/src/pages/Dashboard.jsx`. It
  does not touch `Backend/` and does not touch any of the four C4 files.
- Flow behavior verified by source review: a complete profile stays on the
  Dashboard, a missing phone or account number still redirects to
  `/setup-profile`, an absent token or absent `pennywise_user` behaves exactly as
  before, and logout / 401 is unaffected.

LIMITATIONS:
- No test framework and no browser / E2E verification exists in this project
  (no test framework, no test files). The effect no longer re-running on
  unrelated re-renders is established by dependency-identity reasoning and the
  source, not by observing effect executions in a browser. No temporary
  instrumentation was added.
- `user` is still re-parsed on every render (it feeds the greeting). The fix
  targets the dependency only.
- Mid-session changes to `pennywise_user` are still not observed reactively, as
  they were not before; the page does not subscribe to storage events.

USER CONFIRMED P3 IS COMMITTED AND PUSHED.

---

## P4 — Raw `<a href>` causes full-page reload in SPA

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Original audit finding:

Raw `<a href>` causes full-page reload in SPA.

Files changed:
- frontend/src/pages/Dashboard.jsx

Committed as `e854f90` "Fix(frontend) : Use React Router for internal goals link"
(1 file, +4 / -4).

Root cause:
- The app is a React Router SPA (`BrowserRouter` in `main.tsx`, routes in
  `App.tsx`, route-level code splitting added by P1). Any in-app link written
  as a raw `<a href="/some-route">` bypasses the router entirely: the browser
  treats it as a document navigation, tears down the React tree, re-downloads
  and re-executes the entry chunk, and re-runs every page-level effect
  (including the P3 profile check and the Dashboard `fetchData`).
- The established in-app pattern in this codebase is React Router's `Link`,
  already used in `Navbar.jsx`, `Login.jsx`, `Register.jsx` and
  `PriorityGoalCard.jsx`. The audit finding was that one live link did not
  follow it.
- A `git grep` for `<a` across the frontend sources (`.jsx`, `.tsx`, `.js`,
  `.ts`, `.html`) returned exactly FOUR occurrences, all in live rendered code.
  Only ONE of them was internal SPA navigation:

  | Location | href target | Classification |
  | --- | --- | --- |
  | `Dashboard.jsx:247` | `/goals` (internal SPA route) | Internal SPA navigation — CHANGED |
  | `GoalRow.jsx:64` | `goal.url` (external, `target="_blank"`) | Intentionally a normal anchor |
  | `GoalsTable.jsx:149` | `goal.url` (external, `target="_blank"`) | Intentionally a normal anchor |
  | `AddGoalFromLink.jsx:214` | `product.url` (external, `target="_blank"`) | Intentionally a normal anchor |

Fix:
- `Dashboard.jsx:247` — the "View Goals →" link in the Savings Wallet banner
  was a raw `<a href="/goals">` and is now React Router's `<Link to="/goals">`,
  matching the existing `Link to="/goals"` pattern already used twice in
  `PriorityGoalCard.jsx` for the same destination.
- The import on line 2 was widened from `{ useNavigate }` to
  `{ Link, useNavigate }`. `useNavigate` is still used elsewhere in the file and
  was kept.
- The `className` was left byte-identical
  (`text-xs font-semibold text-emerald-400 hover:text-emerald-300 whitespace-nowrap transition-colors`),
  so the visual appearance is unchanged. `Link` renders an `<a>` with an `href`,
  so the rendered element, styling and "View Goals →" text are identical — only
  the click is now handled by the router.
- The destination `/goals` is unchanged.
- No new dependency: `Link` comes from `react-router-dom`, which was already a
  dependency.

Deliberately NOT changed:
- The three external product-URL anchors (`GoalRow.jsx`, `GoalsTable.jsx`,
  `AddGoalFromLink.jsx`) were deliberately left as normal anchors. They point at
  third-party product pages, carry `target="_blank" rel="noopener noreferrer"`
  and an `ExternalLink` icon, and leave the application entirely, so routing
  them through `Link` would avoid no reload and could break the new-tab and
  referrer-security behavior. The `onClick={(e) => e.stopPropagation()}` handlers
  on the first two (which stop the parent row's selection click) were preserved
  untouched.
- `main.tsx:11-13` (`history.replaceState` + `location.replace("/dashboard")`)
  and `Login.jsx:63` (`window.location.href` to the backend `/auth/google`) were
  inspected read-only and left alone. Both are correct: the OAuth handling must
  run BEFORE React mounts (C1), and the Google URL is a cross-origin redirect
  that React Router must not intercept.
- There are no `mailto:`, `tel:`, `download` or hash/anchor (`#…`) links
  anywhere in the frontend, and no `<a>` in `index.html`, `App.tsx`,
  `Navbar.jsx`, `Goals.jsx`, `Chatbot.jsx` or `SetupProfile.jsx`.
- The three external anchors were NOT converted to buttons or wrapped in click
  handlers. No new routing approach, no `NavLink` conversion of existing
  `Link`s, and no Navbar markup change.
- The 9 pre-existing C4 lint violations were NOT fixed.
- No source file, layout, styling or behaviour was refactored beyond the above.
- No backend changes.
- `FIX_PROGRESS.md` was NOT modified during the P4 implementation.
- No later issue (D1-D7, E1-E8) was started.

Verification:
- Targeted `npx eslint src/pages/Dashboard.jsx`: clean, 0 problems.
- `npm run build` passed (`tsc -b && vite build`, 2381 modules — the same module
  count as the P3 baseline). Output sizes match the baseline: entry 229.54 kB /
  gzip 73.59 kB, CSS 67.18 kB, `Goals` 371.52 kB, `Dashboard` 31.96 kB. Hashes
  change as expected from the source edit. NO chunk-size warning.
- `npm run lint`: exactly the same 9 pre-existing C4 violations
  (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same
  rules, same count as the pre-change baseline. NO NEW VIOLATIONS INTRODUCED.
  NOT fixed.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- `git status --porcelain` showed only `M frontend/src/pages/Dashboard.jsx`;
  `git diff --stat` confirmed 1 file, +3 / -3 at commit time.
- The P4 commit `e854f90` touches ONLY `frontend/src/pages/Dashboard.jsx`. It
  does not touch `Backend/` and does not touch any of the four C4 files.
- Internal navigation for the P4 target now uses the router: clicking "View
  Goals →" no longer issues a document request, so no unnecessary full-page
  reload remains for the only internal raw anchor in the app.

LIMITATIONS:
- No test framework and no browser / E2E verification exists in this project
  (no test framework, no test files). The absence of a full-page reload was
  established by source review and the build output, NOT by observing network
  requests in a browser.
- Correct SPA fallback behavior on a static host (serving `index.html` for deep
  routes such as `/goals`) is a deployment concern and is unchanged from before.
- The three external product anchors remain anchors by design. If a future goal
  or product URL were ever an internal route, that classification would need to
  be revisited, but these are third-party product pages.

USER CONFIRMED P4 IS COMMITTED AND PUSHED.

---

## D1 — `GoalCard.jsx` is unused

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Original audit finding:

`GoalCard.jsx` is unused.

File changed:
- frontend/src/components/GoalCard.jsx (DELETED)

Committed as `9dd57ec` "Fix(frontend) : Remove unused GoalCard component"
(1 file, -49 / +0 — the file was deleted outright).

Root cause:
- `frontend/src/components/GoalCard.jsx` had zero live imports and zero live
  usages. A repo-wide sweep for `GoalCard` found no import of it anywhere in
  `frontend/src` and no JSX usage of it. The only component import of that name
  shape in `Dashboard.jsx` is `PriorityGoalCard`, which is a different component.
- The only remaining mentions of the name were documentation references, not
  code references.
- Because the component was unreachable, A2 deliberately skipped it (recorded as
  "dead code scheduled for removal under D1") and A5 deliberately left its
  failing `text-slate-500` contrast tokens in place unrendered.

Fix:
- `frontend/src/components/GoalCard.jsx` was DELETED. Nothing else was changed.
- No live import needed removing, because no live import existed.

Deliberately NOT changed:
- `ProgressBar.jsx` (D2), `SavingsCard.jsx` (D3), the TransactionList summary bar
  (D4), the default API export (D5), `react.svg` (D6) and the unused React
  import in QRScanner (D7) were NOT touched. Each is its own issue.
- No source file, layout, styling or behaviour was refactored beyond the deletion.
- No backend changes.
- The 9 pre-existing C4 lint violations were NOT fixed.
- `FIX_PROGRESS.md` was NOT modified during the D1 implementation.

Verification:
- Repo-wide `GoalCard` sweep confirmed zero live imports and zero live JSX
  usages; the only remaining matches were documentation text.
- `npm run build` passed (`tsc -b && vite build`) — the build succeeding is the
  load-bearing proof that no module imported the deleted file.
- `npm run lint`: exactly the same 9 pre-existing C4 violations
  (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same
  rules, same count as the pre-change baseline. NO NEW VIOLATIONS INTRODUCED.
  NOT fixed.
- `git diff --stat` confirmed a single deleted file (-49 lines) with no other
  file modified.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- The D1 commit `9dd57ec` touches ONLY the deleted
  `frontend/src/components/GoalCard.jsx`. It does not touch `Backend/` and does
  not touch any of the four C4 files.
- Working tree is clean after the push.

LIMITATIONS:
- No test framework and no browser / E2E verification exists in this project
  (no test framework, no test files). The component's unreferenced status was
  established by repo-wide text search plus a passing build, not by observing
  runtime behaviour.

USER CONFIRMED D1 IS COMMITTED AND PUSHED.

---

## D2 — `ProgressBar.jsx` only used by dead GoalCard

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Original audit finding:

`ProgressBar.jsx` only used by dead GoalCard.

File changed:
- frontend/src/components/ProgressBar.jsx (DELETED)

Committed as `3746e11` "Fix(frontend) : Remove unused ProgressBar component"
(1 file, -29 / +0 — the file was deleted outright).

Root cause:
- `frontend/src/components/ProgressBar.jsx` was authored in the initial commit
  (`1b6d8eb Basic frontend Structure`) alongside `GoalCard.jsx`, which imported
  it (`import ProgressBar from "./ProgressBar";`). The two were a dead-code pair:
  `GoalCard` was itself unreferenced, so `ProgressBar`'s only consumer was
  already dead code.
- D1 (`9dd57ec`) deleted `GoalCard.jsx`, which removed the last reference and
  left `ProgressBar` orphaned. It therefore had ZERO live consumers at the time
  D2 was picked up, and D2's job was to confirm that by inspection before
  deleting anything — not to trust the audit text.
- Because the component was unreachable, A5 deliberately left its one failing
  `text-slate-500` contrast token (recorded as "`ProgressBar.jsx` (1)") in place
  unrendered.

Reachability evidence gathered BEFORE deleting (per the D2 NEXT ISSUE
requirement not to assume the audit state is unchanged):

| # | Search | Result |
| --- | --- | --- |
| 1 | Case-insensitive `git grep -i "progressbar"` over all tracked files | 7 hits in 3 files — the component's own definition, `FIX_PROGRESS.md`, and `frontend/FRONTEND_README.md`. Zero code references. |
| 2 | Full import manifest — every `import` line across all 27 `frontend/src` files | Zero imports of `ProgressBar`. |
| 3 | Alias-resolution viability | `vite.config.ts` has no `resolve.alias`; `tsconfig.app.json` has no `compilerOptions.paths`. No `@/components/ProgressBar` form could resolve. |
| 4 | Barrel / re-export hubs | The only `index.*` file in `frontend/src` is `index.css` — there is no JS/TS barrel, so no re-export path exists. |
| 5 | `import(`, `lazy(`, `require(`, `createElement`, `Suspense` | Only the 6 route-level page lazies in `App.tsx` and `import("@yudiel/react-qr-scanner")` in `QRScanner.jsx`. No dynamic or lazy reference to `ProgressBar`. |
| 6 | `git log -S "ProgressBar" --all -- frontend/src` | Exactly 2 commits ever touched the name: `1b6d8eb` (added both files) and `9dd57ec` (D1, dropped the only import). |
| 7 | Do live components need a progress bar? | Yes, but they implement one inline: `GoalRow.jsx`, `GoalsTable.jsx` and `PriorityGoalCard.jsx` each compute and render their own. None import `ProgressBar`. |

Fix:
- `frontend/src/components/ProgressBar.jsx` was DELETED. Nothing else was changed.
- No live import needed removing, because no live import existed.

Deliberately NOT changed:
- `SavingsCard.jsx` (D3) was inspected read-only and imports only `lucide-react`
  icons — it does not reference `ProgressBar`, so D3 is unaffected. It was NOT
  modified.
- The TransactionList summary bar (D4), the default API export (D5),
  `react.svg` (D6) and the unused React import in QRScanner (D7) were NOT
  touched. Each is its own issue.
- The stale `ProgressBar.jsx` entry in the `frontend/FRONTEND_README.md`
  component tree was intentionally LEFT UNCHANGED. Documentation cleanup was
  explicitly out of scope for D2, so that file tree is now one entry out of
  date. Recorded here as an observation only — do NOT treat it as a new issue
  and do NOT fold it into another issue.
- No replacement component was introduced for it. Live components already render
  their own inline progress bars and were left alone.
- No consumer was refactored, because there were no consumers to refactor.
- No source file, layout, styling or behaviour was refactored beyond the deletion.
- No backend changes.
- The 9 pre-existing C4 lint violations were NOT fixed.
- `FIX_PROGRESS.md` was NOT modified during the D2 implementation.

Verification:
- Repo-wide post-delete sweep for `progressbar` confirmed NO live references
  remain; the only surviving matches are documentation text.
- Targeted `npx eslint src/components src/pages src/App.tsx`: 9 problems, all
  pre-existing C4 (`User`, `avatarColors`, 3× unused `e`, 2× `no-empty`,
  `ArrowUp`, `walletBalance`). NO NEW VIOLATIONS INTRODUCED.
- `npm run build` passed (`tsc -b && vite build`). Bundle output is byte-identical
  to the D1 baseline (`index-D46BqQ_2.js` 229.54 kB / gzip 73.59 kB,
  `index-CexWdzcL.css` 66.83 kB, `Goals-CmLepaNZ.js` 371.52 kB,
  `Dashboard-wLcJ0llC.js` 31.96 kB), which is the proof that it was never
  bundled. NO chunk-size warning.
- `npm run lint`: exactly the same 9 pre-existing C4 violations
  (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same
  rules, same count as the pre-change baseline. NOT fixed.
- `git diff --stat` confirmed a single deleted file (-29 lines) with no other
  file modified.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- The D2 commit `3746e11` touches ONLY the deleted
  `frontend/src/components/ProgressBar.jsx`. It does not touch `Backend/` and
  does not touch any of the four C4 files.
- Working tree is clean after the push.

LIMITATIONS:
- No test framework and no browser / E2E verification exists in this project
  (no test framework, no test files). The component's unreferenced status was
  established by repo-wide text search, git history and a passing build, not by
  observing runtime behaviour.
- The deletion removes the one `text-slate-500` occurrence A5 had flagged in this
  dead file. That resolves as a byproduct of D2, not as a separate
  accessibility fix.

USER CONFIRMED D2 IS COMMITTED AND PUSHED.

---

## D3 — `SavingsCard.jsx` is unused

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Original audit finding:

`SavingsCard.jsx` is unused.

Files changed:
- frontend/src/components/SavingsCard.jsx (DELETED)

Committed as `5a095ea` "Fix(frontend) : Remove unused SavingsCard component"
(1 file, -60 / +0 — the file was deleted outright).

Root cause:
- `frontend/src/components/SavingsCard.jsx` was authored in `ced2d88` ("Modified
  the dashboard") together with its ONLY consumer: a
  `import SavingsCard from "../components/SavingsCard";` plus a
  `<SavingsCard totalSavings activeGoals streak roundUpsToday />` block in
  `Dashboard.jsx`. The very next dashboard rewrite, `5a86e04` ("Removed the
  transaction page and modified the goals page"), deleted BOTH the import and the
  JSX, replacing the 4-tile stats grid with the inline Savings Wallet banner
  (`Dashboard.jsx:232-254`) and `PriorityGoalCard` (`Dashboard.jsx:294`).
- The file was never deleted and has not been modified since it was created, so it
  had ZERO live consumers by the time D3 was picked up. D3's job was to PROVE
  that by inspection before deleting anything — not to trust the audit text.
- Because the component was unreachable, A5 deliberately left its one failing
  `text-slate-500` contrast token (recorded as "`SavingsCard.jsx` (1)") in place
  unrendered.

Reachability evidence gathered BEFORE deleting (per the D3 NEXT ISSUE
requirement not to assume the audit state is unchanged):

| # | Search | Result |
| --- | --- | --- |
| 1 | Case-insensitive `git grep -in "savingscard"` over all tracked files | 7 hits — the component's own definition, 5 in `FIX_PROGRESS.md`, and 1 in `frontend/FRONTEND_README.md`. Zero code references. |
| 2 | Full import / export manifest — every `import` and `export … from` line across all 27 `frontend/src` files | Zero imports of `SavingsCard`. |
| 3 | Filesystem-wide text sweep over all of `frontend/` excluding `node_modules` / `dist` (catches untracked files too) | Only the definition and the README line. |
| 4 | Alias-resolution viability | `vite.config.ts` has no `resolve.alias`; no tsconfig has `compilerOptions.paths`. No `@/components/SavingsCard` form could resolve. |
| 5 | Barrel / re-export hubs | The only `index.*` file in `frontend/src` is `index.css` — there is no JS/TS barrel, so no re-export path exists. |
| 6 | `import(`, `lazy(`, `require(`, `createElement`, `Suspense`, `new Function`, `eval(`, plus `index.html` | Only the 6 route-level page lazies in `App.tsx` and `import("@yudiel/react-qr-scanner")` in `QRScanner.jsx`. No dynamic, lazy or runtime reference to `SavingsCard`. |
| 7 | Routing structure (`App.tsx:29-38`) | 8 routes, all lazily imported pages; `Navbar` is the only eagerly imported component. `SavingsCard` is in no route. |
| 8 | Do live pages need this component? | No — `Dashboard.jsx:232-254` renders the Savings Wallet banner inline and `PriorityGoalCard` (`Dashboard.jsx:294`) covers goal progress. The old 4-tile grid is not rendered anywhere. |
| 9 | `git log -S "SavingsCard" --all -- frontend/src` | Exactly 2 commits on `main` ever touched the name: `ced2d88` (added the file AND its only import) and `5a86e04` (dropped the import and the JSX). The third hit, `a614b97`, is on `remotes/origin/akshay` and is NOT an ancestor of `main` (`git merge-base --is-ancestor a614b97 HEAD` exits 1). |
| 10 | `git log --follow` on the file | Exactly 1 commit ever: `ced2d88` (A). Never modified since creation. |
| 11 | Emitted-bundle probe for `"Round-Ups Today"`, `"Day Streak"`, `"Active Goals"` | Zero hits in `dist/` — it was never present in any emitted chunk. |

Fix:
- `frontend/src/components/SavingsCard.jsx` was DELETED. Nothing else was changed.
- No live import needed removing, because no live import existed.

Deliberately NOT changed:
- The TransactionList summary bar (D4), the default API export (D5), `react.svg`
  (D6) and the unused React import in QRScanner (D7) were NOT touched. Each is its
  own issue.
- The stale `SavingsCard.jsx` entry in the `frontend/FRONTEND_README.md`
  component tree (line 34) was intentionally LEFT UNCHANGED. Documentation
  cleanup was explicitly out of scope for D3, so that file tree now has two
  entries out of date (D2's `ProgressBar.jsx` and this one). Recorded here as an
  observation only — do NOT treat it as a new issue and do NOT fold it into
  another issue.
- No replacement component was introduced for it. The live Savings Wallet banner
  and `PriorityGoalCard` were left exactly as they were.
- No consumer was refactored, because there were no consumers to refactor.
- No source file, layout, styling or behaviour was refactored beyond the deletion.
- No backend changes.
- The 9 pre-existing C4 lint violations were NOT fixed.
- `FIX_PROGRESS.md` was NOT modified during the D3 implementation.

Verification:
- Repo-wide post-delete sweep for `savingscard` confirmed NO live references
  remain; `git grep` over `frontend/src` now exits 1. The only surviving matches
  are documentation text in `FIX_PROGRESS.md` and
  `frontend/FRONTEND_README.md`.
- Targeted `npx eslint src/components`: 9 problems, all pre-existing C4
  (`User`, `avatarColors`, 3× unused `e`, 2× `no-empty`, `ArrowUp`,
  `walletBalance`). Targeted `npx eslint src/pages src/App.tsx src/hooks
  src/services src/utils`: 0 problems. NO NEW VIOLATIONS INTRODUCED.
- `npm run build` passed (`tsc -b && vite build`, 2381 modules — the SAME module
  count as the D2 baseline, which is the proof that no module imported the
  deleted file). NO chunk-size warning.
- `npm run lint`: exactly the same 9 pre-existing C4 violations
  (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same
  rules, same line numbers, same count as the pre-change baseline, which was
  captured BEFORE the deletion. NOT fixed.
- Every JS chunk size is byte-for-byte identical to the D2 baseline
  (`index-*.js` 229.54 kB / gzip 73.59 kB, `Goals-*.js` 371.52 kB,
  `Dashboard-*.js` 31.96 kB, `api-*.js` 36.66 kB, `index.esm-*.js` 138.80 kB).
  Only the chunk HASHES changed, and only because the CSS asset filename is
  embedded in the entry chunk.
- The only build-output delta is the CSS: 66.83 kB (`index-CexWdzcL.css`) to
  66.56 kB (`index-D817xO9L.css`), i.e. −273 bytes. A rule-by-rule diff of the
  two emitted stylesheets shows 0 rules ADDED and exactly 3 REMOVED:
  `.grid-cols-2`, `.hover\:bg-slate-800\/70:hover` and its
  `@supports (color:color-mix(in lab, red, red))` duplicate. A `git grep`
  confirmed neither class is used in any remaining source file, i.e. they were
  SavingsCard-only and Tailwind correctly purged them once the last consumer was
  removed. This 273 B reduction is a DIRECT BYPRODUCT of the D3 deletion of
  unused SavingsCard-only Tailwind utilities. It is NOT a separate issue, NOT a
  performance finding, and must NOT be re-raised on its own.
- `git diff --cached --stat` confirmed a single deleted file (-60 lines) with no
  other file modified; `git diff --stat` was empty and the only entry in
  `git status --porcelain` was the deletion.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- `git status --porcelain -- FIX_PROGRESS.md` and
  `git status --porcelain -- frontend/FRONTEND_README.md` both returned empty
  during the D3 implementation.
- The D3 commit `5a095ea` touches ONLY the deleted
  `frontend/src/components/SavingsCard.jsx` (1 file, -60 / +0). It does not
  touch `Backend/` and does not touch any of the four C4 files.
- D4-D7 targets confirmed still present and unmodified after the D3 commit
  (`TransactionList.jsx`, `services/api.js`, `assets/react.svg`,
  `QRScanner.jsx` all had empty git status).
- Working tree is clean after the push.

LIMITATIONS:
- No test framework and no browser / E2E verification exists in this project
  (no test framework, no test files). The component's unreferenced status was
  established by repo-wide text search, git history, alias / barrel analysis,
  the module-graph module count, a `dist/` string probe and a passing build, not
  by observing runtime behaviour.
- The deletion removes the one `text-slate-500` occurrence A5 had flagged in this
  dead file. That resolves as a byproduct of D3, not as a separate accessibility
  fix.
- The measured baseline used for the bundle / CSS comparison was produced by
  temporarily restoring the file from `HEAD`, building, then deleting it again and
  rebuilding. The working tree and the git index were left with only the intended
  single-file deletion, which `git status --porcelain` confirms.
- Unlike D1 and D2, the emitted CSS is NOT byte-identical to the previous
  baseline (see the −273 B note above). That is expected and is a removal-only
  consequence of the dead file's unique utility classes.

USER CONFIRMED D3 IS COMMITTED AND PUSHED.

---

## D4 — Unused TransactionList summary bar

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Original audit finding:

Unused TransactionList summary bar.

File changed:
- frontend/src/components/TransactionList.jsx

Committed as `c0f0b18` "Fix(frontend) : Remove unused TransactionList summary bar"
(1 file, +1 / -24).

Root cause:
- `TransactionList.jsx` rendered a summary bar ("Total Saved", current month
  total and transaction count) behind a `!compact` guard.
- The component's ONLY live consumer, `frontend/src/pages/Dashboard.jsx:299`,
  passes a bare `compact` attribute, which is shorthand for `compact={true}`.
  `!compact` was therefore permanently `false` and the summary bar was
  permanently unrendered.
- Git history and a call-site sweep found no full-mode consumer (no
  `<TransactionList compact={false} />` and no second call site), so the
  `!compact` branch was not a reachable state — the markup was functionally
  dead code, not a hidden feature.
- Because the branch was unreachable, the JSX it needed had also drifted out of
  use: the `Clock` icon import existed only for the summary bar, and the
  `totalSaved` state plus its update logic existed only to feed it.

Fix:
- Removed the summary-bar JSX block from `TransactionList.jsx`.
- Removed the now-unused `Clock` import (summary-bar-only).
- Removed the now-unreachable `totalSaved` state and its update logic.
- Removed the orphaned `compact` prop declaration and its JSDoc, since nothing
  in the component referenced it after the guard was deleted.
- Everything the component actually renders in production was left intact: the
  fetch, the loading branch, the empty state, the transaction limiting, the
  date formatting and the transaction rows themselves.
- No visible UI change, because the removed markup was never rendered.

Deliberately NOT changed:
- `TransactionList.jsx` itself remains LIVE code and is still imported and
  rendered by `Dashboard.jsx`. It was modified, NOT deleted — unlike D1-D3,
  which removed entirely dead files.
- The bare `compact` attribute at `Dashboard.jsx:299` was intentionally LEFT
  UNCHANGED. The prop no longer exists on the component, so the call site is now
  a no-op attribute. Cleaning that up is a separate concern and is NOT a new
  issue — do NOT treat it as one and do NOT fold it into another issue.
- The default API export (D5), `react.svg` (D6) and the unused React import in
  QRScanner (D7) were NOT touched. Each is its own issue.
- No replacement UI was added, and no `compact={false}` full-mode variant was
  created. There is no consumer for it.
- No source file, layout, styling or behaviour was refactored beyond the above.
- No backend changes.
- The 9 pre-existing C4 lint violations were NOT fixed.
- `FIX_PROGRESS.md` was NOT modified during the D4 implementation.

Performance impact (recorded as a byproduct, NOT as a separate issue):
- The removal shrank the `Dashboard` route chunk by approximately 0.75 kB,
  because the summary-bar JSX and its supporting logic were bundled but never
  rendered.
- Tailwind purged the summary bar's unique utility classes, reducing the emitted
  CSS by approximately 45 bytes.
- Both reductions are DIRECT BYPRODUCTS of removing the dead branch. They are NOT
  separate performance findings and must NOT be re-raised on their own — the
  same treatment already given to D3's 273 B CSS reduction.

Verification:
- Targeted `npx eslint src/components/TransactionList.jsx`: clean, 0 problems.
- `npm run build` passed (`tsc -b && vite build`). Every JS chunk size matches
  the D3 baseline except the `Dashboard` chunk, which is smaller by the expected
  amount. NO chunk-size warning.
- `npm run lint`: exactly the same 9 pre-existing C4 violations
  (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same
  rules, same count as the pre-change baseline. NO NEW VIOLATIONS INTRODUCED.
  NOT fixed.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- `git diff --stat` confirmed a single modified file with no other file changed.
- The D4 commit `c0f0b18` touches ONLY
  `frontend/src/components/TransactionList.jsx` (1 file, +1 / -24). It does not
  touch `Backend/`, `Dashboard.jsx` or any of the four C4 files.
- D5-D7 targets confirmed still present and unmodified after the D4 commit
  (`services/api.js`, `assets/react.svg`, `QRScanner.jsx` all had empty git
  status).
- Working tree is clean after the push.

LIMITATIONS:
- No test framework and no browser / E2E verification exists in this project
  (no test framework, no test files). The unreachability of the summary bar was
  established by call-site analysis, git history and the `compact` shorthand
  semantics, not by observing a render in a browser.
- The rendered output was verified by source review and build output, NOT by
  visual comparison. The argument that nothing visible changed rests on the
  guard being permanently false, not on a screenshot.
- The orphaned `compact` attribute at `Dashboard.jsx:299` was intentionally left
  in place, so that call site still passes an attribute the component no longer
  declares. It is inert, but it is now dead markup at the call site.

USER CONFIRMED D4 IS COMMITTED AND PUSHED.

---

## D5 — Unused default API export

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED

Original audit finding:

Unused default API export.

File changed:
- frontend/src/services/api.js

Committed as `00b9c50` "Fix(frontend) : Remove unused default API export"
(1 file, +0 / -2).

Root cause:
- `frontend/src/services/api.js` exported the same axios instance twice: once as
  the module-private `const API` (line 6) that every named wrapper calls, and
  again as `export default API;` on the last line. The default export was a
  DUPLICATE public surface on one object, not a second instance.
- No live consumer ever imported it. All 8 importers of `services/api` use
  destructured NAMED imports:
  - `AddGoalFromLink.jsx:12` — `{ fetchProduct }`
  - `TransactionList.jsx:7` — `{ getTransactions }`
  - `Chatbot.jsx:5` — `{ askAI }`
  - `Dashboard.jsx:10` — `{ getGoals, makePayment }`
  - `Goals.jsx:7` — `{ getGoals, createGoal, deleteGoal, buyGoal }`
  - `Login.jsx:4` — `{ loginUser, API_BASE_URL }`
  - `Register.jsx:4` — `{ registerUser }`
  - `SetupProfile.jsx:3` — `{ updateProfile }`
- `API` itself is LIVE code and was kept: all 12 named export wrappers call it,
  so the `baseURL`, the `Content-Type: application/json` header and the JWT
  request interceptor are all still required.

Reachability evidence gathered BEFORE removing it (per the D5 NEXT ISSUE
requirement not to assume the audit state is unchanged):

| # | Search | Result |
| --- | --- | --- |
| 1 | `git grep -n "services/api" -- frontend` | 10 hits — 8 live imports (all named) + 2 prose lines in `frontend/FRONTEND_README.md`. Zero default imports. |
| 2 | Repo-wide filesystem sweep of all `.js/.jsx/.ts/.tsx/.html` files, INCLUDING untracked, excluding `node_modules` / `dist` | The same 8 named imports, nothing more. |
| 3 | `import * as`, `import(`, `require(`, `createElement`, `new Function`, `eval(` across `frontend/src`, `index.html`, `vite.config.ts`, `eslint.config.js` | Only the 6 route-level page lazies in `App.tsx` and `import("@yudiel/react-qr-scanner")` in `QRScanner.jsx`. No path reaches `services/api`. |
| 4 | Re-exports (`export * from`, `export {…} from`) and `@/`-style alias imports | Zero anywhere in the repo. |
| 5 | Alias-resolution viability | `vite.config.ts` has no `resolve.alias`; no tsconfig has `compilerOptions.paths`. An `@/services/api` form could not resolve. |
| 6 | Barrel / re-export hubs | The only `index.*` file in `frontend/src` is `index.css` — there is no JS/TS barrel. |
| 7 | `git log --all -S "import API from" -- frontend/src` | Zero hits in ANY commit on ANY branch. The default export was never imported at any point in history. |
| 8 | `git log -S "export default API"` | `1b6d8eb` added it, `6cfe822` removed it, `b655ef1` re-added it together with the named-export rewrite — and every importer added in `b655ef1` was already a named import. |

Fix:
- `export default API;` was DELETED from `frontend/src/services/api.js`, along
  with the blank line that separated it from the last named export. That
  statement and its blank line are the ENTIRE diff (1 file, +0 / -2).
- All 12 named exports were left byte-identical and in place: `API_BASE_URL`,
  `loginUser`, `registerUser`, `getGoals`, `createGoal`, `deleteGoal`,
  `buyGoal`, `makePayment`, `getTransactions`, `updateProfile`, `askAI`,
  `fetchProduct`.
- The axios instance, its `baseURL`, the `Content-Type` header and the
  `Authorization: Bearer <token>` request interceptor were NOT touched.
- No consumer needed changing, because no consumer referenced the default export.

Deliberately NOT changed:
- No consumer was modified. There were 8 importers and every one of them already
  imported only named exports, so removing the default export required zero edits
  outside `api.js`.
- The API service was NOT rewritten, split, renamed or restructured. The file
  keeps its `axios.create` instance and its single-interceptor design.
- `react.svg` (D6) and the unused React import in QRScanner (D7) were NOT
  touched. Each is its own issue.
- The two prose references to `src/services/api.js` in
  `frontend/FRONTEND_README.md` (lines 64 and 161) were intentionally LEFT
  UNCHANGED. They describe Axios usage and the `baseURL`, neither of which
  implies a default export, so they are still accurate. Documentation cleanup
  was out of scope.
- No dependency was added, removed or version-changed. `axios` is still used.
- The 9 pre-existing C4 lint violations were NOT fixed.
- No source file, layout, styling or behaviour was refactored beyond the above.
- No backend changes.
- `FIX_PROGRESS.md` was NOT modified during the D5 implementation.

Bundle impact:
- There is NO bundle-size reduction, and none is claimed. The unused default
  export was already tree-shaken out of the emitted `api-*.js` chunk, so
  removing it changes no shipped bytes. That chunk stayed at exactly 36.66 kB /
  gzip 14.53 kB, byte-size-identical to the D4 baseline.
- The benefit is a smaller public API surface and the removal of a dead export
  surface, NOT a smaller bundle.

Verification:
- Targeted `npx eslint src/services/api.js`: clean, 0 problems.
- `npm run build` passed (`tsc -b && vite build`, 2381 modules — the SAME module
  count as the D4 baseline). Every emitted chunk size matches the D4 baseline
  (entry 229.54 kB / gzip 73.59 kB, `Goals` 371.52 kB, `Dashboard` 31.21 kB,
  `api` 36.66 kB, `index.esm` 138.80 kB, CSS 66.51 kB). NO chunk-size warning.
- `npm run lint`: exactly the same 9 pre-existing C4 violations
  (ContactCard.jsx, PaymentModal.jsx, QRScanner.jsx, RoundUpPopup.jsx) — same
  rules, same line numbers, same count as the pre-change baseline. NO NEW
  VIOLATIONS INTRODUCED. NOT fixed.
- Post-edit re-sweep for `services/api` across the repo: the same 8 named
  imports remain and ZERO default imports of `api.js` remain.
- Post-edit `export` sweep of `api.js` confirmed all 12 named exports are still
  present at their original lines (3, 23, 24, 27-30, 33, 34, 37, 40, 43) with
  no default export.
- EOL integrity: `api.js` verified 0 bare-LF (the repo uses CRLF).
- `git diff --stat` confirmed a single modified file, +0 / -2, with no other file
  changed.
- `git status --porcelain -uall` showed only
  `M frontend/src/services/api.js` and no untracked files.
- `git status --porcelain -- Backend` returned empty — Backend/ untouched.
- `git status --porcelain -- FIX_PROGRESS.md frontend/FRONTEND_README.md` both
  returned empty during the D5 implementation.
- The D5 commit `00b9c50` touches ONLY `frontend/src/services/api.js`
  (1 file, +0 / -2). It does not touch `Backend/`, any consumer, or any of the
  four C4 files.
- D6-D7 targets confirmed still present and unmodified after the D5 commit
  (`assets/react.svg` and `QRScanner.jsx` had empty git status).
- Working tree is clean after the push.

LIMITATIONS:
- No test framework and no browser / E2E verification exists in this project
  (no test framework, no test files). "Unused" was established by static
  analysis, a repo-wide filesystem sweep, git history search and a passing
  build, NOT by observing runtime imports in a browser.
- The claim that no module imports the default export is a source-level fact
  about the current tree. If a future module were to `import API from
  "../services/api"`, it would now get a build-time error rather than the
  instance — which is the intended, correct outcome, but it is a forward-looking
  note, not a current regression.
- This issue produces no measurable performance gain (see "Bundle impact").
  Anyone expecting a smaller bundle from it will not see one.

USER CONFIRMED D5 IS COMMITTED AND PUSHED.

---

# NEXT ISSUE

## D6 — Unused `react.svg`.

STATUS: NEXT

Original audit finding:

Unused `react.svg`.

Original audit scope:
- See the `DEAD CODE` entry for D6 and the recorded audit locations for this
  issue.

IMPORTANT:
Before changing anything:

1. Inspect the current source and compare it with this description — do not
   assume the audit state is unchanged.
2. Preserve the existing application behaviour. No visible UI change is
   expected.
3. Do NOT invent requirements. Use the tooling and patterns already present in
   the project.

Do NOT:
- modify backend files or anything under `Backend/`
- fix another audit issue (D7, E1-E8, etc.)
- refactor unrelated code
- make unrelated accessibility changes
- fix the 9 pre-existing C4 lint violations
- modify dead-code item D7

Fix ONLY D6. Do NOT start any later issue (D7, E1-E8).

---

# REMAINING AUDIT QUEUE

These are from the original frontend audit.

Do NOT skip ahead unless:
1. The current issue has been fixed.
2. The user has committed it.
3. The user explicitly tells OpenCode to continue.

---

## F8

Dashboard "View all" contacts button does nothing.

STATUS: COMPLETED (see COMPLETED ISSUES above)

---

## S2

"Continue with Google" hard-codes:

`http://localhost:5000`

STATUS: COMPLETED (see COMPLETED ISSUES above)

---

## S3

JWT stored in localStorage.

STATUS: REVIEWED — NO CODE CHANGE (documented by-design tradeoff)

Reviewed and accepted as a by-design tradeoff — see COMPLETED / RESOLVED ISSUES above.
No code change was made. Do NOT treat as a bug requiring a fix.

---

## A1

Modals lack:
- focus trap
- ARIA roles
- ESC handling

STATUS: COMPLETED (see COMPLETED ISSUES above)

---

## A2

Icon-only buttons lack accessible names.

STATUS: COMPLETED (see COMPLETED ISSUES above)

---

## A3

Placeholder-only form inputs have no labels.

STATUS: COMPLETED (see COMPLETED ISSUES above)

---

## A4

Native `alert()` used for inline validation.

STATUS: COMPLETED (see COMPLETED ISSUES above)

---

## A5

Low-contrast text and no reduced-motion handling.

STATUS: COMPLETED (see COMPLETED ISSUES above)

---

# ACCESSIBILITY

## A1

Modals lack:
- focus trap
- ARIA roles
- ESC handling

STATUS: FIXED + COMMITTED + PUSHED (see COMPLETED ISSUES above)

## A2

Icon-only buttons lack accessible names.

STATUS: FIXED + COMMITTED + PUSHED (see COMPLETED ISSUES above)

## A3

Placeholder-only form inputs have no labels.

STATUS: FIXED + COMMITTED + PUSHED (see COMPLETED ISSUES above)

## A4

Native `alert()` used for inline validation.

STATUS: FIXED + COMMITTED + PUSHED (see COMPLETED ISSUES above)

## A5

Low-contrast text and no reduced-motion handling.

STATUS: FIXED + COMMITTED + PUSHED (see COMPLETED ISSUES above)

---

# PERFORMANCE / QUALITY

## P1

Large main bundle / no route-level code splitting.

STATUS: FIXED + COMMITTED + PUSHED (see COMPLETED ISSUES above)

## P2

Backend-only packages incorrectly listed as frontend dependencies.

STATUS: FIXED + COMMITTED + PUSHED (see COMPLETED ISSUES above)

## P3

Dashboard profile-check effect runs on every render.

STATUS: FIXED + COMMITTED + PUSHED (see COMPLETED ISSUES above)

## P4

Raw `<a href>` causes full-page reload in SPA.

STATUS: FIXED + COMMITTED + PUSHED (see COMPLETED ISSUES above)

---

# DEAD CODE

## D1

`GoalCard.jsx` is unused.

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED (see COMPLETED ISSUES above)

## D2

`ProgressBar.jsx` only used by dead GoalCard.

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED (see COMPLETED ISSUES above)

## D3

`SavingsCard.jsx` is unused.

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED (see COMPLETED ISSUES above)

## D4

Unused TransactionList summary bar.

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED (see COMPLETED ISSUES above)

## D5

Unused default API export.

STATUS: FIXED + COMMITTED + PUSHED + USER CONFIRMED (see COMPLETED ISSUES above)

## D6

Unused `react.svg`.

STATUS: NEXT

## D7

Unused React import in QRScanner.

STATUS: PENDING

---

# EDGE CASES / MINOR

## E1

Goal target 0 causes NaN progress.

STATUS: PENDING

## E2

Unreachable exact-amount RoundUpPopup branch.

STATUS: PENDING

## E3

Logout leaves stale `pennywise_user`.

STATUS: PENDING

## E4

New first goal does not become selected automatically.

STATUS: PENDING

## E5

Wallet precision differs between Dashboard and Goals.

STATUS: PENDING

## E6

Buy success can be invisible if `window.open` is blocked.

STATUS: PENDING

## E7

QR scanner fixed width can overflow narrow screens.

STATUS: PENDING

## E8

Hard-coded average daily saving / misleading round-up copy.

STATUS: PENDING

---

# OPENCODE HANDOFF INSTRUCTIONS

When starting a NEW OpenCode session:

1. Read `FIX_PROGRESS.md` FIRST.
2. Do not rely on previous chat history.
3. Check `CURRENT STATUS`.
4. Check `NEXT ISSUE`.
5. Confirm which issue is next.
6. Follow all CORE RULES.
7. Work ONLY on the current issue.
8. Do NOT commit.
9. Run verification.
10. Report what was changed.
11. STOP.
12. Wait for the user to confirm the commit.

---

# IMPORTANT WORKFLOW

The workflow is:

AUDIT
↓
ONE ISSUE
↓
FIX
↓
VERIFY
↓
STOP
↓
USER REVIEWS
↓
USER COMMITS
↓
NEXT ISSUE

Never do:

AUDIT
↓
FIX MULTIPLE ISSUES
↓
COMMIT EVERYTHING

---

# FINAL RULE

If you are unsure whether a change belongs to the current issue:

DO NOT make the change.

Explain it in the report and wait for the user.

The user controls when the next issue begins.