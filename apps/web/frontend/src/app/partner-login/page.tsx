"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { ShieldCheck, LogIn, Mail } from "lucide-react";

export default function PartnerLoginPage() {
  const { signInWithEmail } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      const snap = await getDoc(doc(db, "users", auth.currentUser!.uid));
      const role = snap.data()?.role;
      if (role !== "partner") {
        await signOut(auth);
        toast({ variant: "destructive", title: "Access denied", description: "This account is not a partner account." });
        setLoading(false);
        return;
      }
      toast({ title: "Welcome", description: "Signed in as partner." });
      router.replace("/partner");
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: "Login failed", description: err?.message || "Could not sign in." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-6 w-6" />
            <CardTitle className="text-2xl">Partner Login</CardTitle>
          </div>
          <CardDescription>Access the lab partner portal. Customers should use the main login.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Partner Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="partner@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign in as Partner</span>
                </span>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Need a partner account? <Link href="/partner-registration" className="text-primary underline">Request access</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
