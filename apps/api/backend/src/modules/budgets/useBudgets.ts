"use client";

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { BudgetSummary } from '@/types';

export function useUserBudgets(projectId?: string) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    const budgetsRef = collection(db, 'users', user.uid, 'budgets');
    const q = projectId && projectId !== 'all'
      ? query(budgetsRef, where('projectId', '==', projectId), orderBy('createdAt', 'desc'))
      : query(budgetsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: BudgetSummary[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setBudgets(list);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching budgets:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, projectId]);

  const addBudget = async (category: string, amount: number, projId: string) => {
    if (!user) throw new Error('User not authenticated');
    const budgetsRef = collection(db, 'users', user.uid, 'budgets');
    const docRef = await addDoc(budgetsRef, {
      category,
      budget: amount,
      projectId: projId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  };

  const updateBudget = async (id: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');
    const budgetRef = doc(db, 'users', user.uid, 'budgets', id);
    await updateDoc(budgetRef, { budget: amount, updatedAt: Timestamp.now() });
  };

  const deleteBudget = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    const budgetRef = doc(db, 'users', user.uid, 'budgets', id);
    await deleteDoc(budgetRef);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    budgets.forEach((b) => set.add(b.category));
    return Array.from(set).sort();
  }, [budgets]);

  return { budgets, loading, addBudget, updateBudget, deleteBudget, categories };
}
