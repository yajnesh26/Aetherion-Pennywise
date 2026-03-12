# 🎨 PennyWise Frontend

> React 19 + Vite 8 + Tailwind CSS v4 SPA

---

## 📁 Folder Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── public/
└── src/
    ├── main.tsx                  ← App entry point
    ├── App.tsx                   ← Route definitions
    ├── index.css                 ← Global styles + Tailwind
    ├── services/
    │   └── api.js                ← Axios API layer (all backend calls)
    ├── pages/
    │   ├── Login.jsx             ← User login (JWT → localStorage)
    │   ├── Register.jsx          ← User registration
    │   ├── Dashboard.jsx         ← Main dashboard (payments, contacts, wallet, transactions)
    │   ├── Goals.jsx             ← Goals management (table, add manual/link, prediction graph)
    │   └── Chatbot.jsx           ← AI financial assistant chat UI
    └── components/
        ├── Navbar.jsx            ← Top navigation bar
        ├── PaymentActions.jsx    ← Quick payment action buttons
        ├── PaymentModal.jsx      ← UPI-style payment modal
        ├── RoundUpPopup.jsx      ← Smart round-up savings popup (dynamic from backend)
        ├── ContactCard.jsx       ← Contact avatar card
        ├── SavingsCard.jsx       ← Savings wallet display
        ├── TransactionList.jsx   ← Transaction history with round-up badges
        ├── GoalsTable.jsx        ← Goals data table
        ├── GoalRow.jsx           ← Single goal row in table
        ├── GoalCard.jsx          ← Goal card (visual)
        ├── PriorityGoalCard.jsx  ← Priority-based goal card
        ├── ProgressBar.jsx       ← Savings progress bar
        ├── PredictionGraph.jsx   ← Recharts savings prediction graph
        ├── AddGoalFromLink.jsx   ← Paste product URL → auto-create goal
        └── ChatMessage.jsx       ← Single chat message bubble
```

---

## 🚀 Running the Frontend

```bash
cd frontend
npm install
npm run dev       # Development server (http://localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

---

## 🔗 API Connection

All API calls go through `src/services/api.js` using Axios.

**Base URL:** `http://localhost:5000/api`

The JWT token is stored in `localStorage` as `token` and automatically attached to every request via an Axios interceptor.

### Available API Functions

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `loginUser(data)` | POST | `/auth/login` | Login → returns JWT |
| `registerUser(data)` | POST | `/auth/register` | Register new user |
| `getGoals()` | GET | `/goals` | Fetch all user goals |
| `createGoal(data)` | POST | `/goals` | Create a new goal |
| `deleteGoal(id)` | DELETE | `/goals/:id` | Delete a goal |
| `buyGoal(id)` | POST | `/goals/:id/buy` | Buy a goal (deduct wallet) |
| `makePayment(data)` | POST | `/pay` | Make payment (triggers round-up) |
| `getTransactions()` | GET | `/transactions` | Fetch transaction history |
| `askAI(data)` | POST | `/ai/ask` | Ask AI assistant |
| `fetchProduct(data)` | POST | `/product/fetch` | Scrape product from URL |

---

## 📄 Pages

### `/login` — Login
- Email + password form → calls `loginUser()`
- Stores JWT `token` and `pennywise_user` in localStorage
- Redirects to `/dashboard`

### `/register` — Register
- Name + email + password form → calls `registerUser()`
- Redirects to `/login` on success

### `/dashboard` — Dashboard
- **Savings wallet** banner with real balance from backend
- **Quick payment actions** (Send Money, Pay Bills, etc.)
- **Contacts** grid for quick UPI-style payments
- **Payment modal** → calls `makePayment()` → shows **RoundUpPopup** with real dynamic savings from the backend
- **Transaction list** with round-up savings badges

### `/goals` — Goals Management
- **Goals table** with progress bars, priority badges, delete & buy actions
- **Add Goal manually** (name, target price, priority)
- **Add from Product Link** — paste Amazon/Flipkart URL → auto-extracts product details
- **Prediction graph** (Recharts) showing projected savings timeline
- Auth guard: redirects to `/login` if no token

### `/chat` — AI Assistant
- Chat interface with Gemini 2.0 Flash
- Falls back to offline keyword-matched tips if API is down
- Financial advisor persona focused on savings, budgets & investments

---

## 🎨 Design System

- **Theme:** Dark gradient fintech (slate-900 → slate-800)
- **Accent colours:** Emerald (savings), Indigo (actions), Amber (warnings)
- **CSS:** Tailwind CSS v4 utility-first
- **Icons:** Lucide React
- **Charts:** Recharts
- **Animations:** CSS `animate-fadeIn`, `animate-slideUp`

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client for API calls |
| `tailwindcss` | Utility-first CSS |
| `@tailwindcss/vite` | Tailwind Vite plugin |
| `lucide-react` | Icon library |
| `recharts` | Charts & data visualisation |
| `vite` | Build tool & dev server |
| `typescript` | Type checking |

---

## 🔧 Environment

The frontend expects the backend to be running on `http://localhost:5000`. To change this, edit the `baseURL` in `src/services/api.js`.
