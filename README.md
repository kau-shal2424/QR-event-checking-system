# QR Event Check-In System

A modern, mobile-first QR code check-in system designed for campus events. This system allows administrators to manage events, import participants via CSV, and securely scan QR codes at the door for fast, reliable entry.

## 🚀 Features
- **Centralized Admin Dashboard:** Create and manage events with ease.
- **Bulk Participant Import:** Upload CSV files with built-in duplicate detection.
- **Secure QR Generation:** Tokens signed with HMAC-SHA256 and hashed in the database for maximum security.
- **Mobile-Web Scanner:** Real-time QR scanning using the camera, featuring haptic/audio feedback and offline-ready design.
- **Atomic Check-Ins:** Prevents duplicate entries with atomic database updates.
- **Real-time Analytics:** Track check-in progress and metrics LIVE.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS (Modern Glassmorphism UI)
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Security:** JWT Authentication, Bcrypt password hashing, HMAC Token signatures
- **Libraries:** `@zxing/library` (QR Scanning), `csv-parser`, `axios`

## 📦 Project Structure
```text
├── backend/            # Express API & MongoDB Models
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   └── utils/          # Token generation & CSV logic
├── frontend/           # Vite + React Single Page App
│   ├── src/pages/      # Dashboard, Scanner, Auth pages
│   ├── src/components/ # Reusable UI components
│   └── src/services/   # API abstraction layer
└── README.md           # Project documentation
```

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
HMAC_SECRET=your_hmac_secret
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

## 🛡️ Security Note
This project uses **one-way hashing** for QR tokens. The server never stores the raw token, only its hash. This ensures that even if the database is compromised, invitations cannot be forged.


