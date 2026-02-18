"use client";

import { useState } from 'react';
import { db, rtdb } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { ref as dbRef, set, push, get } from 'firebase/database';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export type ParameterRange = {
  name: string;
  unit?: string;
  min?: number;
  max?: number;
  optimal?: string;
};

export function usePartnerPortal() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const ensureUser = () => {
    if (!user) throw new Error('User not authenticated');
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadFile = async (file: File, path: string) => {
    ensureUser();
    setUploading(true);
    try {
      // Convert file to base64
      const base64Data = await convertFileToBase64(file);
      
      // Create file metadata
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64Data,
        uploadedAt: new Date().toISOString(),
      };
      
      // Store in Realtime Database
      const fileRef = push(dbRef(rtdb, `files/${user!.uid}/${path}`));
      await set(fileRef, fileData);
      
      // Return the database reference key as the "url"
      return fileRef.key;
    } finally {
      setUploading(false);
    }
  };

  const savePartnerProfile = async (data: { companyName: string; logoUrl?: string; stampUrl?: string }) => {
    ensureUser();
    const profileRef = dbRef(rtdb, `partnerProfiles/${user!.uid}/branding`);
    
    const profileData: any = {
      companyName: data.companyName,
      updatedAt: new Date().toISOString(),
    };
    
    if (data.logoUrl) profileData.logoUrl = data.logoUrl;
    if (data.stampUrl) profileData.stampUrl = data.stampUrl;
    
    await set(profileRef, profileData);
  };

  const addLabTestTemplate = async (payload: { name: string; description?: string; parameters: ParameterRange[] }) => {
    ensureUser();
    const testsRef = push(dbRef(rtdb, `partnerProfiles/${user!.uid}/labTests`));
    
    const testData: any = {
      name: payload.name,
      parameters: payload.parameters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (payload.description) testData.description = payload.description;
    
    await set(testsRef, testData);
    return testsRef.key;
  };

  const addReportUpload = async (payload: {
    customerMobile: string;
    reportUrl?: string;
    sampleName?: string;
    partnerEmail?: string;
    parameters?: ParameterRange[];
    status?: 'pending' | 'sample';
  }) => {
    ensureUser();
    
    // Store in partner's RTDB with 'pending' status (awaiting partner approval)
    const partnerReportsRef = push(dbRef(rtdb, `partnerProfiles/${user!.uid}/labReports`));
    
    // Build report data with only defined values (Firebase doesn't allow undefined)
    const reportData: any = {
      customerMobile: payload.customerMobile,
      status: payload.status ?? (payload.reportUrl ? 'pending' : 'sample'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add optional fields only if they're defined
    if (payload.reportUrl) reportData.reportUrl = payload.reportUrl;
    if (payload.sampleName) reportData.sampleName = payload.sampleName;
    if (payload.partnerEmail) reportData.partnerEmail = payload.partnerEmail;
    if (payload.parameters && payload.parameters.length > 0) reportData.parameters = payload.parameters;
    
    await set(partnerReportsRef, reportData);
    
    return partnerReportsRef.key;
  };

  const addSampleIntake = async (payload: { customerMobile: string; sampleName: string; notes?: string }) => {
    return addReportUpload({
      customerMobile: payload.customerMobile,
      sampleName: payload.sampleName,
      partnerEmail: user?.email || undefined,
      status: 'sample',
      parameters: [],
    });
  };

  const suggestRanges = (testName: string): ParameterRange[] => {
    const presets: Record<string, ParameterRange[]> = {
      water: [
        { name: 'pH', unit: '', min: 7, max: 8.5, optimal: '7.5-8.0' },
        { name: 'DO', unit: 'mg/L', min: 5, max: 8, optimal: '6-7.5' },
        { name: 'Ammonia', unit: 'mg/L', min: 0, max: 0.5, optimal: '<0.2' },
      ],
      soil: [
        { name: 'pH', unit: '', min: 6.5, max: 8.5, optimal: '7.0-7.5' },
        { name: 'Organic Matter', unit: '%', min: 1, max: 5, optimal: '2-4' },
      ],
    };
    return presets[testName.toLowerCase()] ?? [];
  };

  const getFileData = async (userId: string, path: string, fileKey: string) => {
    const fileRef = dbRef(rtdb, `files/${userId}/${path}/${fileKey}`);
    const snapshot = await get(fileRef);
    return snapshot.val();
  };

  return {
    uploading,
    uploadFile,
    getFileData,
    savePartnerProfile,
    addLabTestTemplate,
    addReportUpload,
    addSampleIntake,
    suggestRanges,
  };
}
