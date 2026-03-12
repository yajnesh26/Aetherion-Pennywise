# 🔧 PennyWise Backend

> Node.js + Express + MongoDB REST API

---

## 📁 Folder Structure

```
Backend/
├── server.js                 ← Express app entry point
├── config/
│   └── db.js                 ← MongoDB connection (Mongoose)
├── middleware/
│   └── authMiddleware.js     ← JWT authentication guard
├── models/
│   ├── User.js               ← User schema (name, email, password, savingsWallet)
│   ├── Goal.js               ← Savings goal schema (itemName, targetPrice, image, priority)
│   └── Transaction.js        ← Transaction schema (originalAmount, roundedAmount, savedAmount)
├── controllers/
│   ├── authController.js     ← Register & Login with JWT
│   ├── goalController.js     ← CRUD for savings goals + buy action
│   ├── paymentController.js  ← Smart round-up payments & transaction history
│   ├── aiController.js       ← Gemini AI chatbot + offline fallback
│   └── productController.js  ← Amazon/Flipkart product URL scraper
├── routes/
│   ├── authRoutes.js         ← /api/auth/*
│   ├── goalRoutes.js         ← /api/goals/*
│   ├── paymentRoutes.js      ← /api/pay, /api/transactions
│   ├── aiRoutes.js           ← /api/ai/ask
│   └── productRoutes.js      ← /api/product/fetch
├── .env                      ← Environment variables (not committed)
└── package.json
```

---

## 🗄️ MongoDB Setup

The API relies on a MongoDB database. You can either run a **local server** or use an **Atlas cluster**.

### Running MongoDB locally

1. Install the [MongoDB Community Server](https://www.mongodb.com/try/download/community) or use a package manager.
2. Start the daemon (adjust path if necessary):
   ```powershell
   mongod --dbpath C:\data\db   # Windows example; create the directory first
   # or simply run the MongoDB service if installed as a service
   ```
3. Verify it’s running:
   ```bash
   mongo --eval "db.stats()"
   ```

> If you see `exit code 1`, check the log output – common issues are missing data directory or a port conflict.

### Using Atlas

Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), obtain the connection string, and set it as `MONGO_URI` in `.env`.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the `Backend/` folder and adjust values as needed.

```env
# .env example (also provided as .env.example)
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pennywise   # local Mongo URI used by default if not set
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_gemini_api_key
```

> **Note:** If you forget to set `MONGO_URI`, the server will automatically fall back to the local URI above and log a helpful message. Make sure MongoDB is running on your machine or provide a valid connection string (Atlas, Docker container, etc.).

---

## 🚀 Running the Server

```bash
cd Backend
npm install
npm start        # Production
npm run dev      # Development (nodemon hot-reload)
```

Server starts on **http://localhost:5000**

---

## 📡 API Endpoints

All protected routes require the header:  
`Authorization: Bearer <jwt_token>`

### 🔐 Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login → returns JWT token | ❌ |

**Register body:**
```json
{ "name": "John", "email": "john@example.com", "password": "mypassword" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "mypassword" }
```

**Response:**
```json
{ "success": true, "token": "eyJhbGciOi..." }
```

---

### 🎯 Goals

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/goals` | Get all goals for logged-in user | ✅ |
| `POST` | `/api/goals` | Create a new savings goal | ✅ |
| `DELETE` | `/api/goals/:id` | Delete a goal | ✅ |
| `POST` | `/api/goals/:id/buy` | Mark goal as purchased (deduct from wallet) | ✅ |

**Create goal body:**
```json
{
  "itemName": "iPhone 15",
  "targetPrice": 79900,
  "image": "https://...",
  "priority": "high"
}
```

---

### 💸 Payments & Transactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/pay` | Make a payment (triggers smart round-up) | ✅ |
| `GET` | `/api/transactions` | Get all transactions for the user | ✅ |

