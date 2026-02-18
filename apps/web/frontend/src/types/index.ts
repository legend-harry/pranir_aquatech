// Pranir-AquaTech Type Definitions for Firestore

export type UserProfile = {
  id?: string;
  email: string;
  name: string;
  role: "customer" | "partner";
  phoneNumber?: string;
  tier: "free" | "pro" | "enterprise";
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Transaction = {
  id?: string;
  userId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  amount: number;
  category: string;
  vendor: string;
  description: string;
  notes?: string;
  type: "expense" | "income";
  status: "completed" | "credit" | "expected";
  quantity?: number;
  unit?: string;
  ratePerUnit?: number;
  invoiceNo?: string;
  receiptUrl?: string;
};

export type Analytics = {
  id?: string;
  userId: string;
  period: string; // YYYY-MM
  totalExpenses: number;
  totalIncome: number;
  categoryBreakdown: Record<string, number>;
  insights: string[];
  generatedAt: Date;
};

export type SharedDocument = {
  id?: string;
  title: string;
  description: string;
  author: string;
  category: string;
  content: string;
  tags: string[];
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
  views: number;
  helpful: number;
};

export type Module = {
  id: string;
  name: string;
  enabled: boolean;
  tier: "free" | "pro" | "enterprise";
  createdAt: Date;
};

// Legacy types (for backward compatibility during migration)
export type Budget = {
  category: string;
  amount: number;
};

export type BudgetSummary = {
  id: string;
  category: string;
  budget: number;
  projectId: string;
};

export type Project = {
  id: string;
  name: string;
  archived?: boolean;
};

export type Employee = {
  id: string;
  name: string;
  wage: number;
  wageType: "hourly" | "daily" | "monthly";
  projectIds: string[];
  overtimeRateMultiplier: number;
  notes?: string;
  employmentType: "permanent" | "temporary";
  employmentEndDate?: string;
};

export type AttendanceStatus = "full-day" | "half-day" | "absent" | "scheduled";

export type AttendanceRecord = {
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  overtimeHours?: number;
  overtimeRate?: number;
  notes?: string;
  clockIn?: string;
  clockOut?: string;
  breakDuration?: number;
};
