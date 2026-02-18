# Environment Variables Configuration

## 📁 Location Guide

### Frontend Environment (Next.js)
**File**: `/apps/web/frontend/.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.region.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_API_URL=http://localhost:5001
```

✅ **Status**: Created and ready to use

---

### Backend Environment (Firebase Functions)
**File**: `/apps/api/backend/.env`

```env
FIREBASE_PROJECT_ID=praniraqua
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
PORT=5001
NODE_ENV=development
```

⚠️ **Action Required**: Add your Google AI API key for Genkit/Gemini features

---

## 🔑 Getting API Keys

### Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into `/apps/api/backend/.env`

### Firebase Configuration
✅ Already configured for project: `praniraqua`

---

## 🚀 Usage

### Starting the Frontend
```bash
cd /Users/divyeshmedidi/Web/apps/web/frontend
npm run dev
# Runs on http://localhost:9002
```

### Starting the Backend
```bash
cd /Users/divyeshmedidi/Web/apps/api/backend
npm run dev
# Runs on http://localhost:5001
```

---

## 🔒 Security Notes

### Safe to Commit
- ✅ `NEXT_PUBLIC_*` variables (frontend config)
- ✅ Firebase public API keys (designed to be public)
- ✅ Development URLs

### NEVER Commit
- ❌ `GOOGLE_AI_API_KEY` (backend only)
- ❌ Service account JSON files
- ❌ Production secrets
- ❌ Private API keys

### .gitignore Protection
Your `.gitignore` already includes:
```
.env
.env.local
.env*.local
```

---

## 🧪 Testing Configuration

### Verify Frontend Environment
```bash
cd /Users/divyeshmedidi/Web/apps/web/frontend
npm run dev
```

Check console for Firebase initialization:
```
✓ Firestore offline persistence enabled
✓ Auth persistence enabled
```

### Verify Backend Environment
```bash
cd /Users/divyeshmedidi/Web/apps/api/backend
npm run dev
```

---

## 📋 Environment Variables Reference

### Frontend Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ Yes |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Google Analytics | ❌ Optional |

### Backend Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | ✅ Yes |
| `GOOGLE_AI_API_KEY` | Google AI/Gemini API | ✅ Yes (for AI features) |
| `PORT` | Backend server port | ❌ Optional (default: 5001) |
| `NODE_ENV` | Environment mode | ❌ Optional |

---

## 🔄 Updating Configuration

### To Update Frontend Config
1. Edit `/apps/web/frontend/.env.local`
2. Restart Next.js dev server: `npm run dev`

### To Update Backend Config
1. Edit `/apps/api/backend/.env`
2. Restart backend server: `npm run dev`

---

## 🌍 Environment-Specific Files

```
Development:  .env.local or .env.development
Production:   .env.production.local
Test:         .env.test.local
```

Next.js loads them in this order (later files override earlier ones):
1. `.env` (all environments)
2. `.env.local` (all environments, gitignored)
3. `.env.[mode]` (e.g., `.env.production`)
4. `.env.[mode].local` (gitignored)

---

## ✅ Quick Checklist

- [x] Frontend `.env.local` created with Firebase config
- [x] Backend `.env` created (needs Google AI key)
- [x] `.gitignore` configured to protect secrets
- [ ] Add Google AI API key to backend `.env`
- [ ] Test frontend: `cd apps/web/frontend && npm run dev`
- [ ] Test backend: `cd apps/api/backend && npm run dev`

---

**Last Updated**: February 18, 2026  
**Configuration Status**: ✅ Ready (add Google AI key for full functionality)
