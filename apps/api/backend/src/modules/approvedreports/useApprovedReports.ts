"use client";

import { useState, useEffect } from 'react';
import { rtdb } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { ref as dbRef, onValue } from 'firebase/database';
import { notificationService } from '@/lib/notifications';

export type ApprovedReportStatus = 'approved';

export interface ApprovedReport {
  id: string;
  customerMobile: string;
  reportUrl?: string;
  sampleName?: string;
  partnerEmail?: string;
  parameters?: any;
  status: ApprovedReportStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
  partnerId: string;
}

export function useApprovedReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ApprovedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !user?.phoneNumber) {
      setReports([]);
      setLoading(false);
      return;
    }

    // Extract 10-digit mobile from phone number (Firebase stores as +91xxxxxxxxxx)
    const mobile = user.phoneNumber.replace(/\D/g, '').slice(-10);
    
    const reportsRef = dbRef(rtdb, `approvedReports/${mobile}`);
    
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsList: ApprovedReport[] = [];
        // Iterate through partners
        Object.entries(data).forEach(([partnerId, partnerReports]: [string, any]) => {
          // Iterate through reports for this partner
          Object.entries(partnerReports).forEach(([reportId, reportData]: [string, any]) => {
            reportsList.push({
              id: reportId,
              ...reportData,
            });
          });
        });
        // Sort by approvedAt descending
        reportsList.sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
        setReports(reportsList);
      } else {
        setReports([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching approved reports:', error);
      setReports([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return {
    reports,
    loading,
  };
}
