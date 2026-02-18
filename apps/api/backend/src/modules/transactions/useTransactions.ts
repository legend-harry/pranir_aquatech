"use client";

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Transaction } from '@/types';

/**
 * Transactions module: Firestore hooks and CRUD
 * Path: users/{uid}/transactions
 */
export function useUserTransactions(projectId?: string) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    let q = query(transactionsRef, orderBy('date', 'desc'));
    
    if (projectId && projectId !== 'all') {
      q = query(transactionsRef, where('projectId', '==', projectId), orderBy('date', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionList: Transaction[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Transaction));
      
      setTransactions(transactionList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, projectId]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    const newTransaction = {
      ...transaction,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(transactionsRef, newTransaction);
    return docRef.id;
  };

  const updateTransaction = async (transactionId: string, data: Partial<Transaction>) => {
    if (!user) throw new Error('User not authenticated');
    
    const transactionRef = doc(db, 'users', user.uid, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    const transactionRef = doc(db, 'users', user.uid, 'transactions', transactionId);
    await deleteDoc(transactionRef);
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction };
}
