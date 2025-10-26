# Wisely Frontend Setup

## Prerequisites

- Node.js 18+
- Backend server running on port 4000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env if needed (defaults should work for local development)
```

3. Start the development server:
```bash
npm run dev
```

The app will run on http://localhost:5173

## Features

- **Authentication**: Sign up, login, logout
- **Dashboard**: Overview of goals and recent transactions
- **Goals**: Create and manage spending limits and savings goals
- **Transactions**: View and filter bank transactions
- **Bank Connection**: Connect bank accounts via Plaid

## Tech Stack

- React 18 with Vite
- React Router for navigation
- Zustand for state management
- TanStack Query for server state
- Tailwind CSS for styling
- Lucide React for icons

## Key Components

- `Layout` - Main app layout with navigation
- `DashboardPage` - Home dashboard
- `GoalsPage` - Goal management
- `TransactionsPage` - Transaction listing
- `PlaidConnectPage` - Bank account connection
- `LoginPage` / `SignupPage` - Authentication

## State Management

- `authStore` - User authentication state
- TanStack Query - Server state caching
- Local component state for forms

