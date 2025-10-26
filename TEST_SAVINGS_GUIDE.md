# 🧪 Testing SAVINGS Goals

## **Step 1: Create a SAVINGS Goal**

1. Go to http://localhost:5173
2. Click "Goals" page
3. Click "New Goal"
4. Fill in:
   - **Title**: "Emergency Fund"
   - **Type**: "SAVINGS" (select from dropdown)
   - **Target Amount**: 1000.00
5. Click "Create"

---

## **Step 2: Add CREDIT Transactions (Savings)**

Since you're testing manually, add transactions via SQL:

**Open terminal:**
```bash
cd backend
sqlite3 prisma/dev.db
```

**Add savings transactions:**
```sql
-- Get your user ID first
SELECT id, email FROM User;

-- Add savings deposits (CREDIT transactions!)
INSERT INTO "Transaction" (userId, amount, type, date, description, merchantName, category, plaidTransactionId)
VALUES 
  (3, 250.00, 'CREDIT', datetime('now', '-3 days'), 'Savings Deposit 1', 'Bank', 'Savings', 'savings-001'),
  (3, 250.00, 'CREDIT', datetime('now', '-2 days'), 'Savings Deposit 2', 'Bank', 'Savings', 'savings-002'),
  (3, 250.00, 'CREDIT', datetime('now', '-1 day'), 'Savings Deposit 3', 'Bank', 'Savings', 'savings-003');

-- Exit SQLite
.quit
```

**Important:** `type = 'CREDIT'` (not DEBIT!) - CREDIT means money coming in (savings).

---

## **Step 3: Check Progress**

1. Refresh http://localhost:5173
2. Go to "Goals" page
3. Your Emergency Fund goal should show:
   - **Target**: $1,000
   - **Saved**: $750
   - **$250 to go**
   - **75% progress**
   - Green progress bar

---

## **Step 4: Add More to Hit 100%**

Add one more deposit:
```sql
sqlite3 prisma/dev.db
INSERT INTO "Transaction" (userId, amount, type, date, description, merchantName, category, plaidTransactionId)
VALUES (3, 250.00, 'CREDIT', datetime('now'), 'Final Deposit', 'Bank', 'Savings', 'savings-004');
.quit
```

Now you should see:
- **Saved**: $1,000
- **Goal reached! 100%**
- Full green progress bar 🎉

---

## **Visual Guide:**

**SAVINGS Goal Card Shows:**
```
🎯 Emergency Fund
Type: SAVINGS

Target: $1,000
Saved: $750

[=================>░░░░░] 75%

$250 to go
```

---

## **Quick SQL to Add Multiple Deposits:**
```sql
INSERT INTO "Transaction" (userId, amount, type, date, description, merchantName, category, plaidTransactionId)
VALUES 
  (3, 100.00, 'CREDIT', datetime('now', '-5 days'), 'Weekly Savings', 'Bank', 'Savings', 'savings-001'),
  (3, 150.00, 'CREDIT', datetime('now', '-4 days'), 'Weekly Savings', 'Bank', 'Savings', 'savings-002'),
  (3, 200.00, 'CREDIT', datetime('now', '-3 days'), 'Weekly Savings', 'Bank', 'Savings', 'savings-003');
```

**Replace `3` with your user ID!**
