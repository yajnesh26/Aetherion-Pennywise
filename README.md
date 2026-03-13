# 💰 PennyWise — AI-Powered Fintech & behavioral Savings Platform

PennyWise is a high-end, full-stack fintech ecosystem designed to revolutionize how users save and manage money. It combines **AI-driven behavioral coaching**, **automated micro-investing**, and **gamified "Money Missions"** to transform financial discipline from a chore into an engaging experience.

Built with a premium "Bento Grid" aesthetic, PennyWise offers a seamless interface for tracking goals, identifying spending leaks, and optimizing net worth through interactive, data-driven insights.

---

## 🏗️ Core Architecture & Tech Stack

PennyWise utilizes a robust **Client-Server-Middleware** architecture designed for scalability and secure AI orchestration.

| Layer | Technologies | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion | High-performance, glass-morphic UI with micro-interactions. |
| **Backend** | Node.js, Express, Axios | API orchestration, AI context management, and secure proxying. |
| **Logic/AI** | Groq Llama 3.3 (70B), Custom Analysis Services | Real-time spending analysis and personalized coaching advice. |
| **Database** | Firebase Firestore (NoSQL) | Real-time synchronization of transactions, goals, and user states. |
| **Security** | Firebase Auth, Environment Decoupling | Secure user sessions and protected API keys. |

---

## ✨ Key Features & Innovation

### 📊 1. Bento Grid "Collage" Dashboard
*   **High-End Aesthetic**: Move beyond traditional lists with a modern bento-style layout featured in premium apps like Apple and CRED.
*   **Live Net Worth Tracking**: A real-time "Super Card" that visualizes bank balance, automated savings, and day streaks.
*   **Action Hub**: One-tap access to core operations (Recharge, Bills, Send Money).

### 🤖 2. AI Financial Coach (Real-Time Brain)
*   **Behavioral Analysis**: Automatically categorizes transactions (Food, Shopping, Services) and identifies high-risk spending patterns.
*   **Financial Health Score**: A proprietary 0-100 score calculated based on savings-to-spending ratios and consistency.
*   **Coach Spotlight**: A conversational messenger-style UI where the AI provides 3 daily actionable insights based on your recent activity.

### 🎮 3. AI Money Missions (Gamification)
*   **XP-Based Leveling**: Users earn an "Impact Score" by completing behavioral tasks.
*   **Data-Verified Tasks**: Missions like "Round-up Streak" or "Dining Discipline" are verified by scanning live Firestore transaction data—they only complete when you *actually* save.
*   **Behavioral Nudges**: Encourages users to skip luxury spending (Zomato/Swiggy) and contribute to long-term goals.

### 🎯 4. "Dream Tracker" & Automated Savings
*   **URL-to-Goal Integration**: Users can paste Amazon/Flipkart links; the system normalizes the data to track towards the specific purchase.
*   **Smart Allocation**: Every time you spend, PennyWise calculates a "Round-up". You get a popup to choose exactly which goal this spare change should fund.
*   **Savings Projection**: Interactive **Recharts** visualizations that predict when you'll achieve your goal based on your current daily saving rate.

### 📸 5. Integrated Payments & QR Scanner
*   **Real-time Scanning**: Integrated `html5-qrcode` library for a professional, in-browser camera scanner.
*   **UPI Protocol Parsing**: Automatically extracts Recipient Name and UPI ID from QR codes to streamline the payment flow.
*   **Manual Entry Mode**: Support for both phone-number based and VPA-based (UPI) manual recipients.

---

## 📂 System Folder Structure

```text
Aetherion-Pennywise/
├── backend/               # Node.js Express API
│   ├── config/           # Firebase Admin & Service configs
│   ├── services/         # Coaching Logic, Analyzer, AI Service
│   ├── routes/           # Secure AI & Auth Endpoints
│   └── index.js          # Entry point
├── frontend/              # Vite + React Client
│   ├── src/
│   │   ├── components/   # UI: QRScanner, AIInsights, PaymentModal
│   │   ├── pages/        # Dashboard, MoneyMissions, Goals, Chat
│   │   ├── services/     # Frontend Firestore & API handlers
│   │   └── utils/        # Savings logic & Date formatting
└── README.md              # Project Documentation
```

---

## 🚀 Deployment Guide

### **Backend (Node.js)**
1.  Navigate to `/backend`.
2.  Install dependencies: `npm install`.
3.  Set up `.env`: `PORT`, `GROQ_API_KEY`, `FIREBASE_PROJECT_ID`.
4.  Run: `npm start`.

### **Frontend (Vite)**
1.  Navigate to `/frontend`.
2.  Install dependencies: `npm install`.
3.  Set up `.env`: All `VITE_FIREBASE_*` keys and `VITE_API_URL`.
4.  Run: `npm run dev` or `npx vite build` for production.

---

## 🛡️ Future Roadmap
- [ ] **Digital Gold**: Live tracking and micro-investment into real-time gold prices.
- [ ] **Smart Notifications**: Push alerts when the AI identifies a potential fraudulent or unusually high spending pattern.
- [ ] **P2P Savings Groups**: Invite friends to save collaboratively for group trips or events.
