# 🪙 PennyWise – Frontend Documentation (for Backend Developers)

> **PennyWise** is a Smart Savings & Micro-Investment Platform with a UPI-payment-first dashboard. This README explains **everything the frontend does** so you can build matching backend APIs.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [How to Run](#3-how-to-run)
4. [API Service Layer (`services/api.js`)](#4-api-service-layer)
5. [Authentication Flow](#5-authentication-flow)
6. [Pages & What They Expect](#6-pages--what-they-expect)
   - [Login](#61-login-page)
   - [Register](#62-register-page)
   - [Dashboard](#63-dashboard-page)
   - [Goals](#64-goals-page)
   - [Transactions (Round-Up)](#65-transactions-round-up-page)
   - [Chatbot (AI Assistant)](#66-chatbot-ai-assistant-page)
7. [Complete API Endpoints Contract](#7-complete-api-endpoints-contract)
8. [Data Models / Schemas](#8-data-models--schemas)
9. [Current Offline/Dummy Data](#9-current-offlinedummy-data)
10. [LocalStorage Keys Used](#10-localstorage-keys-used)
11. [Routing & Navigation](#11-routing--navigation)
12. [Switching from Offline to Backend](#12-switching-from-offline-to-backend)
13. [Environment Variables](#13-environment-variables)
14. [CORS & Headers](#14-cors--headers)

---

## 1. Tech Stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| Framework     | React 19.2 (Vite 8)                   |
| Language      | JavaScript (.jsx) inside TypeScript project |
| Styling       | Tailwind CSS v4 (`@tailwindcss/vite`)  |
| Routing       | React Router DOM v7                    |
| HTTP Client   | Axios                                  |
| Icons         | Lucide React                           |

---

## 2. Project Structure

```
frontend/
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx              # Entry point – BrowserRouter wrapper
│   ├── App.tsx               # Route definitions + layout
│   ├── index.css             # Tailwind v4 theme + animations
│   │
│   ├── services/
│   │   └── api.js            # ⭐ Axios instance + ALL API functions
│   │
│   ├── pages/
│   │   ├── Login.jsx         # Email + password login
│   │   ├── Register.jsx      # Name + email + password registration
│   │   ├── Dashboard.jsx     # UPI payment-first dashboard + round-up flow
│   │   ├── Goals.jsx         # CRUD savings goals
│   │   ├── Transaction.jsx   # Round-up calculator + history
│   │   └── Chatbot.jsx       # AI financial assistant chat
│   │
│   └── components/
│       ├── Navbar.jsx         # Top navigation bar
│       ├── GoalCard.jsx       # Individual goal card with progress
│       ├── ProgressBar.jsx    # Visual progress bar
│       ├── ChatMessage.jsx    # Chat bubble (user/AI)
│       ├── PaymentActions.jsx # 6 UPI action buttons grid
│       ├── ContactCard.jsx    # Contact avatar for quick pay
│       ├── PaymentModal.jsx   # Payment modal with amount input
│       ├── RoundUpPopup.jsx   # Post-payment round-up savings popup
│       └── SavingsCard.jsx    # Savings stats overview (4-stat grid)
```

---

## 3. How to Run

```bash
cd frontend
npm install
npm run dev
# → Runs on http://localhost:5173 (or next available port)
```

Build for production:
```bash
npm run build
npm run preview
```

---

## 4. API Service Layer

**File: `src/services/api.js`**

This is the **single file** that connects frontend → backend. It uses Axios with:

- **Base URL:** `http://localhost:5000/api` (configurable via `VITE_API_URL` env var)
- **Content-Type:** `application/json`
- **Auth:** JWT Bearer token attached to every request via Axios interceptor

```javascript
// Token is read from localStorage and attached automatically:
Authorization: `Bearer ${localStorage.getItem("token")}`
```

### Exported API Functions:

| Function           | Method | Endpoint                   | Body / Params             |
| ------------------ | ------ | -------------------------- | ------------------------- |
| `loginUser(data)`  | POST   | `/api/auth/login`          | `{ email, password }`     |
| `registerUser(data)` | POST | `/api/auth/register`       | `{ name, email, password }` |
| `getGoals()`       | GET    | `/api/goals`               | —                         |
| `createGoal(data)` | POST   | `/api/goals`               | `{ name, target }`        |
| `deleteGoal(id)`   | DELETE | `/api/goals/:id`           | —                         |
| `getTransactions()` | GET   | `/api/transactions`        | —                         |
| `addRoundUp(data)` | POST   | `/api/transactions/roundup` | `{ amount, roundUp }`    |
| `getDashboard()`   | GET    | `/api/dashboard`           | —                         |
| `sendChatMessage(data)` | POST | `/api/chat`            | `{ message }`             |

> **Note:** Currently ALL these API calls are **commented out** in the pages. The frontend uses localStorage/dummy data instead. See [Section 12](#12-switching-from-offline-to-backend) for how to switch.

---

## 5. Authentication Flow

### Current (Offline) Flow:
1. **Register:** Saves `{ name, email, password }` into a `pennywise_users` array in localStorage
2. **Login:** Checks email+password against localStorage array, generates a dummy token `demo-token-<timestamp>`
3. **Token Storage:** `localStorage.setItem("token", "...")`
4. **User Info Storage:** `localStorage.setItem("pennywise_user", JSON.stringify({ name, email }))`
5. **Logout:** `localStorage.removeItem("token")` → redirect to `/login`

### Expected Backend Flow:
1. **Register** → `POST /api/auth/register` with `{ name, email, password }`
   - Backend should hash password, create user in DB
   - Return: `{ message: "User created" }` or error
2. **Login** → `POST /api/auth/login` with `{ email, password }`
   - Backend should validate credentials, return JWT
   - Return: `{ token: "jwt-token-here", user: { name, email } }`
3. Frontend stores `token` in localStorage, attaches to all subsequent requests
4. Backend should verify JWT on all protected routes

### Expected Error Response Format:
The frontend reads errors like this:
```javascript
err.response?.data?.message
```
So your error responses should be:
```json
{
  "message": "Invalid email or password."
}
```
With appropriate HTTP status codes (400, 401, 404, 500).

---

## 6. Pages & What They Expect

### 6.1 Login Page
**Route:** `/login`
**File:** `src/pages/Login.jsx`

**Form fields:**
| Field    | Type     | Validation   |
| -------- | -------- | ------------ |
| email    | email    | required     |
| password | password | required     |

**Submits to:** `POST /api/auth/login`

**Request body:**
```json
{ "email": "user@example.com", "password": "123456" }
```

**Expected success response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```
Frontend then stores `token` and `user` in localStorage and redirects to `/dashboard`.

---

### 6.2 Register Page
**Route:** `/register`
**File:** `src/pages/Register.jsx`

**Form fields:**
| Field    | Type     | Validation        |
| -------- | -------- | ----------------- |
| name     | text     | required          |
| email    | email    | required          |
| password | password | required, min 6   |

**Submits to:** `POST /api/auth/register`

**Request body:**
```json
{ "name": "John Doe", "email": "user@example.com", "password": "abc123" }
```

**Expected success response:**
```json
{ "message": "User registered successfully" }
```
Frontend then redirects to `/login`. If email is already taken, return:
```json
{ "message": "Email already registered." }
```
with status 400.

---

### 6.3 Dashboard Page
**Route:** `/dashboard`
**File:** `src/pages/Dashboard.jsx`

This is a **UPI payment-first** interface. It shows:
1. Quick Payment Actions (6 buttons: Pay Contacts, Scan QR, Recharge, Bill Payment, Business Pay, Send Money)
2. Recent Contacts (horizontal scroll of frequent contacts)
3. Savings Overview (Total Saved, Active Goals, Day Streak, Round-Ups Today)
4. Goal Progress (cards with progress bars)
5. Recent Round-Up Transactions

**API call:** `GET /api/dashboard`

**Expected response:**
```json
{
  "contacts": [
    { "id": 1, "name": "Rahul S.", "upi": "rahul@upi", "avatar": null },
    { "id": 2, "name": "Swiggy", "upi": "swiggy@paytm", "avatar": null }
  ],
  "goals": [
    {
      "id": 1,
      "name": "iPhone 16",
      "target": 79900,
      "saved": 32000,
      "dailySaving": 800
    }
  ],
  "transactions": [
    {
      "id": 1,
      "desc": "Swiggy Order",
      "amount": 287,
      "roundUp": 13,
      "date": "Today"
    }
  ],
  "stats": {
    "totalSavings": 8450,
    "activeGoals": 4,
    "streak": 12,
    "roundUpsToday": 2
  }
}
```

#### Payment Flow (UPI simulation):
The dashboard has a built-in payment flow:
1. User clicks a contact → **PaymentModal** opens
2. User enters amount + optional note → clicks "Pay"
3. Frontend calculates round-up: `Math.ceil(amount / 10) * 10 - amount`
4. **RoundUpPopup** appears asking user to save spare change
5. If user accepts → `POST /api/transactions/roundup`

**Round-up endpoint request:**
```json
{
  "amount": 287,
  "roundUp": 3,
  "contactName": "Swiggy",
  "note": "Dinner order"
}
```

**Round-up endpoint response:**
```json
{
  "id": 123,
  "amount": 287,
  "roundUp": 3,
  "desc": "Swiggy",
  "date": "Just now",
  "totalSavings": 8453
}
```

---

### 6.4 Goals Page
**Route:** `/goals`
**File:** `src/pages/Goals.jsx`

CRUD for savings goals. Shows goal cards in a grid with progress bars.

#### List Goals
**API call:** `GET /api/goals`

**Expected response:**
```json
[
  {
    "id": 1,
    "name": "iPhone 16",
    "target": 79900,
    "saved": 32000,
    "dailySaving": 800
  },
  {
    "id": 2,
    "name": "Goa Trip",
    "target": 25000,
    "saved": 18500,
    "dailySaving": 400
  }
]
```

#### Create Goal
**API call:** `POST /api/goals`

**Request body:**
```json
{
  "name": "New Laptop",
  "target": 50000
}
```

**Expected response:** The created goal object:
```json
{
  "id": 6,
  "name": "New Laptop",
  "target": 50000,
  "saved": 0,
  "dailySaving": 834
}
```

> **Note:** The frontend calculates `dailySaving` as `Math.ceil(target / 60)` (assumes ~60-day timeline). Backend can use this or its own logic.

#### Delete Goal
**API call:** `DELETE /api/goals/:id`

**Expected response:**
```json
{ "message": "Goal deleted" }
```

---

### 6.5 Transactions (Round-Up) Page
**Route:** `/transactions`
**File:** `src/pages/Transaction.jsx`

Features a **Round-Up Calculator** and a **Round-Up History** table.

#### How Round-Up Works:
```
Original Amount:  ₹287
Rounded Up To:    ₹290  (next multiple of 10)
Spare Change:     ₹3    (saved automatically)
```
Formula: `roundUp = Math.ceil(amount / 10) * 10 - amount`
If the amount is already a multiple of 10, frontend suggests saving ₹10 instead.

#### List Transactions
**API call:** `GET /api/transactions`

**Expected response:**
```json
[
  {
    "id": 1,
    "original": 287,
    "rounded": 290,
    "saved": 3,
    "date": "Today"
  },
  {
    "id": 2,
    "original": 142,
    "rounded": 150,
    "saved": 8,
    "date": "Today"
  }
]
```

#### Add Round-Up
**API call:** `POST /api/transactions/roundup`

**Request body:**
```json
{
  "amount": 287,
  "roundUp": 3
}
```

**Expected response:**
```json
{
  "id": 10,
  "original": 287,
  "rounded": 290,
  "saved": 3,
  "date": "Just now"
}
```

---

### 6.6 Chatbot (AI Assistant) Page
**Route:** `/chat`
**File:** `src/pages/Chatbot.jsx`

A ChatGPT-style AI financial assistant. Currently uses hardcoded local responses matching keywords (save, invest, budget).

#### Send Message
**API call:** `POST /api/chat`

**Request body:**
```json
{
  "message": "How can I save money faster?"
}
```

**Expected response:**
```json
{
  "reply": "Here are some proven ways to save money faster:\n\n1. **Round-up every transaction** — PennyWise does this automatically!\n2. **Set specific goals** — Visual progress bars keep you motivated.\n..."
}
```

The frontend expects a `reply` field with the AI's text response. Markdown formatting (bold, lists) is supported in the UI via `whitespace-pre-wrap`.

**Optional enhancements the frontend supports:**
- Suggestion chips are hardcoded but could come from backend
- Chat history is in-memory only (resets on page refresh) — backend could persist

---

## 7. Complete API Endpoints Contract

### Base URL: `http://localhost:5000/api`

| # | Method | Endpoint                    | Auth | Request Body                        | Success Response                                             |
|---|--------|-----------------------------|------|-------------------------------------|--------------------------------------------------------------|
| 1 | POST   | `/auth/register`            | No   | `{ name, email, password }`         | `{ message: "User registered" }`                             |
| 2 | POST   | `/auth/login`               | No   | `{ email, password }`               | `{ token: "jwt...", user: { name, email } }`                 |
| 3 | GET    | `/goals`                    | Yes  | —                                   | `[ { id, name, target, saved, dailySaving } ]`               |
| 4 | POST   | `/goals`                    | Yes  | `{ name, target }`                  | `{ id, name, target, saved: 0, dailySaving }`                |
| 5 | DELETE | `/goals/:id`                | Yes  | —                                   | `{ message: "Goal deleted" }`                                |
| 6 | GET    | `/transactions`             | Yes  | —                                   | `[ { id, original, rounded, saved, date } ]`                 |
| 7 | POST   | `/transactions/roundup`     | Yes  | `{ amount, roundUp }`               | `{ id, original, rounded, saved, date }`                     |
| 8 | GET    | `/dashboard`                | Yes  | —                                   | `{ contacts, goals, transactions, stats }`                   |
| 9 | POST   | `/chat`                     | Yes  | `{ message }`                       | `{ reply: "AI response text..." }`                           |

> **Auth = Yes** means the request must include header: `Authorization: Bearer <jwt_token>`

---

## 8. Data Models / Schemas

### User
```json
{
  "id": "string or number",
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed in DB)"
}
```

### Goal
```json
{
  "id": "number",
  "name": "string",          // e.g. "iPhone 16"
  "target": "number",         // target price in ₹ (e.g. 79900)
  "saved": "number",          // amount saved so far in ₹ (e.g. 32000)
  "dailySaving": "number",    // suggested daily saving in ₹ (e.g. 800)
  "userId": "string"          // owner (for auth filtering)
}
```

### Transaction (Round-Up)
```json
{
  "id": "number",
  "original": "number",       // original payment amount (e.g. 287)
  "rounded": "number",        // rounded-up amount (e.g. 290)
  "saved": "number",          // spare change saved (e.g. 3)
  "desc": "string",           // description (e.g. "Swiggy Order")
  "date": "string",           // human-readable date (e.g. "Today", "Yesterday", ISO string)
  "userId": "string"          // owner
}
```

### Contact (for Dashboard)
```json
{
  "id": "number",
  "name": "string",           // e.g. "Rahul S."
  "upi": "string",            // e.g. "rahul@upi"
  "avatar": "string | null",  // URL to avatar image (optional)
  "userId": "string"          // owner
}
```

### Dashboard Stats
```json
{
  "totalSavings": "number",   // sum of all savings in ₹
  "activeGoals": "number",    // count of goals where saved < target
  "streak": "number",         // consecutive days with round-ups
  "roundUpsToday": "number"   // count of round-ups today
}
```

### Chat Message
```json
{
  "message": "string"         // user's message to AI
}
// Response:
{
  "reply": "string"           // AI's response text (supports markdown-style formatting)
}
```

---

## 9. Current Offline/Dummy Data

The frontend currently uses **hardcoded dummy data** in each page. Here's what exists:

### Dashboard dummy data:
- **8 contacts:** Rahul S., Swiggy, Amazon, Priya M., Electricity, Netflix, Aman K., Zomato
- **4 goals:** iPhone 16 (₹79,900), Goa Trip (₹25,000), PS5 Controller (₹5,900), New Sneakers (₹8,500)
- **4 transactions:** Swiggy ₹287 (+₹13), Uber ₹142 (+₹8), Amazon ₹1263 (+₹37), Coffee ₹85 (+₹15)
- **Stats:** totalSavings=8450, streak=12, roundUpsToday=2

### Goals page dummy data:
- 5 goals (same 4 + MacBook Air ₹99,900)

### Transaction page dummy data:
- 5 round-up history entries

### Chatbot dummy data:
- 4 hardcoded AI response templates matching keywords: save, invest, budget, default

---

## 10. LocalStorage Keys Used

| Key                | Value                                      | Set By       | Used By             |
| ------------------ | ------------------------------------------ | ------------ | ------------------- |
| `token`            | JWT string (or `demo-token-xxx`)           | Login page   | api.js interceptor, Navbar logout |
| `pennywise_user`   | `{ name, email }` JSON                     | Login page   | Dashboard greeting  |
| `pennywise_users`  | `[{ name, email, password }]` JSON array   | Register page | Login page (offline only) |

> **`pennywise_users`** is ONLY used in offline mode. When backend is connected, registration/login goes through the API and this key is no longer needed.

---

## 11. Routing & Navigation

| Route           | Page Component | Auth Required | Notes                          |
| --------------- | -------------- | ------------- | ------------------------------ |
| `/`             | → redirect     | No            | Redirects to `/login`          |
| `/login`        | Login          | No            | No navbar shown                |
| `/register`     | Register       | No            | No navbar shown                |
| `/dashboard`    | Dashboard      | Yes           | Main UPI payment dashboard     |
| `/goals`        | Goals          | Yes           | Savings goals CRUD             |
| `/transactions` | Transaction    | Yes           | Round-up calculator + history  |
| `/chat`         | Chatbot        | Yes           | AI financial assistant         |
| `*` (catch-all) | → redirect     | —             | Redirects to `/dashboard`      |

**Navbar links:** Dashboard, Goals, Transactions, AI Assistant, Logout

> **Note:** Currently there's no route guard/protected route logic. The frontend just checks for a token in localStorage. You may want the backend to return 401 on invalid/expired tokens, and the frontend could be updated to redirect to `/login` on 401 responses.

---

## 12. Switching from Offline to Backend

Every page has commented-out API calls. Here's how to activate them:

### Login.jsx
```javascript
// REPLACE the offline localStorage block with:
const res = await loginUser(form);
localStorage.setItem("token", res.data.token);
localStorage.setItem("pennywise_user", JSON.stringify(res.data.user));
```

### Register.jsx
```javascript
// REPLACE the offline localStorage block with:
await registerUser(form);
```

### Dashboard.jsx
```javascript
// In useEffect, add:
getDashboard().then(res => {
  setGoals(res.data.goals);
  setTransactions(res.data.transactions);
  setTotalSavings(res.data.stats.totalSavings);
  // etc.
});
```

### Goals.jsx
```javascript
// List: getGoals().then(res => setGoals(res.data));
// Create: createGoal(newGoal).then(res => setGoals([res.data, ...goals]));
// Delete: deleteGoal(id);
```

### Transaction.jsx
```javascript
// History: getTransactions().then(res => setHistory(res.data));
// Save: addRoundUp({ amount: result.original, roundUp: result.saved });
```

### Chatbot.jsx
```javascript
// Replace setTimeout block with:
const res = await sendChatMessage({ message: userMsg });
setMessages(prev => [...prev, { id: Date.now(), role: "assistant", text: res.data.reply }]);
```

---

## 13. Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend reads this in `services/api.js`:
```javascript
baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
```

If not set, defaults to `http://localhost:5000/api`.

---

## 14. CORS & Headers

The frontend runs on `http://localhost:5173` (or 5174/5175/5176 if port is busy).

Your backend at `http://localhost:5000` needs CORS configured to allow:

```javascript
// Example with Express.js
const cors = require("cors");
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
  credentials: true,
}));
```

**Required headers to accept:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Required response format:**
- All responses should be JSON
- Errors must include a `message` field: `{ "message": "Error description" }`
- Use standard HTTP status codes: 200, 201, 400, 401, 404, 500

---

## Quick Start Checklist for Backend Developer

- [ ] Set up Express.js (or your preferred framework) on port **5000**
- [ ] Enable CORS for localhost:5173–5176
- [ ] Set up MongoDB/PostgreSQL with User, Goal, Transaction models
- [ ] Implement `POST /api/auth/register` — hash password, save user
- [ ] Implement `POST /api/auth/login` — validate, return JWT + user object
- [ ] Add JWT middleware for protected routes
- [ ] Implement `GET /api/goals` — return user's goals
- [ ] Implement `POST /api/goals` — create goal, calculate dailySaving
- [ ] Implement `DELETE /api/goals/:id` — delete user's goal
- [ ] Implement `GET /api/transactions` — return user's round-up history
- [ ] Implement `POST /api/transactions/roundup` — save a round-up entry
- [ ] Implement `GET /api/dashboard` — return contacts + goals + transactions + stats
- [ ] Implement `POST /api/chat` — forward to AI service, return `{ reply }`
- [ ] Return `{ message: "..." }` for all error responses
- [ ] Test with frontend by uncommenting API calls (see Section 12)

---

*Generated for the PennyWise frontend codebase – Team Aetherion*
