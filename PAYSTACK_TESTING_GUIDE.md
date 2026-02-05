# Paystack Testing Guide 🧪

## Quick Start

### 1. Set Up Environment Variables

Add to your `.env.local`:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your test keys from: https://dashboard.paystack.com/#/settings/developers

### 2. Start Development Server

```bash
pnpm install
pnpm dev
```

---

## 🧪 Test Scenarios

### Scenario 1: Successful Payment (No Auth)
**Card**: `4084084084084081`
**CVV**: `123`
**Expiry**: Any future date (e.g., `12/25`)

**Expected Flow**:
1. Enter card details
2. Submit payment
3. ✅ Instant success
4. Redirect to `/orders`

---

### Scenario 2: PIN Required
**Card**: `5060666666666666`
**CVV**: `123`
**Expiry**: Any future date
**PIN**: `1234`

**Expected Flow**:
1. Enter card details
2. Submit payment
3. 📱 PIN modal appears
4. Enter `1234`
5. ✅ Payment succeeds
6. Redirect to `/orders`

---

### Scenario 3: OTP Required
**Card**: `408408` + any 10 digits (e.g., `4084084084084081`)
**CVV**: `123`
**Expiry**: Any future date

**Expected Flow**:
1. Enter card details
2. Submit payment
3. 📱 OTP modal appears
4. Enter any OTP (test mode accepts anything)
5. ✅ Payment succeeds
6. Redirect to `/orders`

---

### Scenario 4: 3D Secure (Redirect)
**Card**: Any Mastercard starting with `5399` (e.g., `5399835161746095`)
**CVV**: `123`
**Expiry**: Any future date

**Expected Flow**:
1. Enter card details
2. Submit payment
3. 🌐 Redirect to 3D Secure page
4. Complete authentication
5. Return to app
6. ✅ Payment verified
7. Redirect to `/orders`

---

### Scenario 5: PIN → OTP Chain
**Card**: `5060666666666666`
**CVV**: `123`
**Expiry**: Any future date
**PIN**: `1234`

**Expected Flow**:
1. Enter card details
2. Submit payment
3. 📱 PIN modal appears → Enter `1234`
4. 📱 OTP modal appears → Enter any OTP
5. ✅ Payment succeeds
6. Redirect to `/orders`

---

## 🔍 Debugging Tips

### Check Browser Console
```javascript
// Look for these logs:
- "Initialize charge error:"
- "Submit PIN error:"
- "Submit OTP error:"
- "Checkout response:"
```

### Check Network Tab
```
POST /api/checkout
POST /api/payments/initialize
POST /api/payments/submit-pin
POST /api/payments/submit-otp
POST /api/orders/{id}/complete
```

### Check Database
```sql
-- View orders
SELECT id, tx_ref, paystack_id, status, paymentStatus 
FROM "order" 
ORDER BY createdAt DESC;

-- View order items
SELECT o.id, o.status, oi.quantity, p.title 
FROM "order" o
JOIN order_item oi ON o.id = oi.orderId
JOIN product p ON oi.productId = p.id;
```

---

## 🐛 Common Issues

### Issue 1: "Missing required fields"
**Cause**: Form validation failed
**Fix**: Check all fields are filled in the checkout form

### Issue 2: "Payment initialization failed"
**Cause**: Invalid Paystack credentials
**Fix**: Verify `PAYSTACK_SECRET_KEY` in `.env.local`

### Issue 3: Modal doesn't appear
**Cause**: UI state not updating
**Fix**: Check browser console for errors

### Issue 4: "No reference available"
**Cause**: Transaction reference not stored
**Fix**: Check that initial charge response includes `reference`

### Issue 5: Order not completing
**Cause**: `/api/orders/[id]/complete` endpoint issue
**Fix**: Check server logs for errors

---

## 📊 Test Checklist

- [ ] Successful payment (card `4084084084084081`)
- [ ] PIN required (card `5060666666666666`)
- [ ] OTP required (card `4084084084084081`)
- [ ] 3D Secure redirect (card `5399835161746095`)
- [ ] PIN → OTP chain (card `5060666666666666`)
- [ ] Invalid card number rejected
- [ ] Expired card rejected
- [ ] Invalid CVV rejected
- [ ] Order appears in `/orders` page
- [ ] Cart cleared after payment
- [ ] Order status updated correctly
- [ ] Payment reference stored in database

---

## 🚀 Moving to Production

1. **Get Live API Keys**
   - Go to https://dashboard.paystack.com/#/settings/developers
   - Copy `Live Secret Key` and `Live Public Key`

2. **Update Environment Variables**
   ```env
   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Enable Webhook (Recommended)**
   - Create webhook endpoint: `/api/payments/webhook`
   - Add to Paystack dashboard: https://dashboard.paystack.com/#/settings/webhooks
   - Webhook URL: `https://yourdomain.com/api/payments/webhook`

4. **Test with Real Cards**
   - Use small amounts (NGN 50-100)
   - Test with different banks
   - Verify SMS/Email notifications

5. **Monitor Transactions**
   - Dashboard: https://dashboard.paystack.com/#/transactions
   - Check for failed payments
   - Review decline reasons

---

## 📞 Support Resources

- **Paystack Dashboard**: https://dashboard.paystack.com
- **API Documentation**: https://paystack.com/docs/api
- **Test Cards**: https://paystack.com/docs/payments/test-payments
- **Support Email**: support@paystack.com
- **Status Page**: https://status.paystack.com

---

**Happy Testing! 🎉**
