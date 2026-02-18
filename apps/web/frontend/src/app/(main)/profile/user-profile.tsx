"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
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
import { Loader2, Save, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  fullName: string;
  email: string;
  mobileNumber: string;
  helpGoal: string;
  sourceOfLearning: string;
}

export function UserProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    mobileNumber: "",
    helpGoal: "",
    sourceOfLearning: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/onboarding");
      return;
    }

    if (authLoading || !user) return;

    const loadProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Merge profile data with defaults
          setProfile({
            fullName: data.profile?.fullName || data.displayName || "",
            email: data.profile?.email || user.email || "",
            mobileNumber: data.profile?.mobileNumber || "",
            helpGoal: data.profile?.helpGoal || "",
            sourceOfLearning: data.profile?.sourceOfLearning || "",
          });
        } else {
          // If no profile exists, set defaults from auth
          setProfile({
            fullName: user.displayName || "",
            email: user.email || "",
            mobileNumber: "",
            helpGoal: "",
            sourceOfLearning: "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, authLoading, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        profile: profile,
        updatedAt: Timestamp.now(),
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </div>
          <Button
            variant={editing ? "destructive" : "default"}
            size="sm"
            onClick={() => {
              if (editing) {
                setProfile(profile);
              }
              setEditing(!editing);
            }}
            disabled={saving}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {editing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Full Name
            </label>
            <Input
              name="fullName"
              value={profile.fullName}
              onChange={handleInputChange}
              disabled={!editing}
              placeholder="Your full name"
              className="bg-card border-input text-foreground disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <Input
              name="email"
              type="email"
              value={profile.email}
              onChange={handleInputChange}
              disabled={!editing}
              placeholder="your@email.com"
              className="bg-card border-input text-foreground disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Mobile Number
            </label>
            <Input
              name="mobileNumber"
              type="tel"
              value={profile.mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleInputChange({
                  ...e,
                  target: { ...e.target, name: "mobileNumber", value },
                } as any);
              }}
              disabled={!editing}
              placeholder="10-digit mobile number"
              className="bg-card border-input text-foreground disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              How can we help you?
            </label>
            <Select
              value={profile.helpGoal}
              onValueChange={(value) => handleSelectChange("helpGoal", value)}
              disabled={!editing}
            >
              <SelectTrigger className="bg-card border-input text-foreground disabled:opacity-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transaction-tracking">💰 Track transactions & expenses</SelectItem>
                <SelectItem value="financial-insights">📊 Get AI-powered financial insights</SelectItem>
                <SelectItem value="farm-management">🐟 Manage farm operations</SelectItem>
                <SelectItem value="time-tracking">⏱️ Track employee time & attendance</SelectItem>
                <SelectItem value="business-planning">📋 Plan & forecast business growth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Where did you hear about us?
            </label>
            <Select
              value={profile.sourceOfLearning}
              onValueChange={(value) => handleSelectChange("sourceOfLearning", value)}
              disabled={!editing}
            >
              <SelectTrigger className="bg-card border-input text-foreground disabled:opacity-50">
                <SelectValue />
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

          {editing && (
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-foreground font-medium">Email Address</p>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Button variant="outline" className="w-full" disabled>
            Change Password (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
