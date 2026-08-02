# FinGuard

**FinGuard** is an AI-powered personal finance platform — track spending, manage budgets, and get AI-driven insights on your credit, loan eligibility, investments, and fraud risk, all in one dark, premium dashboard.

![FinGuard](https://img.shields.io/badge/status-in--development-blue) 

---

## Features

- **Dashboard** — balance, income vs. expense, savings, a financial health score, spending trends, budget progress, recent activity, and AI tips at a glance
- **Expense Tracker** — add, edit, delete, search, and filter transactions; category and monthly trend charts; receipt upload
- **Budget Planner** — set monthly limits per category with progress bars and overspend alerts
- **AI Insights** — automated observations about your spending patterns
- **Credit Score Prediction** — a gauge-based score with risk level, reasons, and improvement tips
- **Loan Eligibility Checker** — eligibility, approval probability, estimated amount, interest rate, and EMI
- **Fraud Detection** — per-transaction risk scoring with a location risk breakdown and flagged-transaction highlighting
- **Investment Advisor** — a recommended asset allocation based on risk tolerance, goals, and time horizon
- **AI Financial Chatbot** — a conversational assistant for quick financial questions
- **Profile & Settings** — personal info, financial goals, notification preferences, and account security
- **Admin Dashboard** — platform-wide stats, top users, activity feed, and system health

## Tech Stack

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Framer Motion (animation)
- Recharts (charts)
- React Hook Form (forms & validation)

**Backend**
- Node.js + Express
- JWT authentication (bcrypt-hashed passwords)
- In-memory data layer (structured for a drop-in swap to MongoDB/Mongoose)

**AI logic**
- Rule-based scoring and recommendation engines, isolated behind clean service functions so they can be swapped for real ML models or an LLM API without touching the frontend

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or later

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The API runs at `http://localhost:4000`.

### 2. Frontend

In a separate terminal:

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

### 3. Use it

Open `http://localhost:5173` and create an account with any name, email, and a password of 6+ characters. Your new account is automatically seeded with realistic demo data (transactions, budgets, fraud records, investments, a loan, and a credit report) so every page has something to show right away.

## Environment Variables

**`server/.env`**
| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `4000` |
| `JWT_SECRET` | Secret used to sign JWTs — change this in production | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CLIENT_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

**`.env`** (frontend)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for the API | `http://localhost:4000/api` |

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get the current user |
| PUT | `/api/auth/change-password` | Update password |
| GET/POST/PUT/DELETE | `/api/transactions` | Manage transactions |
| GET/POST/PUT/DELETE | `/api/budgets` | Manage budgets |
| GET | `/api/ai/insights` | AI spending insights |
| POST | `/api/ai/credit-score` | Predict credit score |
| POST | `/api/ai/loan-eligibility` | Check loan eligibility |
| GET | `/api/ai/fraud-detection` | Score transactions for fraud risk |
| POST | `/api/ai/investment-recommendation` | Get an investment allocation |
| POST | `/api/ai/chat` | Chat with the AI assistant |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/admin/stats` | Platform-wide admin stats |

All routes except `/api/auth/register` and `/api/auth/login` require a `Authorization: Bearer <token>` header.

## Project Structure

```
src/                     Frontend (Vite + React)
├─ components/           Sidebar, Modal, GaugeMeter, ErrorBoundary, shared UI
├─ pages/                One file per route
├─ layouts/               App shell (sidebar + routed content)
├─ context/               Auth state and JWT session handling
├─ api/                   Typed fetch client
├─ hooks/                 Data-fetching hooks (transactions, budgets)
├─ types/                 Shared TypeScript interfaces
└─ utils/                 Formatting helpers

server/                  Backend (Express)
├─ src/routes/            auth, finance, ai, users, admin
├─ src/services/ai.js     Scoring & recommendation logic
├─ src/data/              In-memory data layer + seed generator
└─ src/middleware/        JWT auth middleware
```

## Roadmap

- Persist data in MongoDB instead of in-memory storage
- Replace rule-based AI logic with real ML models / an LLM integration
- Add a proper role system (currently any signed-in user can view the Admin Dashboard)
- Real file storage for receipts and profile photos
- Persist notification and theme preferences

