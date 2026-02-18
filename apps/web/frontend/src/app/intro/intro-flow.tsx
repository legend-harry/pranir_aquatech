"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Check } from "lucide-react";

type IntroStep = "name" | "contact" | "helpGoal" | "source" | "modules" | "complete";

export function IntroFlow() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<IntroStep>("name");
  const [isAnimating, setIsAnimating] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    mobileNumber: "",
    helpGoal: "",
    sourceOfLearning: "",
    selectedModules: [] as string[],
    labPartnerEmail: "",
  });

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/onboarding");
    }
  }, [loading, user, router]);

  // Trigger animation on mount and step change
  useEffect(() => {
    setIsAnimating(true);
  }, [currentStep]);

  // Show loading state - move after all hooks
  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case "name":
        return formData.fullName.trim().length >= 2;
      case "contact":
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
        const phoneValid = /^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ""));
        return emailValid && phoneValid;
      case "helpGoal":
        return formData.helpGoal.length > 0;
      case "source":
        return formData.sourceOfLearning.length > 0;
      case "modules":
        return formData.selectedModules.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const steps: IntroStep[] = ["name", "contact", "helpGoal", "source", "modules", "complete"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleComplete = async () => {
    // Save intro data to Firestore
    try {
      if (!user) return;

      await setDoc(
        doc(db, "users", user.uid),
        {
          profile: {
            fullName: formData.fullName,
            email: formData.email,
            mobileNumber: formData.mobileNumber,
            helpGoal: formData.helpGoal,
            sourceOfLearning: formData.sourceOfLearning,
            selectedModules: formData.selectedModules,
            labPartnerEmail: formData.labPartnerEmail || null,
          },
          onboardingCompleted: true,
          onboardingCompletedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      // Still go to dashboard even if save fails
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const renderContent = () => {
    switch (currentStep) {
      case "name":
        return (
          <div
            className={`space-y-4 transition-all duration-500 ${
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            onAnimationEnd={() => setIsAnimating(false)}
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">What's your name?</label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="border-pastel-300 focus:border-pastel-500 focus:ring-pastel-500"
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-600">
              We'd love to know who we're working with!
            </p>
          </div>
        );

      case "contact":
        return (
          <div
            className={`space-y-4 transition-all duration-500 ${
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            onAnimationEnd={() => setIsAnimating(false)}
          >

      case "modules":
        return (
          <div
            className={`space-y-4 transition-all duration-500 ${
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            onAnimationEnd={() => setIsAnimating(false)}
          >
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-800">Select the modules you need</label>
              <p className="text-xs text-slate-600">Only selected modules will be shown throughout the app.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["projects","transactions","employees","fishfarm","labReports"].map((mod) => {
                  const labelMap: Record<string,string> = {
                    projects: "Projects",
                    transactions: "Transactions",
                    employees: "Employees",
                    fishfarm: "Fish Farm",
                    labReports: "Lab Reports",
                  };
                  const checked = formData.selectedModules.includes(mod);
                  return (
                    <label key={mod} className="flex items-center gap-2 p-2 rounded-md border bg-card">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            selectedModules: isChecked
                              ? [...prev.selectedModules, mod]
                              : prev.selectedModules.filter(m => m !== mod),
                          }));
                        }}
                      />
                      <span className="text-sm text-slate-800">{labelMap[mod]}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">
                Lab partner email (optional)
              </label>
              <Input
                type="email"
                name="labPartnerEmail"
                value={formData.labPartnerEmail}
                onChange={handleInputChange}
                placeholder="partner@example.com"
                className="border-pastel-300 focus:border-pastel-500 focus:ring-pastel-500"
              />
              <p className="text-xs text-slate-600">We'll notify you when lab reports are ready.</p>
            </div>
          </div>
        );
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Email Address</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="border-pastel-300 focus:border-pastel-500 focus:ring-pastel-500"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Mobile Number</label>
              <Input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  handleInputChange({
                    ...e,
                    target: { ...e.target, name: "mobileNumber", value },
                  } as any);
                }}
                placeholder="10-digit mobile number"
                className="border-pastel-300 focus:border-pastel-500 focus:ring-pastel-500"
              />
            </div>
            <p className="text-xs text-slate-600">
              We'll use these to keep you updated with important information.
            </p>
          </div>
        );

      case "helpGoal":
        return (
          <div
            className={`space-y-4 transition-all duration-500 ${
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            onAnimationEnd={() => setIsAnimating(false)}
          >
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-800">
                How can Pranir-AquaTech help you?
              </label>
              <div className="space-y-2">
                {[
                  { value: "transaction-tracking", label: "💰 Track transactions & expenses" },
                  {
                    value: "financial-insights",
                    label: "📊 Get AI-powered financial insights",
                  },
                  { value: "farm-management", label: "🐟 Manage farm operations" },
                  { value: "time-tracking", label: "⏱️ Track employee time & attendance" },
                  { value: "business-planning", label: "📋 Plan & forecast business growth" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg border-2 border-pastel-200 cursor-pointer hover:border-pastel-400 hover:bg-pastel-50 transition">
                    <input
                      type="radio"
                      name="helpGoal"
                      value={option.value}
                      checked={formData.helpGoal === option.value}
                      onChange={(e) => handleSelectChange("helpGoal", e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-800">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case "source":
        return (
          <div
            className={`space-y-4 transition-all duration-500 ${
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            onAnimationEnd={() => setIsAnimating(false)}
          >
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-800">
                Where did you hear about us?
              </label>
              <Select value={formData.sourceOfLearning} onValueChange={(value) => handleSelectChange("sourceOfLearning", value)}>
                <SelectTrigger className="border-pastel-300 focus:border-pastel-500 focus:ring-pastel-500">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="search">Search Engine</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="friend-referral">Friend or Referral</SelectItem>
                  <SelectItem value="news-article">News Article</SelectItem>
                  <SelectItem value="app-store">App Store</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-slate-600">
              This helps us understand how to reach more users like you.
            </p>
          </div>
        );

      case "complete":
        return (
          <div
            className={`text-center space-y-4 py-8 transition-all duration-500 ${
              isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onAnimationEnd={() => setIsAnimating(false)}
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pastel-300 to-pastel-400 rounded-full blur-lg opacity-50 animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-pastel-300 to-pastel-400 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-white animate-bounce" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pastel-500 to-pastel-600 bg-clip-text text-transparent">
                Welcome, {formData.fullName.split(" ")[0]}!
              </h3>
              <p className="text-slate-600">
                Your account is all set. Let's start managing your business!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getProgressPercentage = () => {
    const steps: IntroStep[] = ["name", "contact", "helpGoal", "source"];
    const index = steps.indexOf(currentStep);
    return ((index + 1) / (steps.length + 1)) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-50 via-pastel-100 to-pastel-200 p-4 flex items-center justify-center">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pastel-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pastel-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pastel-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-pastel-300 bg-white/80 backdrop-blur shadow-lg">
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-pastel-500 to-pastel-600 bg-clip-text text-transparent">
                {currentStep === "complete" ? "All Set!" : "Get Started"}
              </CardTitle>
              <CardDescription className="text-pastel-600">
                {currentStep === "name" && "Tell us about yourself"}
                {currentStep === "contact" && "Keep us in touch"}
                {currentStep === "helpGoal" && "What's your main goal?"}
                {currentStep === "source" && "Help us improve"}
                {currentStep === "complete" && "Your account is ready to go!"}
              </CardDescription>
            </div>

            {currentStep !== "complete" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Step {["name", "contact", "helpGoal", "source"].indexOf(currentStep) + 1} of 4</span>
                  <span>{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="w-full h-2 bg-pastel-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pastel-400 to-pastel-500 transition-all duration-500 rounded-full"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {renderContent()}

          <div className="flex gap-3">
            {currentStep !== "complete" && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-pastel-300 text-pastel-700 hover:bg-pastel-50"
                  onClick={handleSkip}
                >
                  Skip for Now
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-pastel-500 to-pastel-600 hover:from-pastel-600 hover:to-pastel-700 text-white"
                  onClick={handleNext}
                  disabled={!validateStep()}
                >
                  {["name", "contact", "helpGoal", "source"].indexOf(currentStep) === 3 ? (
                    <>
                      Complete <Check className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </>
            )}
            {currentStep === "complete" && (
              <Button
                className="w-full bg-gradient-to-r from-pastel-500 to-pastel-600 hover:from-pastel-600 hover:to-pastel-700 text-white"
                onClick={handleComplete}
              >
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
