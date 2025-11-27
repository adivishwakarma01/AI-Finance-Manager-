# Backend API Setup Guide

## Environment Variables Required

Your backend API server needs the following environment variables configured. Create a `.env` file in your backend directory with these variables:

```env
# JWT Configuration - REQUIRED for authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration (if using a database)
DATABASE_URL=your-database-connection-string

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (optional)
CORS_ORIGIN=http://localhost:4321
```

## Generating a Secure JWT_SECRET

You can generate a secure JWT secret using one of these methods:

### Option 1: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Option 2: Using OpenSSL
```bash
openssl rand -hex 64
```

### Option 3: Online Generator
Visit https://generate-secret.vercel.app/64 to generate a 64-character secret.

## Quick Setup

1. Create a `.env` file in your backend directory
2. Add the following (using a generated secret):
   ```env
   JWT_SECRET=your-generated-secret-here
   PORT=5000
   ```
3. Restart your backend server

## Security Notes

- ⚠️ **Never commit your `.env` file to version control**
- ✅ Add `.env` to your `.gitignore` file
- ✅ Use different secrets for development and production
- ✅ Keep your JWT_SECRET long and random (at least 32 characters)

## Backend API Endpoints

Your backend should be running on `http://localhost:5000/api` (or whatever you configure in `VITE_API_URL`).

Required endpoints:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- And all other endpoints defined in `src/api/client.ts`

## Troubleshooting

### Error: "JWT_SECRET is not configured"
- Make sure you've created a `.env` file in your backend directory
- Ensure `JWT_SECRET` is set in the `.env` file
- Restart your backend server after adding the environment variable
- Verify your backend is loading the `.env` file (using `dotenv` package)

### Backend Server Not Running
- The frontend expects the backend at `http://localhost:5000/api` by default
- Update `VITE_API_URL` in your frontend `.env` file if your backend runs on a different port/URL
- Make sure CORS is enabled on your backend to allow requests from your frontend

