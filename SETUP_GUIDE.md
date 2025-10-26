# Wisely MVP - Setup Guide

## 🚨 Remaining Setup Steps

### 1. Fix npm Permissions Issue

**Problem**: npm cache has permission issues preventing package installation.

**Solution (Choose ONE):**

#### Option A: Fix npm permissions (Recommended)
```bash
sudo chown -R 501:20 "/Users/rohannayyer/.npm"
```

#### Option B: Use yarn instead
```bash
# Install yarn via Homebrew
brew install yarn

# Then use yarn instead of npm for all commands
```

#### Option C: Use different npm cache location
```bash
npm config set cache ~/.npm-cache
```

---

### 2. Get Plaid Sandbox Credentials

**Required**: You need Plaid API credentials to connect bank accounts.

**Steps:**
1. Go to [https://dashboard.plaid.com/](https://dashboard.plaid.com/)
2. Sign up for a free account
3. Navigate to "Team Settings" → "Keys"
4. Copy your **Client ID** and **Sandbox Secret**
5. Update `backend/.env` file:

```bash
# Replace these values in backend/.env:
PLAID_CLIENT_ID=your_actual_client_id_here
PLAID_SECRET=your_actual_sandbox_secret_here
```

**Note**: The sandbox credentials are free and safe to use for development.

---

### 3. Install Dependencies

**Backend:**
```bash
cd backend
npm install
npm run db:generate
npm run db:push
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### 4. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
*Server will run on http://localhost:4000*

**Terminal 2 - Frontend App:**
```bash
cd frontend
npm run dev
```
*App will run on http://localhost:5173*

---

### 5. Test the Application

1. **Open browser**: Go to http://localhost:5173
2. **Sign up**: Create a new account
3. **Create goals**: Add some spending limits or savings goals
4. **Connect bank**: Use Plaid Sandbox to connect a test bank account
5. **View transactions**: See imported transactions and goal progress

---

## 🔧 Troubleshooting

### If npm install fails:
- Try Option A, B, or C above for npm permissions
- Or use `npm install --force` as last resort

### If database errors occur:
- Make sure you're using SQLite (already configured)
- Run `npm run db:push` to create the database

### If Plaid connection fails:
- Verify your credentials in `backend/.env`
- Make sure you're using sandbox credentials, not production

### If frontend won't start:
- Check that backend is running on port 4000
- Verify `frontend/.env` has correct API URL

---

## 📁 File Structure Check

Make sure you have these files:
```
wisely-mvp/
├── backend/
│   ├── .env                    ✅ Created
│   ├── package.json            ✅ Created
│   ├── prisma/schema.prisma    ✅ Created (SQLite)
│   └── src/                    ✅ All files created
├── frontend/
│   ├── .env                    ✅ Created
│   ├── package.json            ✅ Created
│   └── src/                    ✅ All files created
└── README.md                   ✅ Created
```

---

## 🎯 What You'll Have After Setup

- **Full-stack personal finance app**
- **User authentication** (signup/login)
- **Goal management** (spending limits & savings goals)
- **Bank integration** (Plaid Sandbox)
- **Transaction tracking** (automatic import)
- **Smart notifications** (goal alerts)
- **Responsive dashboard** (mobile-friendly)

---

## 🚀 Next Steps After Setup

1. **Test all features** in the app
2. **Create sample data** (goals, transactions)
3. **Customize styling** if desired
4. **Deploy to production** (fly.io, Render, etc.)

---

## 📞 Need Help?

If you encounter any issues:
1. Check the error messages in terminal
2. Verify all environment variables are set
3. Make sure both servers are running
4. Check browser console for frontend errors

**The app is fully built and ready - you just need to complete these setup steps!**
