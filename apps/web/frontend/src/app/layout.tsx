
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";
import { FirstLoginGuard } from "@/components/first-login-guard";
import { cn } from '@/lib/utils';
import { PwaAssets } from '@/components/pwa-assets';

export const metadata: Metadata = {
  title: 'Pranir-AquaTech',
  description: 'AI-driven smart transaction and farm management platform.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PwaAssets />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {process.env.NODE_ENV === 'production' ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js').then(registration => {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    }, err => {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                  });
                }
              `,
            }}
          />
        ) : (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Dev-only: aggressively clear any existing service workers and caches
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(regs => {
                    regs.forEach(reg => reg.unregister());
                  });
                }
                if (window.caches) {
                  caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
                }
              `,
            }}
          />
        )}
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background font-sans")}>
        <AuthProvider>
          <FirstLoginGuard />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
