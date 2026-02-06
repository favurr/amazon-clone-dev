# Paystack 3D Secure (3DS) Troubleshooting

## 🔴 Issue: 504 Gateway Timeout on 3DS Redirect

### What's Happening?
When you use certain test cards, Paystack returns `status: "open_url"` which triggers a redirect to a 3D Secure authentication page. However, you're seeing a **504 Gateway Timeout** when the redirect happens.

### Why Does This Happen?

1. **Paystack Test Environment** - The sandbox 3DS pages can be slow or unavailable
2. **Localhost Limitations** - Some 3DS flows don't work well with `localhost`
3. **Callback URL Issues** - Paystack's test 3DS might not redirect back to localhost properly
4. **Network/DNS Issues** - Connection to Paystack's 3DS servers timing out

---

## ✅ Solutions

### Solution 1: Use Non-3DS Test Cards (Recommended for Development)

Use test cards that **don't trigger 3DS**:

#### **Instant Success** (No authentication required)
```
Card: 4084 0840 8408 4081
CVV: 408
Expiry: Any future date (e.g., 12/32)
```

This card will complete payment immediately without PIN, OTP, or 3DS!

#### **PIN Only** (No 3DS)
```
Card: 5060 6666 6666 6666
CVV: 123
Expiry: Any future date
PIN: 1234
```

#### **OTP Only** (No 3DS)
```
Card: 5078 5078 5078 5078 12
CVV: 123
Expiry: Any future date
OTP: Any value in test mode
```

---

### Solution 2: Use ngrok for Testing 3DS on Localhost

3DS authentication often requires a public URL. Use ngrok to expose your localhost:

#### Step 1: Install ngrok
```bash
# Download from https://ngrok.com/download
# Or use package manager
npm install -g ngrok
```

#### Step 2: Start ngrok
```bash
# Start your Next.js app first
pnpm dev

# In another terminal, expose port 3000
ngrok http 3000
```

#### Step 3: Update Environment Variables
Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update `.env.local`:

```env
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

#### Step 4: Restart Your App
```bash
# Stop and restart
pnpm dev
```

Now 3DS redirects should work properly!

---

### Solution 3: Test in Paystack Dashboard Directly

Test the card in Paystack's dashboard to see if it's a card issue or integration issue:

1. Go to: https://dashboard.paystack.com
2. Navigate to **Payments** → **Test Payment**
3. Try the same card there
4. If it fails with 504, it's a Paystack sandbox issue

---

### Solution 4: Skip 3DS in Test Mode

You can configure your Paystack test account to skip 3DS:

1. Go to: https://dashboard.paystack.com/#/settings/preferences
2. Look for **3D Secure** settings
3. Disable 3DS for test transactions
4. Save and try again

**Note:** This only works in test mode, not production.

---

## 🔍 How to Debug

### Check Logs
Look for these in your console:

```bash
[Checkout] 3DS redirect required: {
  url: "https://...",
  orderId: "...",
  reference: "..."
}

[Checkout] Redirecting to 3DS: https://...
```

### Check Network Tab
1. Open browser DevTools → Network tab
2. Submit payment
3. Look for the redirect to Paystack's 3DS URL
4. Check the response - if it's 504, the issue is with Paystack's server

### Test the 3DS URL Directly
Copy the 3DS URL from logs and paste it in a new browser tab. If it loads there, the issue is with the redirect logic. If it doesn't load, it's a Paystack issue.

---

## 📋 Current Implementation

Your integration now includes:

✅ **Callback URL** - Paystack redirects back to `/payment/callback` after 3DS
✅ **SessionStorage** - Order ID and reference stored for callback
✅ **Status Verification** - Automatic payment verification after 3DS
✅ **Order Completion** - Auto-completes order on successful verification

### Flow:
```
1. User submits payment
   ↓
2. Paystack returns status: "open_url"
   ↓
3. Store order info in sessionStorage
   ↓
4. Redirect to Paystack 3DS page
   ↓
5. User completes authentication
   ↓
6. Paystack redirects to /payment/callback
   ↓
7. Callback page checks payment status
   ↓
8. Complete order and redirect to /orders
```

---

## 🚀 Production Considerations

### 1. Use Live Keys
3DS works better with live keys in production:
```env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

### 2. Use HTTPS
Always use HTTPS in production:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Test with Real Cards
Test with small amounts (NGN 50-100) using real cards

### 4. Monitor in Dashboard
Check https://dashboard.paystack.com/#/transactions for failed 3DS attempts

---

## 🆘 If 3DS Still Doesn't Work

### Contact Paystack Support
Email: support@paystack.com

Include:
- Your test secret key (first 10 characters)
- Transaction reference
- Error message/screenshot
- Card number used

### Use Alternative Flow
Consider using **Paystack Popup** (Paystack.js) instead of direct charge:
- Handles 3DS automatically
- Better user experience
- More reliable in test mode

---

## 📊 Recommended Testing Strategy

During development:
1. ✅ Use `4084084084084081` (instant success)
2. ✅ Use `5060666666666666` (PIN only)
3. ✅ Use `5078507850785078` (OTP only)
4. ❌ Skip 3DS cards until ngrok setup or production

For production testing:
1. ✅ Set up ngrok or deploy to staging
2. ✅ Test 3DS flow with real test cards
3. ✅ Monitor Paystack dashboard for issues

---

## ✅ Quick Fix Summary

**For now, to continue development without 3DS issues:**

Use this test card:
```
Card: 4084 0840 8408 4081
CVV: 408
Expiry: 12/32
```

This will give you instant payment success without any authentication!

When you deploy to production (with HTTPS), 3DS will work properly. 🎉
