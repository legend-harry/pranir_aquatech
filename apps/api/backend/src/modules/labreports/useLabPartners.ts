"use client";

import { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

export interface LabPartner {
  id: string;
  email: string;
  name?: string;
  status?: 'invited' | 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
  fcmToken?: string;
}

export function useLabPartners() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<LabPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPartners([]);
      setLoading(false);
      return;
    }

    const partnersRef = collection(db, 'users', user.uid, 'labPartners');
    const unsubscribe = onSnapshot(partnersRef, (snap) => {
      setPartners(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching lab partners:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addLabPartner = async (email: string, name?: string) => {
    if (!user) throw new Error('User not authenticated');
    const partnersRef = collection(db, 'users', user.uid, 'labPartners');
    const docRef = await addDoc(partnersRef, {
      email,
      name: name || null,
      status: 'invited',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  };

  const updateLabPartner = async (id: string, data: Partial<LabPartner>) => {
    if (!user) throw new Error('User not authenticated');
    const partnerRef = doc(db, 'users', user.uid, 'labPartners', id);
    await updateDoc(partnerRef, { ...data, updatedAt: Timestamp.now() });
  };

  const deleteLabPartner = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    const partnerRef = doc(db, 'users', user.uid, 'labPartners', id);
    await deleteDoc(partnerRef);
  };

  return { partners, loading, addLabPartner, updateLabPartner, deleteLabPartner };
}
