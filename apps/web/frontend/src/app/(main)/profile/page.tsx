"use client";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Currency, useCurrency } from "@/context/currency-context";
import { useUser } from "@/context/user-context";
import { useUserProjects } from "@/modules/projects";
import { useProjectFilter } from "@/context/project-filter-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserProfilePage } from "./user-profile";
import { Edit, Trash2, Archive, ArchiveRestore, ArchiveX } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Project, Employee } from "@/types";
import { Separator } from "@/components/ui/separator";
import { useEmployees } from "@/hooks/use-database";
import { useAuth } from "@/context/auth-context";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  selectedKeys.forEach((key) => {
    const mod = moduleSet.find((m) => m.key === key);
    mod?.requires?.forEach((r) => required.add(r));
  });
  return Array.from(required);
}

const currencies: { value: Currency; label: string }[] = [
  { value: "INR", label: "INR (Indian Rupee)" },
  { value: "USD", label: "USD (US Dollar)" },
  { value: "EUR", label: "EUR (Euro)" },
  { value: "GBP", label: "GBP (British Pound)" },
];

function SettingsTab() {
  const { currency, setCurrency } = useCurrency();
  const { projects } = useUserProjects();
  const { employees } = useEmployees();
  const { selectedProjectId, setSelectedProjectId } = useProjectFilter();
  const { user } = useAuth();
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [defaultProject, setDefaultProject] = useState<string>("all");
  const [primaryEmployee, setPrimaryEmployee] = useState<string>("none");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingModules, setSavingModules] = useState(false);

  useEffect(() => {
    const storedDefault = localStorage.getItem("defaultProjectId");
    if (storedDefault) {
      setDefaultProject(storedDefault);
    }
    const storedPrimary = localStorage.getItem("primaryEmployeeId");
    if (storedPrimary) {
      setPrimaryEmployee(storedPrimary);
    }
    const loadModules = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      const profile = snap.data()?.profile || {};
      setSelectedModules(profile.selectedModules ?? []);
      setSettingsLoading(false);
    };
    loadModules();
  }, []);

  const toggleModule = (key: string) => {
    setSelectedModules((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSaveModules = async () => {
    if (!user) return;
    setSavingModules(true);
    try {
      const moduleSet = userRole === "partner" ? PARTNER_MODULES : CUSTOMER_MODULES;
      const finalModules = getRequiredModules(selectedModules, moduleSet);
      await setDoc(doc(db, "users", user.uid), {
        profile: {
          selectedModules: finalModules,
        },
        updatedAt: new Date(),
      }, { merge: true });
      toast({ title: "Modules saved", description: "Visibility updated. Dependencies auto-enabled." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save modules." });
    } finally {
      setSavingModules(false);
    }
  };

  const handleDefaultProjectChange = (projectId: string) => {
    setDefaultProject(projectId);
    localStorage.setItem("defaultProjectId", projectId);
    // Also update the current session's filter if it was on the old default
    if (selectedProjectId === localStorage.getItem("defaultProjectId")) {
        setSelectedProjectId(projectId);
    }
  }

  const handlePrimaryEmployeeChange = (employeeId: string) => {
    setPrimaryEmployee(employeeId);
    if (employeeId === 'none') {
        localStorage.removeItem("primaryEmployeeId");
    } else {
        localStorage.setItem("primaryEmployeeId", employeeId);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Manage your application-wide preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border border-dashed">
          <CardHeader>
            <CardTitle>Module Visibility</CardTitle>
            <CardDescription>Select the modules you want to see. Required modules are auto-included.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {settingsLoading ? (
              <p className="text-sm text-muted-foreground">Loading modules...</p>
            ) : (
              (userRole === "partner" ? PARTNER_MODULES : CUSTOMER_MODULES).map((m) => {
                const moduleSet = userRole === "partner" ? PARTNER_MODULES : CUSTOMER_MODULES;
                const autoIncluded = !selectedModules.includes(m.key) && getRequiredModules(selectedModules, moduleSet).includes(m.key);
                return (
                  <label key={m.key} className="flex items-start gap-3 border rounded-md p-3 bg-card">
                    <Checkbox
                      checked={selectedModules.includes(m.key) || autoIncluded}
                      onCheckedChange={() => toggleModule(m.key)}
                      disabled={autoIncluded}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {m.label}
                        {autoIncluded && <span className="ml-2 text-xs text-blue-600">(auto-included)</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">{m.description}</div>
                      {m.requires?.length ? (
                        <div className="text-xs text-muted-foreground mt-1">
                          Requires: {m.requires.map((r) => (userRole === "partner" ? PARTNER_MODULES : CUSTOMER_MODULES).find((mo) => mo.key === r)?.label).join(", ")}
                        </div>
                      ) : null}
                    </div>
                  </label>
                );
              })
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSaveModules} disabled={savingModules}>
              {savingModules ? "Saving..." : "Save Modules"}
            </Button>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <Label htmlFor="currency-select">Currency</Label>
          <div className="md:col-span-2">
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as Currency)}
            >
              <SelectTrigger id="currency-select" className="w-full">
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <Label htmlFor="default-project-select">Default Project</Label>
          <div className="md:col-span-2">
            <Select value={defaultProject} onValueChange={handleDefaultProjectChange}>
              <SelectTrigger id="default-project-select" className="w-full">
                <SelectValue placeholder="Select a default project" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.id === defaultProject && "(default)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label htmlFor="primary-employee-select">Primary Employee for Notifications</Label>
            <div className="md:col-span-2">
                <Select value={primaryEmployee} onValueChange={handlePrimaryEmployeeChange}>
                <SelectTrigger id="primary-employee-select" className="w-full">
                    <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {employees.map((e: Employee) => (
                    <SelectItem key={e.id} value={e.id}>
                        {e.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectSettings() {
    const { projects, loading, updateProject, deleteProject } = useUserProjects();
    const { toast } = useToast();
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [archivingProject, setArchivingProject] = useState<Project | null>(null);
    const [deletingProject, setDeletingProject] = useState<Project | null>(null);
    const [newProjectName, setNewProjectName] = useState("");
    const [defaultProject, setDefaultProject] = useState<string>("");

    useEffect(() => {
        const storedDefault = localStorage.getItem("defaultProjectId");
        if (storedDefault) {
            setDefaultProject(storedDefault);
        }
    }, []);

    const { activeProjects, archivedProjects } = useMemo(() => {
        const active = projects.filter(p => !p.archived);
        const archived = projects.filter(p => p.archived);
        return { activeProjects: active, archivedProjects: archived };
    }, [projects]);


    const handleEditClick = (project: Project) => {
        setEditingProject(project);
        setNewProjectName(project.name);
    }
    
    const handleUpdateProject = async () => {
        if (!editingProject || !newProjectName.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Project name cannot be empty."
            });
            return;
        }

        try {
            await updateProject(editingProject.id, { name: newProjectName.trim() });
            toast({
                title: "Project Updated",
                description: `Successfully renamed to "${newProjectName.trim()}".`
            });
        } catch (error) {
            console.error("Failed to update project", error);
            toast({ variant: "destructive", title: "Update Failed"});
        } finally {
            setEditingProject(null);
            setNewProjectName("");
        }
    }
    
    const handleArchiveProject = async () => {
        if (!archivingProject) return;
        try {
            await updateProject(archivingProject.id, { archived: true });
            toast({
                title: "Project Archived",
                description: `Project "${archivingProject.name}" has been moved to archives.`
            });
        } catch (error) {
            console.error("Failed to archive project", error);
            toast({ variant: "destructive", title: "Archive Failed"});
        } finally {
            setArchivingProject(null);
        }
    }
    
    const handleRestoreProject = async (project: Project) => {
        try {
            await updateProject(project.id, { archived: false });
            toast({
                title: "Project Restored",
                description: `Project "${project.name}" has been restored.`
            });
        } catch (error) {
            console.error("Failed to restore project", error);
            toast({ variant: "destructive", title: "Restore Failed"});
        }
    }


    const handleDeleteProject = async () => {
        if (!deletingProject) return;

        try {
            await deleteProject(deletingProject.id);
            
            toast({
                title: "Project Deleted Permanently",
                description: `Project "${deletingProject.name}" has been permanently deleted.`
            });
        } catch (error) {
             console.error("Failed to delete project", error);
            toast({ variant: "destructive", title: "Deletion Failed"});
        } finally {
            setDeletingProject(null);
        }
    }


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Project Management</CardTitle>
                    <CardDescription>Edit or archive your active projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {activeProjects.map(project => (
                            <li key={project.id} className="flex items-center justify-between p-3 rounded-md border">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{project.name}</span>
                                    {project.id === defaultProject && (
                                        <span className="text-xs text-muted-foreground">(default)</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(project)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setArchivingProject(project)}>
                                        <Archive className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                        {loading && <li className="text-muted-foreground">Loading projects...</li>}
                        {!loading && activeProjects.length === 0 && <li className="text-muted-foreground text-center py-4">No active projects found.</li>}
                    </ul>
                </CardContent>
            </Card>

            {archivedProjects.length > 0 && (
                 <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Archive className="h-5 w-5" />
                            Archived Projects
                        </CardTitle>
                        <CardDescription>Restore projects or delete them permanently.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {archivedProjects.map(project => (
                                <li key={project.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                    <span className="font-medium text-muted-foreground">{project.name}</span>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRestoreProject(project)}>
                                            <ArchiveRestore className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingProject(project)}>
                                            <ArchiveX className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

             {/* Edit Dialog */}
            <Dialog open={!!editingProject} onOpenChange={(isOpen) => !isOpen && setEditingProject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Project Name</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="edit-project-name">Project Name</Label>
                        <Input 
                            id="edit-project-name" 
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
                        <Button onClick={handleUpdateProject}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Archive Confirmation */}
            <AlertDialog open={!!archivingProject} onOpenChange={(isOpen) => !isOpen && setArchivingProject(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to archive the project <span className="font-bold">"{archivingProject?.name}"</span>? 
                            It will be hidden from the main app but can be restored later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchiveProject}>
                            Yes, archive it
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingProject} onOpenChange={(isOpen) => !isOpen && setDeletingProject(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the project <span className="font-bold">"{deletingProject?.name}"</span>. 
                            This action does not delete associated transactions or budgets and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90">
                            Yes, delete permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div>
      <PageHeader
        title={`${user}'s Profile`}
        description="View and manage your profile information and settings."
      />
      <Tabs defaultValue="user-profile" className="w-full">
        <TabsList>
          <TabsTrigger value="user-profile">User Profile</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="user-profile" className="mt-6">
          <UserProfilePage />
        </TabsContent>
        <TabsContent value="projects" className="mt-6">
            <ProjectSettings />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
