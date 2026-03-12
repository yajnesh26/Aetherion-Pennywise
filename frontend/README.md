# 💰 PennyWise — Smart Savings & Micro-Investment

PennyWise is a modern, high-performance fintech application designed to make saving effortless. It combines a premium user interface with powerful micro-investment logic, allowing users to track goals, manage transactions, and save automatically through intelligent round-ups.

---

## ✨ Key Features

- **🚀 Instant Dashboard**: A Google Pay/CRED-inspired home screen for quick actions and overview.
- **📈 Goal Tracking**: Create and manage specific savings targets (e.g., "New Laptop", "Emergency Fund") with visual progress bars.
- **🔄 Smart Round-Ups**: Automatically calculates "spare change" from simulated transactions and adds them to your savings.
- **🤖 AI Financial Assistant**: An integrated chatbot that provides insights and answers questions about your spending habits.
- **🔒 Secure Authentication**: Robust user management powered by Firebase Auth.
- **📱 Premium UX**: Dark-mode first design using glassmorphism, fluid animations, and a mobile-responsive layout.

---

## 🛠️ Technology Stack

- **Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore + Authentication)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed on your machine.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/aetherion-pennywise.git
cd Aetherion-Pennywise/frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the `frontend` directory and populate it with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Configuration
To ensure the app works correctly, you **must**:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password** authentication in the "Authentication" tab.
3. Create a **Firestore Database** in "Test Mode" or with appropriate rules to allow writes to the `users`, `goals`, and `transactions` collections.

### 5. Running the App
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the next available port).

---

## 📂 Project Structure

```text
frontend/
├── src/
│   ├── components/    # Reusable UI components (Navbar, Modal, Cards)
│   ├── contexts/      # Global state (AuthContext)
│   ├── pages/         # Screen components (Dashboard, Goals, Chatbot)
│   ├── services/      # Firebase and API logic
│   ├── App.tsx        # Main routing and layout
│   └── index.css      # Core theme and Tailwind configuration
└── public/            # Static assets
```

---

## 📝 Roadmap
- [ ] Integration with real-world UPI APIs.
- [ ] Advanced data visualization (Charts for spending patterns).
- [ ] Multi-currency support.
- [ ] Push notifications for savings milestones.

---

## 📄 License
This project is licensed under the ISC License.
