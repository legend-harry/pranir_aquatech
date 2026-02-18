"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const CUSTOMER_MODULES: { key: string; label: string; description: string; requires?: string[] }[] = [
  { key: "projects", label: "Projects", description: "Project tracking and budgeting" },
  { key: "transactions", label: "Transactions", description: "Expense and income tracking", requires: ["projects"] },
  { key: "employees", label: "Employees", description: "Team and attendance" },
  { key: "fishfarm", label: "Fish Farm", description: "Shrimp ponds and farm ops" },
  { key: "labReports", label: "Lab Reports", description: "Lab reports viewer" },
];

const PARTNER_MODULES: { key: string; label: string; description: string; requires?: string[] }[] = [
  { key: "partnerPortal", label: "Partner Portal", description: "Branding, uploads, portal" },
  { key: "labTests", label: "Test Designer", description: "Templates and parameters" },
  { key: "sampleIntake", label: "Sample Intake", description: "Log samples and customers" },
  { key: "reportGeneration", label: "Report Uploads", description: "Upload PDFs and notify", requires: ["sampleIntake"] },
];

function getRequiredModules(selectedKeys: string[], moduleSet: { key: string; requires?: string[] }[]): string[] {
  const required = new Set(selectedKeys);
  selectedKeys.forEach(key => {
    const mod = moduleSet.find(m => m.key === key);
    if (mod?.requires) {
      mod.requires.forEach(r => required.add(r));
    }
  });
  return Array.from(required);
}

function getRequiredModules(selectedKeys: string[]): string[] {
  const required = new Set(selectedKeys);
  selectedKeys.forEach(key => {
    const mod = MODULE_OPTIONS.find(m => m.key === key);
    if (mod?.requires) {
      mod.requires.forEach(r => required.add(r));
    }
  });
  return Array.from(required);
}

export default function SettingsPage() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [labPartnerEmail, setLabPartnerEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      const profile = snap.data()?.profile || {};
      setSelectedModules(profile.selectedModules ?? []);
      setLabPartnerEmail(profile.labPartnerEmail ?? "");
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleModule = (key: string) => {
    setSelectedModules((prev) => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const moduleSet = userRole === "partner" ? PARTNER_MODULES : CUSTOMER_MODULES;
      const finalModules = getRequiredModules(selectedModules, moduleSet);
      await setDoc(doc(db, "users", user.uid), {
        profile: {
          selectedModules: finalModules,
          labPartnerEmail: labPartnerEmail || null,
        },
        updatedAt: new Date(),
      }, { merge: true });
      toast({ title: "Settings saved", description: "Module visibility updated. Required dependencies auto-enabled." });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Settings" description="Manage modules and lab partner." />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" description="Manage modules and lab partner." />
      <Card>
        <CardHeader>
          <CardTitle>Module Visibility</CardTitle>
          <CardDescription>Select which modules you want to see in the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(userRole === "partner" ? PARTNER_MODULES : CUSTOMER_MODULES).map((m) => {
            const isAutoIncluded = !selectedModules.includes(m.key) && getRequiredModules(selectedModules, userRole === "partner" ? PARTNER_MODULES : CUSTOMER_MODULES).includes(m.key);
            return (
              <label key={m.key} className="flex items-start gap-3 border rounded-md p-3 bg-card">
                <Checkbox 
                  checked={selectedModules.includes(m.key) || isAutoIncluded} 
                  onCheckedChange={() => toggleModule(m.key)}
                  disabled={isAutoIncluded}
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {m.label}
                    {isAutoIncluded && <span className="ml-2 text-xs text-blue-600">(auto-included)</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">{m.description}</div>
                  {m.requires && m.requires.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Requires: {m.requires.map(r => (userRole === "partner" ? PARTNER_MODULES : CUSTOMER_MODULES).find(mo => mo.key === r)?.label).join(", ")}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lab Partner</CardTitle>
          <CardDescription>Optional email to notify when lab reports are ready.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="lab-partner">Lab partner email</Label>
          <Input id="lab-partner" type="email" value={labPartnerEmail} onChange={(e) => setLabPartnerEmail(e.target.value)} placeholder="partner@example.com" />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
      </div>
    </div>
  );
}
