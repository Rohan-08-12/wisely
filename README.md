# Wisely MVP - Personal Finance App

A minimal personal finance app for tracking spending limits and savings goals.

## 🚀 Features

- **Authentication**: Secure user registration and login
- **Bank Integration**: Connect bank accounts via Plaid Sandbox
- **Goal Tracking**: Create spending limits and savings goals
- **Transaction Monitoring**: Automatic transaction import and categorization
- **Smart Notifications**: Alerts when limits are exceeded or milestones reached
- **Dashboard**: Overview of financial progress and recent activity

## 📁 Project Structure

```
wisely-mvp/
├── backend/          # Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   ├── middleware/ # Auth & error handling
│   │   └── server.js # Main server file
│   ├── prisma/       # Database schema
│   └── package.json
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── stores/    # State management
│   │   └── services/  # API client
│   └── package.json
├── README.md
└── .gitignore
```

## 🛠 Tech Stack

- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT Auth
- **Frontend**: React 18, Vite, React Router, Zustand, TanStack Query
- **Banking**: Plaid Sandbox API
- **Styling**: Tailwind CSS
- **Deployment**: Ready for fly.io/Render/Railway/Heroku

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Plaid account (for sandbox credentials)

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database and Plaid credentials
npm run db:generate
npm run db:push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp env.example .env
npm run dev
```

### Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Plaid Integration
- `POST /api/plaid/link-token` - Get Plaid link token
- `POST /api/plaid/exchange` - Exchange public token
- `POST /api/plaid/sync` - Manual transaction sync

### Goals & Transactions
- `GET /api/goals` - List user goals
- `POST /api/goals` - Create goal
- `GET /api/transactions` - List transactions
- `GET /api/dashboard` - Dashboard data

## 🎯 Goal Types

### LIMIT Goals
- Track spending in specific categories (Coffee, Restaurants, etc.)
- Set weekly or monthly limits
- Get notifications when limits are exceeded

### SAVINGS Goals
- Set target amounts for savings
- Track progress from credit transactions
- Get milestone notifications (25%, 50%, 75%, 100%)

## 🔧 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/wisely_dev
BETTER_AUTH_SECRET=your-jwt-secret
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-sandbox-secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000/api
VITE_PLAID_ENV=sandbox
```

## 📊 Database Schema

Key models:
- `User` - User accounts and authentication
- `Goal` - Spending limits and savings goals
- `Transaction` - Bank transactions with categorization
- `PlaidItem` - Connected bank accounts
- `Notification` - Goal-triggered notifications

## 🚀 Deployment

The app is ready for deployment on:
- **fly.io** - Recommended for full-stack apps
- **Render** - Easy PostgreSQL integration
- **Railway** - Simple deployment
- **Heroku** - Traditional PaaS

See individual README files in backend/ and frontend/ directories for detailed setup instructions.
