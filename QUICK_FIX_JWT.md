# Quick Fix: JWT_SECRET Configuration

## The Problem
Your backend API server is throwing an error: **"JWT_SECRET is not configured"**

## The Solution

### Step 1: Locate Your Backend Server
Your backend API should be running on `http://localhost:5000/api` (or wherever you configured it).

### Step 2: Create/Update `.env` File in Backend Directory
In your **backend project directory**, create or edit a `.env` file and add:

```env
JWT_SECRET=5542a5c03a2d71d712a339fe321e882b334f31cabd44759663f2136d9a2d58629febce53db7c1a5c8304c7eeae86dc40a22a59ebe40d8f27078a5b8bf49b0ff6
PORT=5000
NODE_ENV=development
```

### Step 3: Restart Your Backend Server
After adding JWT_SECRET to your `.env` file, restart your backend server.

## Alternative: Generate Your Own Secret

If you want to generate a new secret (recommended for production), run:

**On Windows (PowerShell):**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Or create a simple script:**
```javascript
// generate-secret.js
const crypto = require('crypto');
console.log(crypto.randomBytes(64).toString('hex'));
```

Then run: `node generate-secret.js`

## Backend Server Requirements

Your backend server should:
1. Use `dotenv` package to load `.env` file:
   ```javascript
   require('dotenv').config();
   ```
2. Check for JWT_SECRET on startup:
   ```javascript
   if (!process.env.JWT_SECRET) {
     throw new Error('JWT_SECRET is not configured');
   }
   ```
3. Use it in JWT operations:
   ```javascript
   const jwt = require('jsonwebtoken');
   const token = jwt.sign(payload, process.env.JWT_SECRET);
   ```

## Common Issues

### Issue: Backend still shows error after adding JWT_SECRET
- Make sure `.env` file is in the **root of your backend directory** (same level as your backend's `package.json`)
- Restart your backend server completely
- Verify the backend is actually reading the `.env` file (check console logs)

### Issue: Can't find backend directory
- The backend might be in a separate repository
- Check where your backend API code lives
- The frontend connects to `http://localhost:5000/api` - your backend should be running there

### Issue: Frontend can't connect to backend
- Make sure backend is running on port 5000 (or update `VITE_API_URL` in frontend `.env`)
- Check CORS is enabled on backend
- Verify the API base URL matches your backend server address

## Example Backend `.env` File Structure

```
backend/
├── .env              ← Add JWT_SECRET here
├── .env.example      ← Template file (optional)
├── package.json
├── server.js         ← Your backend server code
└── ...
```

Your `.env` file should contain:
```env
JWT_SECRET=your-secret-here
PORT=5000
DATABASE_URL=your-db-url-if-needed
NODE_ENV=development
```

---

**⚠️ Important:** Never commit your `.env` file to git! Make sure it's in your `.gitignore`.

