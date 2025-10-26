# Wisely Backend Setup

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Plaid account (for sandbox credentials)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your actual values
```

3. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The server will run on http://localhost:4000

## Environment Variables

Required environment variables in `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: JWT secret key
- `PLAID_CLIENT_ID`: Your Plaid client ID
- `PLAID_SECRET`: Your Plaid sandbox secret

## API Endpoints

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/plaid/link-token` - Get Plaid link token
- `POST /api/plaid/exchange` - Exchange public token
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `GET /api/transactions` - List transactions
- `GET /api/dashboard` - Dashboard data

## Database Schema

The app uses Prisma with PostgreSQL. Key models:

- `User` - User accounts
- `Goal` - Spending limits and savings goals
- `Transaction` - Bank transactions
- `PlaidItem` - Connected bank accounts
- `Notification` - Goal notifications

