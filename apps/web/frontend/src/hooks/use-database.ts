
"use client";

import { useState, useEffect, useMemo } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { collection, getDocs } from 'firebase/firestore';
import { rtdb, db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Transaction, BudgetSummary, Project, Employee, AttendanceRecord, AttendanceStatus } from '@/types';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// NOTE: This module is deprecated. Use Firestore hooks instead.
// The Realtime Database has been replaced with Firestore.
// These functions now return empty data to prevent errors in legacy components.

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Legacy function - returns empty projects
        // TODO: Migrate to Firestore queries for users/{uid}/projects
        setProjects([]);
        setLoading(false);
    }, []);

    return { projects, loading };
}


export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Legacy function - returns empty transactions
    // TODO: Migrate to Firestore queries for users/{uid}/transactions
    setTransactions([]);
    setLoading(false);
  }, []);

  return { transactions, loading };
}


export function useBudgets() {
    const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Legacy function - returns empty budgets
        // TODO: Migrate to Firestore queries for users/{uid}/budgets
        setBudgets([]);
        setLoading(false);
    }, []);

    return { budgets, loading };
}

export function useCategories(projectId?: string) {
    const { budgets, loading } = useBudgets();
    
    const categories = loading 
        ? [] 
        : [...new Set(budgets.filter(b => !projectId || b.projectId === projectId).map(b => b.category))].sort();

    return { categories, loading };
}

export function useEmployees() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const snap = await getDocs(collection(db, `users/${user.uid}/employees`));
                const list: Employee[] = snap.docs.map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as any) }));
                setEmployees(list);
            } catch (error: any) {
                console.error("Firebase read failed for employees: " + error.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    return { employees, loading };
}

type DailySummary = {
  status: 'present' | 'absent' | 'half-day';
};

export function useAttendanceForDates() {
    const [dailySummaries, setDailySummaries] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Legacy function - returns empty attendance
        // TODO: Migrate to Firestore queries for users/{uid}/attendance
        setDailySummaries({});
        setLoading(false);
    }, []);

    return { dailySummaries, loading };
}

export function useEmployeeAttendance(employeeId: string) {
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Legacy function - returns empty attendance
        // TODO: Migrate to Firestore queries for users/{uid}/employees/{employeeId}/attendance
        setAttendanceRecords({});
        setLoading(false);
    }, [employeeId]);

    return { attendanceRecords, loading };
}

export function useEmployeeMonthlyAttendance(employeeId: string, monthDate: Date) {
    const { attendanceRecords, loading } = useEmployeeAttendance(employeeId);

    const { attendanceForMonth, summary } = useMemo(() => {
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        
        const recordsInMonth = Object.values(attendanceRecords).filter(record => {
            const recordDate = new Date(record.date);
            // Adjust for timezone offset by comparing year, month, and day
            const recordUTC = new Date(Date.UTC(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate()));
            return isWithinInterval(recordUTC, { start, end });
        });

        const monthSummary = {
            present: recordsInMonth.filter(r => r.status === 'full-day').length,
            absent: recordsInMonth.filter(r => r.status === 'absent').length,
            halfDay: recordsInMonth.filter(r => r.status === 'half-day').length,
        };

        return { attendanceForMonth: recordsInMonth, summary: monthSummary };
    }, [attendanceRecords, monthDate]);
    
    return { attendanceForMonth, summary, loading };
}

    