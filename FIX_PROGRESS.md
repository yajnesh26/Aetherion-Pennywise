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

A1

## Next issue

A2

## Current state

- The last committed issue is A1 (FIXED + COMMITTED + PUSHED).
- S3 has been reviewed — NO CODE CHANGE (documented by-design tradeoff).
- A1 is fixed and pushed.
- A2 is the next issue.
- Do NOT start A2 until the user explicitly tells you to continue.
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

# NEXT ISSUE

## A2 — Icon-only buttons lack accessible names

STATUS: NEXT

Original audit finding:

Icon-only buttons lack accessible names.

Current behavior:
- Buttons that render only an icon (no visible text) have no accessible name,
  so screen readers announce them as just "button".

Expected behavior:
- Every icon-only button should expose an accessible name, e.g. via
  `aria-label` (or `aria-labelledby` when visible text is absent).

IMPORTANT:
Before changing anything:

1. Find every icon-only button in the frontend.
2. Prefer an `aria-label` that matches the button's visible purpose.
3. Where a visible text label already exists, do NOT add a redundant
   `aria-label` that could contradict the visible text.
4. Keep the change minimal — attribute additions only, no layout or
   behaviour changes.

NOTE:
A1 already added `aria-label`s to the close controls of PaymentModal,
RoundUpPopup, QRScanner and the Dashboard "All Contacts" modal, because A1
required close controls to remain accessible. Do NOT duplicate that work.

Do NOT:
- modify backend files
- fix another audit issue
- refactor unrelated code

Fix ONLY A2.

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

STATUS: NEXT

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

STATUS: NEXT

## A3

Placeholder-only form inputs have no labels.

STATUS: PENDING

## A4

Native `alert()` used for inline validation.

STATUS: PENDING

## A5

Low-contrast text and no reduced-motion handling.

STATUS: PENDING

---

# PERFORMANCE / QUALITY

## P1

Large main bundle / no route-level code splitting.

STATUS: PENDING

## P2

Backend-only packages incorrectly listed as frontend dependencies.

STATUS: PENDING

## P3

Dashboard profile-check effect runs on every render.

STATUS: PENDING

## P4

Raw `<a href>` causes full-page reload in SPA.

STATUS: PENDING

---

# DEAD CODE

## D1

`GoalCard.jsx` is unused.

STATUS: PENDING

## D2

`ProgressBar.jsx` only used by dead GoalCard.

STATUS: PENDING

## D3

`SavingsCard.jsx` is unused.

STATUS: PENDING

## D4

Unused TransactionList summary bar.

STATUS: PENDING

## D5

Unused default API export.

STATUS: PENDING

## D6

Unused `react.svg`.

STATUS: PENDING

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