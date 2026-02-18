
"use client";

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { DashboardClientContent } from "@/components/dashboard/dashboard-client-content";
import { useUserTransactions } from "@/modules/transactions";
import { useUserProjects } from "@/modules/projects";
import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from "@/types";
import { useProjectFilter } from "@/context/project-filter-context";
import { useAuth } from "@/context/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LabReportsSection } from "@/components/dashboard/lab-reports-section";

export default function DashboardPage() {
  const { transactions, loading: transactionsLoading } = useUserTransactions();
  const { projects, loading: projectsLoading } = useUserProjects();
  const budgets: any[] = []; // budgets module not yet segregated
  
  const { selectedProjectId, setSelectedProjectId } = useProjectFilter();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const [selectedModules, setSelectedModules] = useState<string[] | null>(null);

  const loading = !isMounted || transactionsLoading || projectsLoading || selectedModules === null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      const mods = (snap.data()?.profile?.selectedModules as string[] | undefined) ?? [];
      setSelectedModules(mods);
    };
    fetchModules();
  }, [user]);

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    if (selectedProjectId === "all") {
      setPageTitle("All Projects");
    } else {
      const projectName = projects.find(p => p.id === selectedProjectId)?.name;
      setPageTitle(projectName || "Dashboard");
    }
  }, [selectedProjectId, projects]);

  const filteredData = useMemo(() => {
    if (selectedProjectId === "all") {
      return {
        transactions,
        budgets,
      };
    }
    return {
      transactions: transactions.filter((t) => t.projectId === selectedProjectId),
      budgets: budgets.filter((b) => b.projectId === selectedProjectId),
    };
  }, [transactions, budgets, selectedProjectId]);


  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <PageHeader
            title={pageTitle}
            description="A summary of your financial activity."
            className="mb-0"
          />
        </div>
        {loading || !selectedModules?.includes('projects') ? <Skeleton className="h-10 w-48" /> : (
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project: Project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
         <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
            <div className="mt-6">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </div>
      ) : (
        <>
            {selectedModules?.includes('transactions') && (
              <>
                <DashboardClientContent 
                    transactions={filteredData.transactions} 
                    budgets={filteredData.budgets}
                    isProjectView={selectedProjectId !== 'all'}
                />
                <div className="mt-6">
                    <AIInsights transactions={filteredData.transactions}/>
                </div>
              </>
            )}

            {selectedModules?.includes('labReports') && (
              <LabReportsSection />
            )}
        </>
      )}
    </div>
  );
}
