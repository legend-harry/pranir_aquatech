# Pranir Aquatech - Backend

This is the backend API and AI services for Pranir Aquatech.

## Structure

```
backend/
├── src/
│   ├── api/          # API routes
│   ├── ai/           # AI flows and models
│   ├── modules/      # Business logic modules
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript type definitions
├── scripts/          # Database seeding and utilities
├── docs/             # Documentation
└── package.json      # Backend dependencies
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. For AI development:
```bash
npm run genkit:dev
```

## Key Features

- Firebase Cloud Functions (API routes)
- Genkit AI flows
- Google AI integration
- Firebase Admin SDK
- TypeScript

## Scripts

- `npm run dev` - Start development server
- `npm run genkit:dev` - Start Genkit AI development
- `npm run genkit:watch` - Start Genkit with watch mode
- `npm run build` - Build for production
- `npm run seed` - Run database seeding
- `npm run typecheck` - Run TypeScript type checking

## Firebase Configuration

The following Firebase configuration files are included:
- `firebase.json` - Firebase hosting and functions config
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore indexes
- `database.rules.json` - Realtime Database rules

## Environment Variables

Create a `.env` file with:

```
FIREBASE_PROJECT_ID=
GOOGLE_AI_API_KEY=
```
