# Debugging Guide: Sign Up & Sign In Issues

## Common Issues and Solutions

### 1. "JWT_SECRET is not configured" Error

**Problem:** Backend server doesn't have JWT_SECRET environment variable.

**Solution:**
1. Go to your backend server directory
2. Create/edit `.env` file:
   ```env
   JWT_SECRET=your-secret-here
   PORT=5000
   ```
3. Restart backend server

**Quick Fix:** See `QUICK_FIX_JWT.md` for detailed instructions.

---

### 2. Network Error / Cannot Connect to Server

**Problem:** Frontend cannot reach backend API.

**Checklist:**
- ✅ Is backend server running? Check `http://localhost:5000/api/health`
- ✅ Is backend running on port 5000? (Or update `VITE_API_URL` in frontend `.env`)
- ✅ Is CORS enabled on backend?
- ✅ Check browser console for CORS errors

**Solution:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Or check in browser
# Open: http://localhost:5000/api/health
```

**Frontend Configuration:**
Create `.env` file in project root:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. "401 Unauthorized" Errors

**Problem:** Token is invalid or expired.

**What Happens:**
- Token is automatically cleared
- User is redirected to login page
- This is expected behavior

**Solution:**
- User needs to login again
- Check if token is being stored: `localStorage.getItem('ai-finance-token')`

---

### 4. "Email already exists" on Signup

**Problem:** User is trying to sign up with existing email.

**Solution:**
- User should use "Sign In" instead
- Or use a different email address

---

### 5. Form Validation Errors

**Login Form:**
- Email must contain `@` and `.`
- Password is required

**Signup Form:**
- Name, email, and password required
- Email must be valid format
- Password minimum 6 characters
- Passwords must match

---

## Debugging Steps

### Step 1: Check Browser Console

Open Developer Tools (F12) and check:
- **Console tab:** Look for errors
- **Network tab:** Check API requests/responses

### Step 2: Verify Backend is Running

```bash
# Test backend health endpoint
curl http://localhost:5000/api/health

# Or in browser
# Navigate to: http://localhost:5000/api/health
```

### Step 3: Check Environment Variables

**Frontend:**
- Open browser console
- Should see: `🔗 API Base URL: http://localhost:5000/api`

**Backend:**
- Check `.env` file exists
- Verify `JWT_SECRET` is set
- Verify `PORT` matches frontend expectations

### Step 4: Test API Endpoints Directly

**Test Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Test Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Step 5: Check localStorage

Open browser console and run:
```javascript
// Check if token exists
localStorage.getItem('ai-finance-token')

// Clear everything (if needed)
localStorage.clear()
```

---

## Development Tools

### Enable Debug Logging

The app automatically logs debug info in development mode. Check console for:
- `[AUTH]` - Authentication events
- `[API]` - API requests/responses

### Network Request Inspection

In browser DevTools Network tab:
1. Filter by "Fetch/XHR"
2. Look for requests to `/api/auth/*`
3. Check:
   - Request payload
   - Response status
   - Response body

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Network error" | Backend not running | Start backend server |
| "JWT_SECRET is not configured" | Missing env var | Add JWT_SECRET to backend `.env` |
| "Cannot connect to server" | Wrong URL/port | Check `VITE_API_URL` in frontend |
| "401 Unauthorized" | Invalid token | Login again |
| "Email already exists" | Duplicate signup | Use login instead |
| "Failed to load profile" | Token expired | Login again |

---

## Quick Test Checklist

- [ ] Backend server is running
- [ ] Backend `.env` has `JWT_SECRET`
- [ ] Frontend `.env` has `VITE_API_URL` (if needed)
- [ ] Backend is accessible at configured URL
- [ ] CORS is enabled on backend
- [ ] Browser console shows no errors
- [ ] Network requests are successful

---

## Still Having Issues?

1. **Check backend logs** - Look for error messages
2. **Check browser console** - Look for JavaScript errors
3. **Check network tab** - Verify API requests/responses
4. **Clear browser cache** - Try incognito/private window
5. **Restart both servers** - Frontend and backend

---

## Testing the Auth Flow

1. **Clear storage:**
   ```javascript
   localStorage.clear()
   ```

2. **Try signup:**
   - Go to `/signup`
   - Fill form
   - Submit
   - Should redirect to `/dashboard`

3. **Try logout:**
   - Click "Sign Out"
   - Should redirect to home

4. **Try login:**
   - Go to `/login`
   - Use same credentials
   - Should redirect to `/dashboard`

---

## Support Files

- `BACKEND_SETUP.md` - Backend configuration guide
- `QUICK_FIX_JWT.md` - JWT_SECRET setup guide
- `src/api/README.md` - API client documentation

