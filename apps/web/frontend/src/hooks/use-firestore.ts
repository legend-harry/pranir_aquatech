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
  getDocs
} from 'firebase/firestore';
import { rtdb } from '@/lib/firebase';
import { ref as dbRef, get as dbGet } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import type { Project, Transaction } from '@/types';

/**
 * Hook to get user-specific projects from Firestore
 * Path: users/{uid}/projects
 */
export function useUserProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [legacyImported, setLegacyImported] = useState(false);

  const enableLegacyImport = process.env.NEXT_PUBLIC_ENABLE_RTDB_IMPORT === 'true';

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const projectsRef = collection(db, 'users', user.uid, 'projects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectList: Project[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Project));
      
      setProjects(projectList);
      setLoading(false);

      // One-time migration: import legacy RTDB projects if Firestore is empty
      if (enableLegacyImport && projectList.length === 0 && !legacyImported) {
        (async () => {
          try {
            const legacySnap = await dbGet(dbRef(rtdb, 'projects'));
            const legacyData = legacySnap.val();
            if (!legacyData) {
              setLegacyImported(true);
              return;
            }

            const legacyProjects = Object.entries(legacyData).map(([id, value]) => ({
              id,
              ...(value as any),
            }));

            if (legacyProjects.length === 0) {
              setLegacyImported(true);
              return;
            }

            const existingNames = new Set(projectList.map(p => p.name?.toLowerCase?.() || ''));

            for (const proj of legacyProjects) {
              const name = (proj as any).name || 'Imported Project';
              if (existingNames.has(name.toLowerCase())) continue;

              await addDoc(projectsRef, {
                name,
                archived: !!(proj as any).archived,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                importedFrom: 'rtdb',
                legacyId: proj.id,
              });
            }

            setLegacyImported(true);
          } catch (err) {
            console.error('Legacy RTDB project import failed:', err);
            // Prevent repeated attempts/spam if permissions fail
            setLegacyImported(true);
          }
        })();
      }
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, enableLegacyImport]);

  const addProject = async (name: string) => {
    if (!user) throw new Error("User not authenticated");
    
    const projectsRef = collection(db, 'users', user.uid, 'projects');
    const newProject = {
      name,
      archived: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(projectsRef, newProject);
    return docRef.id;
  };

  const updateProject = async (projectId: string, data: Partial<Project>) => {
    if (!user) throw new Error("User not authenticated");
    
    const projectRef = doc(db, 'users', user.uid, 'projects', projectId);
    await updateDoc(projectRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  };

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    const projectRef = doc(db, 'users', user.uid, 'projects', projectId);
    await deleteDoc(projectRef);
  };

  return { projects, loading, addProject, updateProject, deleteProject };
}

/**
 * Hook to get user-specific transactions from Firestore
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
      console.error("Error fetching transactions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, projectId]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error("User not authenticated");
    
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
    if (!user) throw new Error("User not authenticated");
    
    const transactionRef = doc(db, 'users', user.uid, 'transactions', transactionId);
    await updateDoc(transactionRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    const transactionRef = doc(db, 'users', user.uid, 'transactions', transactionId);
    await deleteDoc(transactionRef);
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction };
}

/**
 * Hook to get project count for premium check
 */
export function useProjectCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }

    const projectsRef = collection(db, 'users', user.uid, 'projects');
    const q = query(projectsRef, where('archived', '==', false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCount(snapshot.size);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { count, loading };
}
