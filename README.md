# 💰 PennyWise — Smart Savings & Micro-Investment Assistant

PennyWise is a production-ready, full-stack fintech platform designed to automate savings. It uses a premium, high-performance interface to help users visualize their financial goals and save money automatically through intelligent transaction round-ups and AI-driven insights.

---

## 🏗️ Technical Architecture

This project is built using a modern **Client-Server** architecture to ensure security, high performance, and scalability.

- **Frontend (Client)**: A high-performance React 19 application built with Vite and Tailwind CSS v4. It focuses on premium UX, real-time data visualization, and interactive goal management.
- **Backend (Server)**: A Node.js/Express proxy server. It secures sensitive operations, manages AI API communication (Groq), and acts as a gateway for future third-party integrations (UPI/Banking).

---

## ✨ Features Implemented (Current State)

### 📊 1. Premium Financial Dashboard
- **Modern Fintech UI**: Inspired by CRED and Google Pay, featuring Glassmorphism, subtle gradients, and dark-mode optimization.
- **AI Insight Panel**: Live dashboard section analyzing spending habits and providing actionable financial advice.
- **Quick Actions**: One-tap access to pay contacts, send money, or scan QR. Supports manual recipient entry (Name/UPI).
- **Micro-animations**: Smooth transitions and progress animations for an engaging experience.

### 🎯 2. "Dream Tracker" Goal Management
- **Smart Goal Cards**: Displays product name, target price, current progress, and remaining days to achieve the goal.
- **Product Integration**: Paste Amazon/Flipkart links to track specific items; includes automatic URL normalization and "Buy Now" redirection.
- **Advanced Metrics**: Real-time calculation of "Remaining Amount" and the required "Daily Saving Rate" to reach goals within 60 days.

### 📈 3. Data Visualization & Projections
- **Savings Projection Graph**: Integrated **Recharts** to visualize future savings trajectories based on real-world historical data.
- **Dynamic Analysis**: Automatically calculates your average daily saving rate from transaction history to predict achievement dates.
- **Interactive Tooltips**: Detailed hover-states showing projected savings for any future day.

### 🤖 4. AI Student Financial Coach
- **Engine**: Powered by **Groq AI (Llama 3.3)** for context-aware financial guidance.
- **Spending Pattern Analyzer**: Analyzes transactions by category (Food, Shopping, etc.) and generates insights if specific categories exceed healthy limits (e.g., >30% spending).
- **Goal Motivation**: Intelligent system providing motivational nudges like "Only ₹350 more to unlock your goal!"

### 🔄 5. Interactive Savings Allocation
- **Manual Goal Selection**: Users now choose exactly which goal to fund after a successful round-up, giving full control over savings.
- **Transaction Linking**: Firestore tracks which transaction funded which goal for a complete audit trail.

### 🔒 6. Security & Authentication
- **Firebase Auth**: Fully implemented Email/Password registration and login.
- **Private Env Management**: Decoupled `.env` files for frontend (Firebase keys) and backend (AI keys).
- **Git Protection**: Robust `.gitignore` preventing sensitive keys or `node_modules` from being pushed to public repositories.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Lucide React, Framer Motion |
| **Backend** | Node.js, Express, Axios, Dotenv, Groq SDK |
| **Database** | Firebase Firestore (NoSQL) |
| **Auth** | Firebase Authentication |
| **AI** | Groq API (Llama-3.3-70b-versatile) |

---

## 📂 Project Structure

```text
Aetherion-Pennywise/
├── backend/               # Express Server
│   ├── services/         # AI Logic & Spending Analyzer
│   ├── routes/           # Secure API endpoints
│   └── index.js          # Entry point
├── frontend/              # Vite + React Client
│   ├── src/
│   │   ├── components/   # UI: GoalCard, SavingsChart, RoundUpPopup
│   │   ├── pages/        # Dashboard, Goals, AI Chat
│   │   ├── utils/        # Projection & Analytics logic
│   │   └── services/     # Firebase & Backend API calls
└── README.md              # Project Documentation
```

---

## 🚀 Deployment & Local Setup

### **1. Setup Backend**
```bash
cd backend
npm install
# Create .env with: PORT=5000, GROQ_API_KEY=your_key
npm run dev
```

### **2. Setup Frontend**
```bash
cd frontend
npm install
# Create .env with: VITE_FIREBASE_* keys and VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## 📝 Planned Roadmap
- [x] **Data Visualization**: Recharts integration for savings projections.
- [x] **Category Analysis**: Spending pattern insights.
- [x] **Interactive Allocation**: Manual goal selection for savings.
- [ ] **Investment Simulation**: Real-time tracking of "Digital Gold" price.
- [ ] **Notification System**: Push alerts for goal milestones.
