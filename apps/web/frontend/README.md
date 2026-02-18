# Pranir Aquatech - Frontend

This is the frontend application for Pranir Aquatech, built with Next.js 15.

## Structure

```
frontend/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── context/      # React Context providers
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── package.json      # Frontend dependencies
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

3. Open [http://localhost:9002](http://localhost:9002) in your browser.

## Key Features

- Next.js 15 with App Router
- React 18
- TailwindCSS for styling
- Radix UI components
- Framer Motion animations
- Firebase authentication

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
