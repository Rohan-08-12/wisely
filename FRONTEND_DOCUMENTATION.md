# Frontend Documentation - Wisely MVP

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx           # Login form
│   │   ├── SignupPage.jsx          # Signup form
│   │   ├── DashboardPage.jsx       # Main dashboard
│   │   ├── GoalsPage.jsx           # Goals list/management
│   │   ├── TransactionsPage.jsx   # Transaction history
│   │   ├── PlaidConnectPage.jsx   # Plaid Link integration
│   │   └── ChatPage.jsx            # AI assistant
│   ├── components/
│   │   └── Layout.jsx              # App layout with sidebar
│   ├── stores/
│   │   └── authStore.js            # Zustand auth state
│   ├── services/
│   │   └── api.js                   # Axios instance
│   ├── App.jsx                      # Main app component
│   └── main.jsx                    # Entry point
└── index.html
```

## 🎨 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Zustand** - State management
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

## 🔐 Authentication

### Auth Store (`stores/authStore.js`)

```javascript
const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: async (email, password) => { ... },
  signup: async (email, password, name) => { ... },
  logout: () => { ... },
  checkAuth: async () => { ... }
}))
```

### Features
- Persists token in localStorage
- Auto-checks auth on mount
- Redirects based on auth status
- Token attached to API requests

## 🧭 Navigation & Routing

### Routes (`App.jsx`)

```javascript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
  <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
  <Route path="/goals" element={<Layout><GoalsPage /></Layout>} />
  <Route path="/transactions" element={<Layout><TransactionsPage /></Layout>} />
  <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
  <Route path="/connect" element={<Layout><PlaidConnectPage /></Layout>} />
</Routes>
```

### Protected Routes
- Requires authentication
- Redirects to `/login` if not authenticated

## 📊 Pages

### Dashboard Page

**Features:**
- Personalized greeting
- Goals overview grid (2 columns)
- Quick actions ("New Goal" button)
- Progress bars for each goal
- Goal cards with categories

**Components:**
- Goal cards with progress indicators
- SAVINGS and LIMIT badge variants
- Modal for creating new goals
- Orange/peach color scheme

**Key Code:**
```javascript
const { data: dashboard } = useQuery(['dashboard'], fetchDashboard)

const createGoalMutation = useMutation(createGoal, {
  onSuccess: () => {
    queryClient.invalidateQueries(['dashboard'])
    setIsCreatingGoal(false)
  }
})
```

### Goals Page

**Features:**
- Full list of goals
- Create/edit/delete goals
- Progress tracking
- Color-coded status indicators

**Goal Types:**
- **LIMIT**: Red when exceeded, orange when within limit
- **SAVINGS**: Orange progress bar, peach tags

### Transactions Page

**Features:**
- Transaction list
- CREDIT/DEBIT distinction
- Category tags
- Date formatting
- Amount styling (green for credit, red for debit)

### Chat Page

**Features:**
- AI conversation interface
- Persistent chat history (localStorage)
- Real-time message updates
- Clear chat button
- Auto-scroll to latest message

**API Integration:**
```javascript
const response = await api.post('/chat', {
  message: currentInput,
  conversation_history: messages.map(...)
})

// Handle goal updates
if (response.data.updatedGoals?.length > 0) {
  queryClient.invalidateQueries(['dashboard'])
  queryClient.invalidateQueries(['goals'])
}
```

**Storage:**
- Messages saved to localStorage
- Persists across page reloads
- Clear function resets to welcome message

## 🎨 UI Components

### Layout Component

**Features:**
- Responsive sidebar navigation
- Mobile hamburger menu
- User profile section
- Logo display
- Orange gradient sidebar

**Navigation:**
```javascript
const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'AI Assistant', href: '/chat', icon: MessageSquare },
  { name: 'Connect Bank', href: '/connect', icon: LinkIcon },
]
```

**Styling:**
- Sidebar: `bg-gradient-to-b from-orange-500 to-orange-600`
- Active link: `bg-white text-orange-600`
- Inactive link: `text-white hover:bg-orange-600`

## 🎨 Design System

### Colors

**Primary (Orange):**
- Sidebar: `from-orange-500 to-orange-600`
- Buttons: `bg-orange-500 hover:bg-orange-600`
- Links (active): `text-orange-600`

**Cards:**
- Background: `bg-orange-50`
- Hover: `hover:bg-orange-100`
- Border: `border-orange-100`

**Progress Bars:**
- LIMIT (in limit): `bg-orange-500`
- LIMIT (exceeded): `bg-red-500`
- SAVINGS: `bg-orange-500`

**Tags:**
- SAVINGS: `bg-orange-100 text-orange-800`
- LIMIT: Default gray

### Typography

- Dashboard heading: `text-6xl font-bold italic`
- Page titles: `text-3xl font-bold`
- Card titles: `text-lg font-semibold`
- Body text: `text-sm` or `text-base`

### Spacing

- Dashboard top padding: `pt-6`
- Card padding: `p-6`
- Grid gaps: `gap-6`
- Section margins: `mb-6` or `mb-12`

## 🔌 API Integration

### API Service (`services/api.js`)

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### TanStack Query Usage

```javascript
// Fetch data
const { data, isLoading } = useQuery(
  ['dashboard'],
  () => api.get('/dashboard').then(res => res.data)
)

