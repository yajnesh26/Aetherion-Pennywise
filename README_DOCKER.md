# 🐳 PennyWise Docker Deployment (EC2)

This guide helps you deploy the full PennyWise stack using Docker and Docker Compose.

## 1. Prerequisites
- Docker and Docker Compose installed on your EC2.
- A `.env` file in the root directory containing all your keys.

## 2. Root .env Configuration
Create a `.env` file in the root `Aetherion-Pennywise/` directory. This is used by Docker Compose to pass build-time arguments to the frontend.

```env
# BACKEND KEYS (used at runtime)
GROQ_API_KEY=your_groq_key
FIREBASE_PROJECT_ID=your_id

# FRONTEND KEYS (used at BUILD time)
VITE_API_URL=http://<your-ec2-ip>:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. How to Deploy

Clone the repo on your EC2, navigate to the folder, and run:

```bash
# Build and start in background
docker-compose up --build -d
```

## 4. Troubleshooting
- **Security Groups**: Ensure your EC2 Security Group allows inbound traffic on port `80` (Frontend) and `5000` (Backend API).
- **Navigation Errors**: If page refreshes give a 404, ensure `nginx.conf` was copied correctly into the frontend container.
- **CORS**: If the frontend can't talk to the backend, check that the `VITE_API_URL` in your root `.env` matches the public IP or domain of your EC2.

---
PennyWise is now containerized and ready for the cloud! 🚀
