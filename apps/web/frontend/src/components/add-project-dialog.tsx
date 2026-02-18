"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUserProjects, useProjectCount } from "@/modules/projects";
import { useSubscription } from "@/context/subscription-context";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProjectDialog({ open, onOpenChange }: AddProjectDialogProps) {
  const { toast } = useToast();
  const { addProject } = useUserProjects();
  const { count: projectCount, loading: countLoading } = useProjectCount();
  const { isPremium } = useSubscription();
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAddProject = isPremium || projectCount === 0;
  const needsPremium = !isPremium && projectCount >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAddProject) {
      toast({
        title: "Premium Required",
        description: "You need a premium subscription to create more than one project.",
        variant: "destructive",
      });
      return;
    }

    if (!projectName.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addProject(projectName.trim());
      toast({
        title: "Project Created",
        description: `Successfully created project "${projectName.trim()}"`,
      });
      setProjectName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            {needsPremium
              ? "Upgrade to Premium to create unlimited projects"
              : "Create a project to organize your transactions and budgets"}
          </DialogDescription>
        </DialogHeader>

        {needsPremium ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Lock className="h-5 w-5" />
                Premium Feature
              </CardTitle>
              <CardDescription className="text-amber-700">
                You've reached the limit of 1 free project. Upgrade to Premium for unlimited projects!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-amber-900 font-medium">Premium Benefits:</p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Unlimited Projects
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Advanced AI Insights
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Priority Support
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Custom Reports
                  </li>
                </ul>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                onClick={() => {
                  onOpenChange(false);
                  // Navigate to upgrade page
                  window.location.href = "/upgrade";
                }}
              >
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="projectName" className="text-sm font-medium">
                Project Name *
              </label>
              <Input
                id="projectName"
                placeholder="e.g., Marketing Campaign, Farm Operations"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
              {projectCount === 0 && (
                <p className="text-xs text-muted-foreground">
                  🎉 This is your first project - it's free!
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