// Mutate data
const mutation = useMutation(
  (goalData) => api.post('/goals', goalData),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['goals'])
    }
  }
)
```

## 🎯 State Management

### Zustand (Auth State)
- Global auth state
- Persisted to localStorage
- Used by all components

### TanStack Query (Server State)
- Caching
- Automatic refetching
- Optimistic updates
- Query invalidation

## 🔄 Data Flow

### Goal Creation Flow

1. User clicks "+ New Goal"
2. Modal opens with goal form
3. User fills form and submits
4. `createGoalMutation` called
5. API request to `POST /api/goals`
6. Backend creates goal
7. Frontend invalidates queries
8. Dashboard/goals list refresh
9. Modal closes

### AI Chat Goal Update Flow

1. User asks: "Review my goals and apply"
2. Message sent to `POST /api/chat`
3. Backend analyzes goals
4. Backend updates goals in DB
5. Returns confirmation message
6. Frontend shows success alert
7. Dashboard/goals queries invalidated
8. UI updates with new limits

### Transaction Sync Flow

1. User clicks "Connect Bank"
2. Plaid Link modal opens
3. User connects account
4. Public token exchanged
5. Webhook received (future)
6. Transactions synced
7. Goal progress recalculated
8. Dashboard updates

## 📱 Responsive Design

### Breakpoints (Tailwind)
- Mobile: `<640px`
- Tablet: `640px - 1024px`
- Desktop: `>1024px`

### Mobile Features
- Hamburger menu
- Stacked layout
- Touch-friendly buttons
- Sidebar overlay

### Desktop Features
- Fixed sidebar
- Grid layouts
- Hover effects
- Larger typography

## 🎭 Key Features

### 1. Goal Creation Modal
- Opens from dashboard "+ New Goal" card
- Form validation
- Category selection
- Type selection (LIMIT/SAVINGS)
- Submit creates and refreshes

### 2. Progress Tracking
- Real-time calculations
- Visual progress bars
- Color-coded status
- Percentage displays

### 3. Transaction Display
- List format
- Category badges
- Date formatting
- Amount coloring
- CREDIT (+) vs DEBIT (-)

### 4. AI Assistant
- Persistent chat history
- Context-aware responses
- Goal auto-updates
- Chart generation (future)
- Clear chat function

## 🚀 Development

### Running Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```bash
VITE_API_URL=http://localhost:5000
VITE_PLAID_ENV=sandbox
```

## 📦 Key Dependencies

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "zustand": "^4.x",
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x",
  "recharts": "^2.x"
}
```

## 🎨 Component Patterns

### Page Component Pattern
```javascript
const Page = () => {
  const { data, isLoading } = useQuery(['key'], fetchData)
  
  if (isLoading) return <Loading />
  
  return (
    <div className="space-y-6 pt-6">
      {/* Content */}
    </div>
  )
}
```

### Protected Route Pattern
```javascript
const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuthStore()
  
  if (!token || !user) {
    return <Navigate to="/login" />
  }
  
  return children
}
```

### Mutation Pattern
```javascript
const mutation = useMutation(
  (data) => api.post('/endpoint', data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries(['related-query'])
      toast.success('Success!')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  }
)
```

## 🔍 User Experience

### Loading States
- Skeletons for data loading
- Spinner for mutations
- Optimistic updates

### Error Handling
- Try/catch in API calls
- Error boundaries (future)
- User-friendly messages
- Retry mechanisms

### Success Indicators
- Toast notifications (future)
- Alert messages
- Visual feedback
- Auto-refresh data

