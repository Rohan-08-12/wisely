# 🧪 Quick Test Steps

## **Easy Way to Test Transactions & Goals:**

### **1. Create a Goal**
- Go to http://localhost:5173
- Click "Goals" → "New Goal"
- Create: "Coffee ≤ $50/week"
- Category: Coffee

### **2. Add Transactions via Prisma Studio**
- Open http://localhost:5555
- Click "Transaction" table
- Click "Add record"

**Add these test transactions:**
1. Description: "Starbucks"
   - Amount: 15.00
   - Type: DEBIT
   - Category: Coffee
   - Date: Oct 20, 2025

2. Description: "Coffee Shop"  
   - Amount: 20.00
   - Type: DEBIT
   - Category: Coffee
   - Date: Oct 21, 2025

3. Description: "Tim Hortons"
   - Amount: 18.50
   - Type: DEBIT
   - Category: Coffee
   - Date: Oct 22, 2025

### **3. Check Dashboard**
- Go back to http://localhost:5173
- Click "Dashboard"
- Your Coffee goal should show: $53.50 / $50 (107%)
- Progress bar should be red (exceeded!)

### **4. Check Notifications**
- Should have a "LIMIT_HIT" notification
- Goal exceeded by $3.50

---

## **Or Use SQL (Faster):**

```bash
cd /Users/rohannayyer/Desktop/untitled\ folder/backend
sqlite3 dev.db
```

Then paste:
```sql
-- Get your user ID first
SELECT id, email FROM User;

-- Replace USER_ID with your actual user ID
-- Add test transactions
INSERT INTO Transaction (userId, amount, type, date, description, merchantName, category, plaidTransactionId)
VALUES 
  (1, 15.00, 'DEBIT', datetime('now', '-3 days'), 'Starbucks', 'Starbucks', 'Coffee', 'test-001'),
  (1, 20.00, 'DEBIT', datetime('now', '-2 days'), 'Coffee Bean', 'Coffee Bean', 'Coffee', 'test-002'),
  (1, 18.50, 'DEBIT', datetime('now', '-1 day'), 'Tim Hortons', 'Tim Hortons', 'Coffee', 'test-003');
```

Then refresh the dashboard - your goal progress should update!
