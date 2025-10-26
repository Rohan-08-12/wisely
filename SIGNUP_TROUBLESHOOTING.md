# 🐛 Signup Not Working - Troubleshooting

## **Current Issue:**
Signup attempts return 400 (Bad Request) errors

## **Possible Causes:**

### **1. Email Already Exists**
- Email is already registered
- Try different email

### **2. Validation Error**
- Password too short (need at least 6 characters)
- Invalid email format
- Missing required fields

### **3. Browser Console Has Details**
- Open browser DevTools (F12)
- Check Console tab for error messages
- Look for specific validation errors

## ✅ **Quick Fix:**

**Try these:**
- Email: `test123@example.com`
- Password: `password123`
- Name: `Test User`

OR

Just click "Sign in" if you already have an account!

## 📍 **Where to Check:**

1. **Browser Console** - F12 → Console tab
2. **Backend Terminal** - Will show the validation error
3. **Network Tab** - F12 → Network → Look at the failed request

The app IS working (you successfully logged in, created goals, etc.) - you just need to use existing credentials or a new email!
