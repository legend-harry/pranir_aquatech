# Pranir AquaTech - Integration Guide

## 🏗️ Architecture Overview

This project consists of multiple integrated components working together:

```
├── apps/
│   ├── web/                          # Main web application directory
│   │   ├── index.html                # Landing page (Marketing)
│   │   ├── about.html                # About page (Marketing)
│   │   ├── styles.css                # Shared styles for landing pages
│   │   ├── script.js                 # Shared animations/interactions
│   │   ├── Public/                   # Static assets (images, logos)
│   │   ├── src/                      # [LEGACY] Old Vite React app
│   │   └── frontend/                 # ✅ ACTIVE Next.js application
│   │       ├── src/
│   │       │   ├── app/              # Next.js App Router pages
│   │       │   │   ├── page.tsx      # Root → redirects to /onboarding
│   │       │   │   ├── onboarding/   # Sign up/Sign in flow
│   │       │   │   ├── intro/        # Onboarding wizard
│   │       │   │   └── (main)/       # Protected app routes
│   │       │   │       ├── dashboard/
│   │       │   │       ├── shrimp/
│   │       │   │       ├── transactions/
│   │       │   │       ├── employees/
│   │       │   │       ├── reports/
│   │       │   │       └── profile/
│   │       │   ├── components/       # Reusable React components
│   │       │   ├── context/          # Auth, User, Subscription contexts
│   │       │   ├── hooks/            # Custom React hooks
│   │       │   └── lib/              # Utilities & Firebase config
│   │       └── public/               # Frontend static assets
│   └── api/
│       └── backend/                  # Firebase backend configuration
└── services/
    └── ml-engine/                    # ML/AI services (future)
```

---

## 🔗 Navigation Flow

### User Journey

```
1. Landing Page (index.html or about.html)
   ↓ User clicks "Sign Up" / "Get Started" / "Access AI Platform"
   
2. Next.js App (http://localhost:9002)
   ↓ Root page auto-redirects to...
   
3. Onboarding Page (/onboarding)
   - Choose role: Customer or Partner
   - Sign up with email/password or Google
   - Sign in if existing user
   ↓ After successful authentication...
   
4. Introduction Flow (/intro)
   - Personality quiz & culture selection
   - Module selection (Transactions, Projects, Employees, FishFarm, Partner Portal)
   - Profile completion
   ↓ After onboarding completion...
   
5. Main Application Dashboard (/dashboard)
   - Protected routes with role-based access
   - Full aquaculture management features
```

---

## 🌐 Port Configuration

| Component | Port | URL | Status |
|-----------|------|-----|--------|
| **Landing Pages** | 8000 | `http://localhost:8000` | Static HTML/CSS/JS |
| **Legacy Vite App** | 5173 | `http://localhost:5173` | ⚠️ DEPRECATED - DO NOT USE |
| **Next.js Frontend** | 9002 | `http://localhost:9002` | ✅ **ACTIVE - Primary App** |
| **Firebase Backend** | Cloud | Firebase Project: `praniraqua` | ✅ Production |

---

## ✅ Integration Points - All Fixed

### 1. Landing Page → Frontend App

**File: index.html**
- ✅ Navigation Sign Up button → `http://localhost:9002`
- ✅ Hero "Get Started" button → `http://localhost:9002`
- ✅ Feature "Explore Technology" button → `http://localhost:9002`
- ✅ CTA "Sign Up / Login" button → `http://localhost:9002`

**File: about.html**
- ✅ Navigation Sign Up button → `http://localhost:9002`
- ✅ CTA "Access AI Platform" button → `http://localhost:9002`

### 2. Frontend App Authentication

**Firebase Configuration** (`frontend/src/lib/firebase.ts`)
- ✅ Firebase Auth enabled with email/password & Google provider
- ✅ Firestore database for user profiles
- ✅ Realtime Database for live data
- ✅ Firebase Storage for media
- ✅ Offline persistence enabled

**Auth Context** (`frontend/src/context/auth-context.tsx`)
- ✅ `signUpWithEmail()` - Creates user + Firestore document
- ✅ `signInWithEmail()` - Email/password authentication
- ✅ `signInWithGoogle()` - Google OAuth
- ✅ `signOutUser()` - Logout functionality
- ✅ Auto-detects user role (customer/partner)

### 3. Protected Routes

**Layout Guard** (`frontend/src/app/(main)/layout.tsx`)
- ✅ Redirects unauthenticated users to `/onboarding`
- ✅ Checks user module permissions
- ✅ Shows upgrade dialog for restricted features

**First Login Guard** (`frontend/src/components/first-login-guard.tsx`)
- ✅ Redirects new users to `/intro` for onboarding
- ✅ Checks `onboardingCompleted` status in Firestore

---

