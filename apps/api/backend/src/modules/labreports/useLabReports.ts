"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { notificationService } from '@/lib/notifications';
import { useApprovedReports } from '../approvedreports/useApprovedReports';

export type LabReportStatus = 'ready';

export interface LabReport {
  id: string;
  title: string;
  sampleId: string;
  status: LabReportStatus;
  partnerEmail?: string | null;
  url?: string | null;
  notes?: string | null;
  createdAt: any;
  updatedAt: any;
}

export function useLabReports() {
  const { user } = useAuth();
  const { reports: approvedReports, loading } = useApprovedReports();
  const [reports, setReports] = useState<LabReport[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      setReports([]);
      return;
    }

    // Convert approved reports to lab report format
    const convertedReports: LabReport[] = approvedReports.map((report) => ({
      id: report.id,
      title: report.sampleName || 'Lab Report',
      sampleId: report.id,
      status: 'ready' as LabReportStatus,
      partnerEmail: report.partnerEmail,
      url: report.reportUrl,
      notes: typeof report.parameters === 'string' ? report.parameters : JSON.stringify(report.parameters || {}),
      createdAt: new Date(report.createdAt),
      updatedAt: new Date(report.approvedAt),
    }));

    setReports(convertedReports);
  }, [approvedReports, user?.uid]);

  const addLabReport = async (data: Omit<LabReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    // This is now handled by partner approval workflow
    throw new Error('Use partner portal to upload reports');
  };

  const updateLabReportStatus = async (reportId: string, status: LabReportStatus, url?: string | null) => {
    // Reports are read-only from customer perspective
    throw new Error('Reports cannot be modified');
  };

  return { reports, loading, addLabReport, updateLabReportStatus };
}
