# 💰 PennyWise — Smart Savings & Micro-Investment

PennyWise is a modern, high-performance fintech application designed to make saving effortless. It combines a premium user interface with powerful micro-investment logic, enabling users to track goals, manage transactions, and save automatically through intelligent round-ups and an integrated AI Financial Assistant.

---

## 🏗️ Project Architecture

The project follows a decoupled **Client-Server** architecture:

- **Frontend**: A React single-page application (SPA) focused on user experience, real-time tracking, and dashboard management.
- **Backend**: A Node.js/Express server that handles secure API communication, AI processing, and sensitive data masking.

---

## ✨ Key Features

- **🚀 Instant Dashboard**: A Google Pay/CRED-inspired home screen for quick actions and overview.
- **📈 Goal Tracking**: Create and manage specific savings targets (e.g., "New Laptop", "Emergency Fund") with visual progress bars.
- **🔄 Smart Round-Ups**: Automatically calculates "spare change" from transactions and adds them to your savings.
- **🤖 AI Financial Assistant**: An integrated chatbot powered by **Groq AI** that provides savings tips and financial insights.
- **🔒 Secure Authentication**: Robust user management powered by Firebase Auth.
- **📱 Premium UX**: Dark-mode first design using glassmorphism, fluid animations (Lucide), and a mobile-responsive layout.

---

## 🛠️ Technology Stack

### **Frontend**
- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore + Authentication)
- **Icons**: [Lucide React](https://lucide.dev/)

### **Backend**
- **Core**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Environment**: [Nodemon](https://nodemon.io/) + [Dotenv](https://github.com/motdotla/dotenv)
- **AI Integration**: [Groq AI API](https://groq.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### 2. Installation
Clone the repository and install dependencies for both parts:

**Backend Setup:**
```bash
cd backend
npm install
```

**Frontend Setup:**
```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Configuration

### **Backend (.env)**
Create a `.env` file in the `backend` folder:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
```

### **Frontend (.env)**
Create a `.env` file in the `frontend` folder:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

---

## 📂 Project Structure

```text
Aetherion-Pennywise/
├── backend/               # Node.js Server
│   ├── routes/           # Express API endpoints
│   ├── services/         # Business logic (AI processing)
│   ├── .env              # Backend secrets
│   └── index.js          # Entry point
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Main screens (Dashboard, AI Chat)
│   │   ├── services/     # Firebase & Backend API calls
│   │   └── App.tsx       # Routing
│   ├── .env              # Frontend config
│   └── vite.config.ts    # Vite settings
└── README.md              # Documentation
```

---

## 🏃‍♂️ Running the Application

You will need two terminals running simultaneously:

1. **Terminal 1 (Backend):**
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```

---

## 📝 Roadmap
- [ ] Integration with real-world UPI APIs.
- [ ] Advanced data visualization (Heatmaps for spending).
- [ ] Multi-currency support.
- [ ] Push notifications for savings goals.

---

## 📄 License
This project is licensed under the ISC License.
