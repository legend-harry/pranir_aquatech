"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export function FirstLoginGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      setChecked(true);
      return;
    }

    // If user is authenticated
    if (typeof window !== "undefined") {
      const checkOnboardingStatus = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // If onboarding is already completed, don't redirect to intro
            if (data.onboardingCompleted) {
              setChecked(true);
              return;
            }
          }

          // First login - redirect to intro if not already there
          if (pathname !== "/intro" && pathname !== "/onboarding") {
            router.replace("/intro");
            return;
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }

        setChecked(true);
      };

      checkOnboardingStatus();
    }
  }, [user, loading, pathname, router]);

  // This component doesn't render anything, it just handles redirects
  return null;
}
