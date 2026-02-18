"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { IntroFlow } from "./intro-flow";

export function IntroPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!loading && user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data()?.onboardingCompleted) {
            // User already completed onboarding
            router.replace("/dashboard");
            return;
          }
          setOnboardingCompleted(false);
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          // Default to showing intro flow if check fails
          setOnboardingCompleted(false);
        }
      } else if (!loading && !user) {
        // User not authenticated
        router.replace("/onboarding");
        return;
      }
      setIsLoading(false);
    };

    if (!loading) {
      checkOnboardingStatus();
    }
  }, [user, loading, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (onboardingCompleted) {
    // Should not reach here due to redirect above, but failsafe
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Redirecting...</div>
      </div>
    );
  }

  return <IntroFlow />;
}
