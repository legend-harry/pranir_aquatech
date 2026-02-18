"use client";

import { useLabReports } from '@/modules/labreports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export function LabReportsSection() {
  const { reports, loading, addLabReport } = useLabReports();
  const [adding, setAdding] = useState(false);

  const handleAddSample = async () => {
    setAdding(true);
    try {
      await addLabReport({
        title: 'New Sample',
        sampleId: Math.random().toString(36).slice(2, 8).toUpperCase(),
        status: 'pending',
        partnerEmail: null,
        url: null,
        notes: null,
      } as any);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Lab Reports</CardTitle>
        <Button variant="outline" onClick={handleAddSample} disabled={adding}>Add Sample</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lab reports yet.</p>
            ) : (
              <ul className="divide-y">
                {reports.map((r) => (
                  <li key={r.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">Sample: {r.sampleId}</div>
                    </div>
                    <div className="text-sm">
                      <span className="px-2 py-1 rounded bg-secondary">{r.status}</span>
                      {r.url ? (
                        <a className="ml-3 text-primary underline" href={r.url} target="_blank" rel="noreferrer">View</a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
