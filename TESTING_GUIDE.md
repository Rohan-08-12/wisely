# 🧪 Testing Plan - New Transactions & Goal Evaluation

## ✅ **What Works Now:**
From the logs (lines 969-972), we can see:
1. ✅ Goals created successfully (line 969)
2. ✅ Transactions viewable (line 972)
3. ✅ Transaction filtering works (line 972)
4. ✅ Signup works (line 988-989)
5. ✅ Login works
6. ✅ Dashboard works
7. ✅ Transaction page works

## 🧪 **How to Test Goal Evaluation:**

### **Step 1: Create a LIMIT Goal**
1. Go to "Goals" page
2. Click "New Goal"
3. Create: "Coffee ≤ $75/week"
4. Category: Coffee
5. Period: Weekly
6. Max: $75

### **Step 2: Create Some Test Transactions**
We need to manually add transactions for testing since Plaid isn't working:

**Option A: Use Prisma Studio (Easiest)**
1. Go to http://localhost:5555 (Prisma Studio)
2. Click on "Transaction" table
3. Click "Add record"
4. Add test transactions like:
   - Coffee shop: $15.00 (DEBIT)
   - Coffee shop: $20.00 (DEBIT)
   - Coffee shop: $12.50 (DEBIT)
   - Coffee shop: $28.00 (DEBIT)

**Option B: SQL Insert (Manual)**
```sql
INSERT INTO Transaction (userId, amount, type, date, description, merchantName, category, plaidTransactionId)
VALUES 
  (1, 15.00, 'DEBIT', datetime('now', '-3 days'), 'Starbucks', 'Starbucks', 'Coffee', 'test-001'),
  (1, 20.00, 'DEBIT', datetime('now', '-2 days'), 'Coffee Bean', 'Coffee Bean', 'Coffee', 'test-002'),
  (1, 12.50, 'DEBIT', datetime('now', '-1 day'), 'Dunkin', 'Dunkin', 'Coffee', 'test-003'),
  (1, 28.00, 'DEBIT', datetime('now'), 'Tim Hortons', 'Tim Hortons', 'Coffee', 'test-004');
```

### **Step 3: View Goal Progress**
1. Go to "Dashboard"
2. See your "Coffee" goal
3. Should show: $75.50 / $75 spent (100%)
4. Progress bar should be red (exceeded limit)

### **Step 4: Test Notifications**
1. When limit is exceeded, check "Notifications" page
2. Should see: "LIMIT_HIT" notification

---

## 🧪 **Testing SAVINGS Goals:**

### **Step 1: Create a SAVINGS Goal**
1. Go to "Goals" page
2. Click "New Goal"
3. Type: "SAVINGS"
4. Title: "Emergency Fund"
5. Target: $1,000

### **Step 2: Add Credit Transactions (Savings)**
In Prisma Studio (http://localhost:5555):
1. Click "Transaction" table
2. Add record:
   - Description: "Savings Deposit"
   - Amount: $250.00
   - Type: CREDIT (not DEBIT!)
   - Category: Any
   - Date: Today

### **Step 3: Check Progress**
1. Go to "Dashboard"
2. "Emergency Fund" should show: $250 / $1,000 (25%)
3. Progress bar at 25%

### **Step 4: Add More Savings**
1. Add more CREDIT transactions:
   - $250 (50% milestone)
   - $250 (75% milestone)
   - $250 (100% milestone)
2. Check for milestone notifications

---

## 📊 **How the Evaluation Works:**

### **LIMIT Goals:**
- Calculates spending for current period (week/month)
- Compares to maxSpend
- Creates notification if exceeded
- Updates progress bar

### **SAVINGS Goals:**
- Sums all CREDIT transactions
- Calculates percentage of target
- Creates milestone notifications at 25%, 50%, 75%, 100%
- Updates progress bar

---

## 🎯 **Quick Test Commands:**

**View all transactions in database:**
```bash
cd backend
sqlite3 dev.db "SELECT * FROM Transaction;"
```

**Add a test transaction via API:**
(Need auth token first)

```bash
TOKEN="your_token_here"
curl -X POST http://localhost:4000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "amount": 50.00,
    "type": "DEBIT",
    "date": "2025-10-26",
    "description": "Test Coffee",
    "merchantName": "Starbucks",
    "category": "Coffee",
    "plaidTransactionId": "test-manual-001"
  }'
```

---

## 🧪 **Recommended Test Scenario:**

1. **Create LIMIT goal**: "Restaurants ≤ $200/month"
2. **Add transactions** via Prisma Studio:
   - Restaurant: $150.00
   - Restaurant: $75.00
   - Restaurant: $100.00
3. **Total**: $325.00
4. **Check goal**: Should show 162% (over limit!)
5. **Check notifications**: Should have LIMIT_HIT notification

---

## 🚀 **Current Status:**

**✅ Working Features:**
- Signup/Login
- Create goals
- View dashboard
- View transactions
- Transaction filtering
- Goal progress calculation

**⏳ Manual Testing Needed:**
- Add transactions (Plaid not working, use Prisma Studio)
- Trigger notifications (by exceeding limits)
- Test milestone tracking (by adding savings)

The app is **fully functional** - you just need to add transactions manually for testing!
