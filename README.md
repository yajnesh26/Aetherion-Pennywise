# 💰 PennyWise — Smart Savings & Micro-Investment Platform

> **Team Aetherion** — Aakriti Hackathon 2026

PennyWise is a full-stack fintech application that helps users build savings habits through **smart round-up micro-savings**, **goal-based saving**, and an **AI-powered financial assistant**.

Every time you make a payment, PennyWise automatically rounds up the amount and saves the spare change into your savings wallet — making saving effortless.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔄 **Smart Round-Up Savings** | Dynamic 5–10% spare-change savings on every payment — varies naturally each time |
| 🎯 **Goal-Based Saving** | Create savings goals manually or by pasting Amazon/Flipkart product links |
| 🛒 **Product Link Import** | Paste a product URL → auto-extracts name, price & image → creates a goal |
| 🤖 **AI Financial Assistant** | Gemini 2.0 Flash powered chatbot with offline fallback for financial tips |
| 💸 **UPI-Style Payments** | Simulated payment dashboard with contacts, payment actions & transaction history |
| 📊 **Savings Analytics** | Visual progress bars, prediction graphs & priority-based goal tracking |

---

## 🏗️ Project Structure

```
Aetherion-Pennywise/
├── Backend/          ← Node.js + Express + MongoDB API server
├── frontend/         ← React + Vite + Tailwind CSS SPA
├── AI-Service/       ← AI service module
├── package.json      ← Root package.json
└── README.md         ← You are here
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`
- **npm** v9+

### 1. Clone the repository

```bash
git clone https://github.com/yajnesh26/Aetherion-Pennywise.git
cd Aetherion-Pennywise
```

### 2. Start the Backend

```bash
cd Backend
npm install
# Copy .env.example to .env and edit values (see Backend/README.md for details)
npm start
```

The server will attempt to connect to the URI in `MONGO_URI`; if that variable is missing it defaults to `mongodb://127.0.0.1:27017/pennywise`. Make sure a MongoDB instance is running locally or provide a valid connection string.

Server starts on **http://localhost:5000**

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens on **http://localhost:5173**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router v7, Recharts, Lucide Icons |
| **Backend** | Node.js, Express 4, MongoDB, Mongoose 8, JWT Authentication |
| **AI** | Google Gemini 2.0 Flash + Offline Fallback |
| **Scraping** | Cheerio + Axios (Amazon/Flipkart product extraction) |

---

## 📖 Documentation

- [**Backend README**](./Backend/README.md) — API endpoints, environment setup, architecture
- [**Frontend README**](./frontend/README.md) — Components, pages, build instructions

---

## 👥 Team Aetherion

Built with ❤️ for the Aakriti Hackathon 2026.