**Payment body:**
```json
{ "phoneNumber": "9876543210", "amount": 87, "description": "Coffee" }
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "phoneNumber": "9876543210",
    "originalAmount": 87,
    "roundedAmount": 100,
    "savedAmount": 13,
    "description": "Coffee",
    "createdAt": "2026-03-13T12:34:56.789Z"
  },
  "savingsWallet": 19,
  "message": "₹13 spare change saved from your payment!"
}
```

#### Smart Round-Up Logic

The saved amount is **5–10% of the transaction amount**, with a random jitter so identical payments produce slightly different savings:

| Payment | Saved (varies) | % |
|---------|----------------|---|
| ₹87 | ₹5 – ₹9 | 5–10% |
| ₹142 | ₹8 – ₹14 | 5–10% |
| ₹1263 | ₹64 – ₹126 | 5–10% |

---

### 🤖 AI Assistant

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ai/ask` | Ask AI about PennyWise, money-saving tips, investing, or budgeting | ✅ |

**Request Body:**
```json
{ "question": "How can I save more money?" }
```

**Response:**
```json
{
  "success": true,
  "answer": "💡 Money-Saving Tips from PennyWise...",
  "usedFallback": false,
  "tips": { "message": "Try asking: How do round-up savings work? ..." }
}
```

**How it works:**
1. ✅ Uses **Google Gemini 2.0 Flash** for intelligent, personalized responses
2. 📚 Powered by system prompt with PennyWise context (features, benefits, philosophy)
3. 🛡️ **Fallback mode**: If Gemini API is unavailable/invalid, uses offline knowledge base
4. 💬 Answers questions about:
   - Round-up savings mechanics
   - Creating & tracking goals
   - Money-saving strategies & budgeting tips
   - Investment basics & compound interest
   - Transaction tracking & progress monitoring

**Available Topics (Fallback Knowledge Base):**
- `round-up`: How automatic round-up savings work
- `goals`: Creating and tracking savings goals
- `wallet`: Savings wallet and balance management
- `money-saving`: Practical financial tips & budgeting advice
- `investment`: Investment basics, mutual funds, compound interest
- `tracking`: How to monitor progress and transactions
- `features`: Complete overview of PennyWise capabilities

**Example Queries:**
```bash
# Creative financial questions
"What are the best beginner investments?"
"How should I use the 50/30/20 budgeting rule?"
"Explain compound interest in simple terms"

# PennyWise-specific
"How do round-up savings work?"
"How do I create a savings goal?"
"Can I add a product link to auto-create a goal?"
```

---

### � User Profile

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `PUT` | `/api/user/profile` | Update logged-in user's phone/account/UPI details | ✅ |

**Request body:**
```json
{
  "phoneNumber": "9876543210",
  "accountNumber": "123456789012",
  "ifscCode": "SBIN0001234",
  "upiId": "user@upi"
}
```

**Response:**
```json
{ "success": true, "user": { /* updated user object without password */ } }
```

Phone number is validated to be exactly 10 digits. Account number must be numeric.

---

### �🛒 Product Scraper

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/product/fetch` | Extract product info from Amazon/Flipkart URL | ✅ |

**Body:**
```json
{ "url": "https://www.amazon.in/Samsung-Galaxy-S24/dp/B0CHX..." }
```

**Response:**
```json
{
  "success": true,
  "product": {
    "name": "Samsung Galaxy S24",
    "price": 54900,
    "image": "https://m.media-amazon.com/images/...",
    "url": "https://www.amazon.in/...",
    "platform": "Amazon"
  },
  "partial": false
}
```

If the site blocks scraping (CAPTCHA/403), falls back to extracting the product name from the URL slug and returns `"partial": true`.

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT auth tokens |
| `bcryptjs` | Password hashing |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |
| `@google/generative-ai` | Google Gemini AI SDK |
| `axios` | HTTP client (product scraping) |
| `cheerio` | HTML parsing (product scraping) |
| `nodemon` | Dev hot-reload |
