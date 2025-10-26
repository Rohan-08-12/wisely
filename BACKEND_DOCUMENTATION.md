# Backend Documentation - Wisely MVP

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema (SQLite)
├── src/
│   ├── server.js               # Express server setup
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── errorHandler.js     # Centralized error handling
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── plaid.js             # Plaid integration
│   │   ├── goals.js             # Goal management
│   │   ├── transactions.js      # Transaction management
│   │   ├── dashboard.js         # Dashboard data aggregation
│   │   ├── notifications.js     # Notifications
│   │   └── chat.js              # AI chat assistant
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── PlaidController.js
│   │   ├── GoalsController.js
│   │   ├── TransactionsController.js
│   │   ├── DashboardController.js
│   │   └── NotificationsController.js
│   └── services/
│       ├── plaidService.js      # Plaid API integration
│       └── goalEvaluationService.js  # Goal progress calculation
└── .env                        # Environment variables
```

## 🗄️ Database Schema (Prisma)

### Models

#### User
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  goals     Goal[]
  transactions Transaction[]
  plaidItems PlaidItem[]
  notifications Notification[]
}
```

#### Goal
```prisma
model Goal {
  id           String   @id @default(uuid())
  title        String
  type         String   // "LIMIT" or "SAVINGS"
  category     String?
  maxSpend     Float?   // For LIMIT goals
  targetAmount Float?   // For SAVINGS goals
  period       String?  // "WEEK", "MONTH", "YEAR"
  createdAt    DateTime @default(now())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  transactions Transaction[]
  notifications Notification[]
}
```

#### Transaction
```prisma
model Transaction {
  id           String   @id @default(uuid())
  amount       Float
  type         String   // "CREDIT" or "DEBIT"
  date         DateTime
  description  String?
  merchantName String?
  category     String?
  goalId       String?
  goal         Goal?    @relation(fields: [goalId], references: [id])
  userId       String
  user         User     @relation(fields: [userId], references: [id])
}
```

## 🔐 Authentication

### Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Middleware
```javascript
const authenticateUser = async (req, res, next) => {
  // Verify JWT token
  // Attach user to req.user
}
```

### Security
- Passwords hashed with `bcrypt` (salt rounds: 10)
- JWT tokens for session management
- Protected routes use `authenticateUser` middleware

## 🏦 Plaid Integration

### Endpoints
- `POST /api/plaid/link/token` - Create link token for bank connection
- `POST /api/plaid/exchange` - Exchange public token for access token
- `POST /api/plaid/transactions/sync` - Sync transactions from Plaid

### Service (`plaidService.js`)
```javascript
class PlaidService {
  // Create Plaid client
  // Fetch transactions
  // Handle API errors gracefully
}
```

### Error Handling
- Handles `PRODUCT_NOT_READY` errors
- Returns empty arrays for failed requests
- Prevents app crashes on Plaid API errors

## 🎯 Goals Management

### Endpoints (`/api/goals`)
- `GET /` - List all user goals
- `POST /` - Create new goal
- `GET /:id` - Get single goal
- `PUT /:id` - Update goal
- `DELETE /:id` - Delete goal

### Goal Types

#### LIMIT Goals
- Track spending limits per category
- Periods: WEEK, MONTH, YEAR
- Shows: spent vs maxSpend, percentage

#### SAVINGS Goals
- Track progress toward target amount
- Shows: saved vs targetAmount, percentage

### Progress Calculation
Handled by `goalEvaluationService.js`:
```javascript
calculateGoalProgress(goal, allTransactions)
  // Calculates progress for both LIMIT and SAVINGS goals
  // Returns: { spent, saved, percent, status }
```

## 💰 Transactions

### Endpoints (`/api/transactions`)
- `GET /` - List all user transactions
- `GET /recent` - Get recent transactions
- `POST /` - Create manual transaction

### Features
- Supports both Plaid and manual transactions
- Categorization by goal/category
- CREDIT and DEBIT types

## 📊 Dashboard

### Endpoint (`GET /api/dashboard`)

Returns aggregated data:
```javascript
{
  goals: [
    {
      id, title, type,
      progress: { spent, saved, percent, status }
    }
  ],
  recentTransactions: [...],
  summary: { totalSpent, totalSaved }
}
```

## 🤖 AI Chat Assistant

### Endpoint (`POST /api/chat`)

**Request:**
```javascript
{
  message: "Review my goals",
  conversation_history: [
    { role: "user", content: "..." },
    { role: "assistant", content: "..." }
  ]
}
```

**Response:**
```javascript
{
  response: "AI generated response",
  updatedGoals: [...],  // If goals were updated
  timestamp: "..."
}
```

### Features

#### 1. Goal Analysis
- Calculates progress for each LIMIT goal
- Identifies exceeded goals (>100%)
- Identifies underused goals (<50%)

#### 2. Smart Suggestions
```javascript
problematicGoals // Exceeded limits (>100%)
underusedGoals   // Underutilized (<50%)
```

#### 3. Auto-Updates
User can approve with:
- "Yes"
- "Apply"  
- "Update"
- "Review my goals and apply"

Updates applied:
- Exceeded: increase by 50%
- Underused: decrease by 30% (only if others are exceeded)

#### 4. Database Integration
- Updates goals directly via Prisma
- Returns confirmation messages
- Refreshes frontend data

## 🔔 Notifications

### Endpoint (`/api/notifications`)
- `GET /` - List all notifications
- `POST /:id/read` - Mark as read

### Types
- GOAL_EXCEEDED
- GOAL_ACHIEVED
- SAVINGS_MILESTONE

## 🛠️ Environment Variables

Required in `.env`:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
BETTER_AUTH_SECRET="your-better-auth-secret"
PORT=5000

# Plaid (optional)
PLAID_CLIENT_ID="your-client-id"
PLAID_SECRET="your-secret"
PLAID_ENV="sandbox"

# Ollama (for AI chat)
OLLAMA_URL="http://localhost:11434"
```

## 🚀 Running the Backend

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

## 📝 Error Handling

Centralized in `errorHandler.js`:
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
})
```

## 🎨 Architecture Patterns

### MVC (Model-View-Controller)
- **Models**: Prisma schema
- **Views**: JSON responses
- **Controllers**: Business logic in `controllers/`
- **Routes**: API endpoints in `routes/`
- **Services**: External API integration

### Authentication Flow
1. User signs up/logs in
2. Server returns JWT token
3. Client stores token
4. Subsequent requests include token in header
5. Middleware validates token
6. Request proceeds with `req.user` attached

### Goal Evaluation Flow
1. Fetch user's goals
2. Fetch ALL user transactions (not just goal-linked)
3. Calculate progress for each goal
4. Return goals with progress data

## 🔍 Key Features

### 1. Plaid Integration
- Bank connection via Link
- Transaction sync
- Error handling for sandbox issues

### 2. Goal Tracking
- Real-time progress calculation
- Visual progress bars
- Notifications for milestones

### 3. AI Assistant
- Context-aware responses
- Auto-goal adjustment
- Concise, actionable advice

### 4. Data Integrity
- All transactions linked to user
- Goals linked to user
- Cascade deletes where appropriate

