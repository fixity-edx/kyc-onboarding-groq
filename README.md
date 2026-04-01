# Customer Onboarding & KYC Workflow Platform ✅
Groq AI + JWT Auth + RBAC + Stepper Workflow UI

✅ React (Vite) + TailwindCSS (Stepper onboarding + KYC cards)  
✅ Node.js + Express + MongoDB Atlas  
✅ AI: Groq answers user questions based on onboarding stage  
✅ Security: JWT, bcrypt, RBAC, validation, sanitization, Helmet, rate-limit, optional CSRF  
✅ File upload via Multer (local uploads folder)  
✅ Optional emails via Resend free tier

---

## Folder Structure
```
kyc-onboarding-groq-rbac/
  frontend/
  backend/
  README.md
```

---

# Features

## User
- Signup/Login
- Upload KYC documents (Aadhaar/PAN/etc.)
- Track onboarding stage + final status
- Ask AI about the onboarding process (context-aware)

## Admin
- View all submissions
- Verify and approve/reject
- Tracks onboarding stage for each user

---

# 1) Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend: `http://localhost:5000`

Fill `.env`:
- `MONGODB_URI`
- `JWT_SECRET`
- `GROQ_API_KEY`

---

# 2) Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

---

# RBAC - Create Admin
All signups are created as `role=user`.

Make admin:
MongoDB Atlas → `users` collection → change role:
```json
"role": "admin"
```

Login again → admin dashboard enabled.

---

# Groq AI Setup
From console.groq.com:
```
GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-8b-instant
```

---

# Deployment (Free Tier)

## Backend → Render
- Root: `backend`
- Build: `npm install`
- Start: `npm start`
- Add Render Disk if you want persistent uploads (optional)

## Frontend → Vercel
- Root: `frontend`
- Env var:
```
VITE_API_BASE_URL=https://<render-backend-url>
```

---

# Security Notes (Viva)
- bcrypt hashing
- JWT + token expiry
- logout invalidation (blacklist TTL)
- helmet security headers
- rate limiter
- validation + sanitization
- optional CSRF (`ENABLE_CSRF=1`)
- HTTPS-ready

---

## Author
Final Year BTech Mini Project - Customer Onboarding & KYC Platform
