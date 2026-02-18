"use client";

import { useState, useEffect } from 'react';
import { rtdb } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { ref as dbRef, onValue, update, get, set, push } from 'firebase/database';
import { ParameterRange } from './usePartnerPortal';

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface PartnerReport {
  id: string;
  customerMobile: string;
  reportUrl?: string;
  sampleName?: string;
  partnerEmail?: string;
  parameters?: ParameterRange[];
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export function usePartnerReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<PartnerReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setReports([]);
      setLoading(false);
      return;
    }

    const reportsRef = dbRef(rtdb, `partnerProfiles/${user.uid}/labReports`);
    
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsList: PartnerReport[] = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        // Sort by createdAt descending
        reportsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(reportsList);
      } else {
        setReports([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching partner reports:', error);
      setReports([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const approveReport = async (reportId: string) => {
    if (!user?.uid) throw new Error('User not authenticated');

    // Get the report data
    const reportRef = dbRef(rtdb, `partnerProfiles/${user.uid}/labReports/${reportId}`);
    const snapshot = await get(reportRef);
    const reportData = snapshot.val();

    if (!reportData) throw new Error('Report not found');

    // Store approved report in a public path that customers can access
    // Path: approvedReports/{customerMobile}/{partnerId}/{reportId}
    const approvedReportRef = dbRef(
      rtdb,
      `approvedReports/${reportData.customerMobile}/${user.uid}/${reportId}`
    );
    
    // Build report object with only defined values
    const approvedReportData: any = {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      partnerId: user.uid,
      customerMobile: reportData.customerMobile,
      createdAt: reportData.createdAt,
    };

    // Add optional fields only if they exist
    if (reportData.reportUrl) approvedReportData.reportUrl = reportData.reportUrl;
    if (reportData.sampleName) approvedReportData.sampleName = reportData.sampleName;
    if (reportData.partnerEmail) approvedReportData.partnerEmail = reportData.partnerEmail;
    if (reportData.parameters) approvedReportData.parameters = reportData.parameters;

    await set(approvedReportRef, approvedReportData);

    // Update status in partner's RTDB
    await update(reportRef, {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const rejectReport = async (reportId: string, reason?: string) => {
    if (!user?.uid) throw new Error('User not authenticated');

    const reportRef = dbRef(rtdb, `partnerProfiles/${user.uid}/labReports/${reportId}`);
    await update(reportRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason || 'Report rejected',
      updatedAt: new Date().toISOString(),
    });
  };

  return {
    reports,
    loading,
    approveReport,
    rejectReport,
  };
}
