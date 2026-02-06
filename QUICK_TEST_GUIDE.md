# Quick Test Guide - Paystack Integration

## 🚀 Ready to Test!

All bugs are fixed. Use these cards for testing:

---

## ✅ Recommended Test Cards (No 3DS Issues)

### 1. **Instant Success** (Fastest)
```
Card Number: 4084 0840 8408 4081
CVV: 408
Expiry: 12/32
```
✅ Completes immediately without any authentication

---

### 2. **PIN Required** (Now Fixed!)
```
Card Number: 5060 6666 6666 6666
CVV: 123
Expiry: 12/32
PIN: 1234
```
✅ Shows PIN modal → Enter `1234` → Success

---

### 3. **OTP Required**
```
Card Number: 5078 5078 5078 5078 12
CVV: 123
Expiry: 12/32
OTP: Any value (e.g., 123456)
```
✅ Shows OTP modal → Enter any code → Success

---

## ❌ Skip These (3DS Cards - Timeout on Localhost)

```
5399 8351 6174 6095  ← Will timeout
Any Mastercard 5399  ← Will timeout
```

**Note:** These work in production, but timeout on localhost.

---

## 🧪 Test Checklist

- [ ] Test instant success card
- [ ] Test PIN flow (should work now!)
- [ ] Test OTP flow
- [ ] Verify order appears in `/orders`
- [ ] Check customer name and phone saved
- [ ] Confirm cart is cleared after payment

---

## 🔍 What Fixed

✅ **PIN submission** - No more "Duplicate Transaction Reference"
✅ **Customer data** - Name and phone now saved
✅ **3DS callback** - Page created (works in production)

---

## 📞 If Something Breaks

Check console for:
```bash
[Checkout] Payment details: ...
[Initialize] Received payment request: ...
[Paystack] POST ...
[Paystack Success] or [Paystack Error]
```

Share the logs with me!

---

**Start Testing:** Use card `5060666666666666` with PIN `1234` 🎉