## 🚀 Running the Application

### Development Environment

1. **Start the Landing Pages** (For testing marketing pages)
   ```bash
   cd /Users/divyeshmedidi/Web/apps/web
   python3 -m http.server 8000
   ```
   Access at: `http://localhost:8000/index.html`

2. **Start the Next.js Frontend** (Main application)
   ```bash
   cd /Users/divyeshmedidi/Web/apps/web/frontend
   npm install
   npm run dev
   ```
   Access at: `http://localhost:9002`

3. **Full Stack (Both at once)**
   ```bash
   # Terminal 1: Landing pages
   cd /Users/divyeshmedidi/Web/apps/web
   python3 -m http.server 8000
   
   # Terminal 2: Next.js app
   cd /Users/divyeshmedidi/Web/apps/web/frontend
   npm run dev
   ```

### Testing the Integration

1. Open `http://localhost:8000/index.html`
2. Click "Sign Up" or "Get Started"
3. Should navigate to `http://localhost:9002/onboarding`
4. Complete sign-up/sign-in
5. Complete intro wizard at `/intro`
6. Land on dashboard at `/dashboard`

---

## 🔐 Firebase Configuration

**Project ID**: `praniraqua`

**Services Enabled**:
- ✅ Authentication (Email/Password, Google OAuth)
- ✅ Firestore Database (Primary DB)
- ✅ Realtime Database (Live updates)
- ✅ Storage (Media uploads)
- ✅ Hosting (Deployment ready)

**Firestore Collections**:
```
users/
  {uid}/
    - email
    - role: "customer" | "partner"
    - onboardingCompleted: boolean
    - profile: {...}
    - selectedModules: string[]
    - createdAt
    - updatedAt

transactions/
  {id}/
    - userId
    - type
    - amount
    - date
    ...

projects/
  {id}/
    - userId
    - name
    - status
    ...
```

---

## 📦 Dependencies

### Landing Pages
- Pure HTML5/CSS3
- Vanilla JavaScript (ES6+)
- Google Fonts (Inter)
- No build process required

### Next.js Frontend
- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 18
- **Styling**: TailwindCSS + Radix UI
- **State**: React Context API
- **Backend**: Firebase SDK
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

---

## 🐛 Common Issues & Solutions

### Issue: Links still pointing to port 5173
**Solution**: ✅ FIXED - All links now point to port 9002

### Issue: "Module not found" in Next.js
**Solution**: Run `npm install` in the `frontend/` directory

### Issue: Firebase auth not working
**Solution**: Ensure `.env.local` exists (copy from `.env.example`)

### Issue: Page redirects to /onboarding constantly
**Solution**: Check Firestore user document has `onboardingCompleted: true`

### Issue: Landing page CSS not loading
**Solution**: Ensure `styles.css` is in `/apps/web/` directory with correct path

---

## 📝 Development Guidelines

### Adding New Features

1. **Landing Pages** - Edit `index.html` or `about.html`
   - Keep all auth links pointing to `http://localhost:9002`
   - Use consistent styling from `styles.css`

2. **Frontend Routes** - Add to `frontend/src/app/`
   - Protected routes go in `(main)` group
   - Public routes go in root `app/` folder

3. **API Integration** - Use Firebase SDK
   - Import from `@/lib/firebase`
   - Use Auth context for user state
   - Use Firestore hooks for data fetching

### Code Style
- TypeScript strict mode enabled
- Use `"use client"` for client components
- Use server components by default
- Follow Next.js 15 App Router conventions

---

## 🔄 Migration Notes

### Why Two React Apps?

1. **Old Vite App** (`src/App.jsx`) - Legacy simple onboarding
   - Port 5173
   - ⚠️ Being phased out
   - Simple signup flow with basic components

2. **New Next.js App** (`frontend/`) - Full production app
   - Port 9002
   - ✅ ACTIVE development
   - Complete aquaculture management platform

**Migration Status**: 
- ✅ All external links updated to Next.js app
- ⚠️ Old Vite app kept for reference (can be removed)

---

## 📊 System Requirements

- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher
- **Browser**: Modern browser with ES6+ support
- **Firebase**: Active project with services enabled

---

## 🎯 Next Steps

1. ✅ Landing pages link to Next.js app
2. ✅ Authentication flow integrated
3. ✅ Protected routes working
4. ⏳ Deploy to production hosting
5. ⏳ Configure custom domain
6. ⏳ Set up CI/CD pipeline
7. ⏳ Add ML engine integration

---

## 📧 Support

For development questions or issues:
- Check Firebase Console for auth/database logs
- Review Next.js documentation for routing issues
- Test authentication flow in incognito mode

---

**Last Updated**: February 18, 2026  
**Integration Status**: ✅ Fully Linked & Tested
