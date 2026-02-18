# Quick Start Guide - Pranir AquaTech

## ⚡ Start Development in 3 Steps

### 1. Install Dependencies
```bash
cd /Users/divyeshmedidi/Web/apps/web/frontend
npm install
```

### 2. Start the Next.js App
```bash
cd /Users/divyeshmedidi/Web/apps/web/frontend
npm run dev
```
✅ App will start on `http://localhost:9002`

### 3. (Optional) Start Landing Pages
```bash
cd /Users/divyeshmedidi/Web/apps/web
python3 -m http.server 8000
```
✅ Landing pages on `http://localhost:8000`

---

## 🔗 All Links Are Now Connected

### Landing Pages → Next.js App
- `index.html` Sign Up → `http://localhost:9002` ✅
- `index.html` Get Started → `http://localhost:9002` ✅
- `index.html` Explore Technology → `http://localhost:9002` ✅
- `index.html` Sign Up / Login → `http://localhost:9002` ✅
- `about.html` Sign Up → `http://localhost:9002` ✅
- `about.html` Access AI Platform → `http://localhost:9002` ✅

### User Flow
```
Landing Page → Next.js App → Onboarding → Intro → Dashboard
```

---

## 🧪 Testing the Integration

1. Open landing page: `http://localhost:8000/index.html`
2. Click any "Sign Up" or "Get Started" button
3. You'll be taken to: `http://localhost:9002/onboarding`
4. Sign up with email/password or Google
5. Complete the intro wizard
6. Access the dashboard

---

## 📱 Key URLs

| Page | URL | Description |
|------|-----|-------------|
| Landing | `http://localhost:8000/index.html` | Marketing homepage |
| About | `http://localhost:8000/about.html` | About page |
| Sign Up/Login | `http://localhost:9002/onboarding` | Authentication |
| Intro | `http://localhost:9002/intro` | New user onboarding |
| Dashboard | `http://localhost:9002/dashboard` | Main app |

---

## 🔥 Firebase Backend (Already Connected)

**Project**: `praniraqua`
- ✅ Authentication enabled
- ✅ Firestore database active
- ✅ Realtime database active
- ✅ Storage configured

No additional setup needed - everything is pre-configured!

---

## ⚠️ Important Notes

1. **Port 5173** - The old Vite app is deprecated. Don't use it.
2. **Port 9002** - This is the ACTIVE Next.js app. All links point here now.
3. **Firebase** - All authentication and data flows through Firebase.

---

## 🐛 Troubleshooting

**Problem: Links not working**
- ✅ Already fixed! All links point to `http://localhost:9002`

**Problem: Next.js app won't start**
```bash
cd /Users/divyeshmedidi/Web/apps/web/frontend
rm -rf node_modules .next
npm install
npm run dev
```

**Problem: Firebase connection issues**
- Check `.env.local` exists in `frontend/` directory
- Firebase config is already in `frontend/src/lib/firebase.ts`

---

## 📚 More Information

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for complete architecture documentation.

---

**Status**: ✅ Everything is properly linked and ready to use!
