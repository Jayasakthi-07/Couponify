# Couponify

A local-only, high-end React prototype demonstrating a virtual credit-based coupon exchange system.

## 🚀 How to Run

The application consists of a Backend (Node/Express) and a Frontend (React). You need to run both concurrently.

### 1. Prerequisites
- Node.js installed
- MongoDB installed and running locally (`mongodb://127.0.0.1:27017`)

### 2. Quick Start

**Terminal 1: Start Backend**
```bash
cd server
npm install  # (Only first time mattum pannu)
npm run seed # (Optional: Resets/Seeds Database)
npm run dev
```
*Server runs on: `http://localhost:5000`*

**Terminal 2: Start Frontend**
```bash
cd client
npm install  # (Only first time mattum pannu )
npm run dev
```
*App runs on: `http://localhost:5173`*

### 3. Login Credentials (Demo)
- **User**: `user1@demo.com` / `password123`
- **Admin**: `nazeer@admin.com` / `Nazeer@2026`

## 🧪 Simulation Features
- **Credits**: Fixed rate ₹115 = 100 Credits.
- **Payments**: Dummy simulation (updates wallet instantly).
- **Ads**: Simulated 5s video delay for reward.
- **Scratch Card**: Weekly available visual scratcher.
