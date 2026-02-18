"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { UserProvider } from "@/context/user-context";
import { ProjectFilterProvider } from "@/context/project-filter-context";
import { SubscriptionProvider } from "@/context/subscription-context";
import { CurrencyProvider } from "@/context/currency-context";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { useAuth } from "@/context/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [modules, setModules] = useState<string[] | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/onboarding");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const loadModules = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      const profile = snap.data()?.profile || {};
      setModules(profile.selectedModules ?? []);
    };
    if (user) loadModules();
  }, [user]);

  useEffect(() => {
    if (!modules || !pathname) return;
    const routeModuleMap: Record<string, string> = {
      "/transactions": "transactions",
      "/planner": "projects",
      "/employees": "employees",
      "/shrimp": "fishfarm",
      "/partner": "partnerPortal",
    };
    const entry = Object.entries(routeModuleMap).find(([route]) => pathname.startsWith(route));
    if (entry) {
      const required = entry[1];
      if (!modules.includes(required)) {
        router.replace("/dashboard");
      }
    }
  }, [modules, pathname, router]);

  if (loading || !user || modules === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading your workspace...
      </div>
    );
  }

  return (
    <UserProvider>
      <SubscriptionProvider>
        <CurrencyProvider>
          <ProjectFilterProvider>
            <div className="flex min-h-screen flex-col bg-background">
              <Header />
              <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
              </main>
            </div>
            <UpgradeDialog />
          </ProjectFilterProvider>
        </CurrencyProvider>
      </SubscriptionProvider>
    </UserProvider>
  );
}
