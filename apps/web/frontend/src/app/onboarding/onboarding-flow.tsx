"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Chrome, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type OnboardingView = "role-select" | "customer" | "partner";

export function OnboardingFlow() {
  const router = useRouter();
  const { signUpWithEmail, signInWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<OnboardingView>("role-select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeError, setShakeError] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"customer" | "partner" | null>(null);
  const [isSignUp, setIsSignUp] = useState(true);

  const handleRoleSelect = (role: "customer" | "partner") => {
    setSelectedRole(role);
    if (role === "customer") {
      setView("customer");
    } else {
      setView("partner");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShakeError(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (isSignUp) {
        if (selectedRole === null) throw new Error("Role not selected");
        await signUpWithEmail(email, password, selectedRole);
      } else {
        await signInWithEmail(email, password);
      }
      router.push("/intro");
    } catch (err: any) {
      // Trigger shake animation
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      
      // Parse Firebase errors and show user-friendly messages
      let errorMessage = "Authentication failed";
      const errorCode = err.code || "";
      
      if (errorCode.includes("email-already-in-use")) {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (errorCode.includes("invalid-email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (errorCode.includes("weak-password")) {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (errorCode.includes("user-not-found")) {
        errorMessage = "No account found with this email. Please sign up first.";
      } else if (errorCode.includes("wrong-password")) {
        errorMessage = "Incorrect password. Please try again.";
      } else if (errorCode.includes("too-many-requests")) {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      setError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setShakeError(false);

    try {
      if (selectedRole === null) throw new Error("Role not selected");
      await signInWithGoogle(selectedRole);
      router.push("/intro");
    } catch (err: any) {
      // Trigger shake animation
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      
      const errorMessage = err.message || "Google authentication failed";
      setError(errorMessage);
      toast({
        title: "Google Sign-In Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (view === "role-select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Pranir-AquaTech</h1>
            <p className="text-slate-700">AI-Driven Smart Transaction & Farm Management</p>
          </div>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-slate-900">Welcome to Pranir-AquaTech</CardTitle>
              <CardDescription className="text-slate-700">
                Select your role to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => handleRoleSelect("customer")}
                className="w-full p-6 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left space-y-2"
              >
                <h3 className="font-semibold text-slate-900">👤 Customer</h3>
                <p className="text-sm text-slate-700">
                  Track transactions, get AI insights, and manage your business
                </p>
              </button>

              <button
                onClick={() => handleRoleSelect("partner")}
                className="w-full p-6 border-2 border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition text-left space-y-2"
              >
                <h3 className="font-semibold text-slate-900">🤝 Partner</h3>
                <p className="text-sm text-slate-700">
                  Share expertise, build community, and collaborate
                </p>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Pranir-AquaTech</h1>
          <p className="text-slate-700">
            {view === "customer" ? "Customer Onboarding" : "Partner Onboarding"}
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setView("role-select")}
        >
          ← Back to Role Selection
        </Button>

        {view === "customer" && (
          <Card className={`border-slate-200 shadow-lg transition-transform ${
            shakeError ? 'animate-shake' : ''
          }`}>
            <CardHeader>
              <CardTitle className="text-slate-900">Get Started as a Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={isSignUp ? "signup" : "login"} onValueChange={(v) => setIsSignUp(v === "signup")}>
                <TabsList className="grid w-full grid-cols-2 bg-slate-200">
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Sign Up</TabsTrigger>
                  <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Sign In</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="space-y-4">
                  {/* Social & Phone Sign Up */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Sign Up with Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={true}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Sign Up with Phone (Coming Soon)
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="login" className="space-y-4">
                  {/* Social & Phone Sign In */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Sign In with Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={true}
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Sign In with Phone (Coming Soon)
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="text-xs text-center text-slate-500">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </div>
            </CardContent>
          </Card>
        )}

        {view === "partner" && (
          <Card className={`border-emerald-200 shadow-lg transition-transform ${
            shakeError ? 'animate-shake' : ''
          }`}>
            <CardHeader>
              <CardTitle className="text-slate-900">Partner Onboarding</CardTitle>
              <CardDescription>Access the partner portal with a partner account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={isSignUp ? "signup" : "login"} onValueChange={(v) => setIsSignUp(v === "signup")}>
                <TabsList className="grid w-full grid-cols-2 bg-emerald-100">
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Sign Up</TabsTrigger>
                  <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Sign In</TabsTrigger>
                </TabsList>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Sign Up with Google
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="partner-email" className="text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <Input
                        id="partner-email"
                        name="email"
                        type="email"
                        placeholder="partner@lab.com"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="partner-password" className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <Input
                        id="partner-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Partner Account
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="partner-email-login" className="text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <Input
                        id="partner-email-login"
                        name="email"
                        type="email"
                        placeholder="partner@lab.com"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="partner-password-login" className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <Input
                        id="partner-password-login"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Sign In as Partner
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              <div className="text-xs text-center text-slate-500">
                Partner access gives you lab portal and reporting tools.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
