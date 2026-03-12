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

## ⚙️ Environment Variables

Create a `.env` file in the `Backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pennywise
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_gemini_api_key
```

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
{ "amount": 87, "description": "Coffee" }
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "originalAmount": 87,
    "roundedAmount": 96,
    "savedAmount": 9,
    "description": "Coffee"
  },
  "roundUpSaved": 9,
  "savingsWallet": 142,
  "message": "₹9 spare change saved to your wallet!"
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
| `POST` | `/api/ai/ask` | Ask the AI financial assistant | ✅ |

**Body:**
```json
{ "message": "How can I save more money?" }
```

Uses **Google Gemini 2.0 Flash**. If the API is unavailable, falls back to keyword-matched offline financial tips.

---

### 🛒 Product Scraper

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
