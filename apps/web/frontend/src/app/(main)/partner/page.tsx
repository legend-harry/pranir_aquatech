"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { usePartnerPortal, ParameterRange } from "@/modules/partner/usePartnerPortal";
import { usePartnerReports } from "@/modules/partner/usePartnerReports";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

function RangePill({ range }: { range: ParameterRange }) {
  const optimal = range.optimal || `${range.min ?? ""}-${range.max ?? ""}`;
  const color = (() => {
    if (range.min !== undefined && range.max !== undefined) return "bg-green-100 text-slate-800";
    return "bg-yellow-100 text-slate-800";
  })();
  return (
    <span className={cn("px-2 py-1 rounded text-xs font-medium", color)}>
      {optimal} {range.unit || ""}
    </span>
  );
}

export default function PartnerPortalPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadFile, savePartnerProfile, addLabTestTemplate, addReportUpload, addSampleIntake, suggestRanges, uploading, getFileData } = usePartnerPortal();
  const { reports, loading, approveReport, rejectReport } = usePartnerReports();

  const [companyName, setCompanyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [sampleReportFile, setSampleReportFile] = useState<File | null>(null);
  const [customerMobile, setCustomerMobile] = useState("");
  const [testName, setTestName] = useState("Water");
  const [sampleName, setSampleName] = useState("");
  const [parameters, setParameters] = useState<ParameterRange[]>([]);
  const [reportNotes, setReportNotes] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadReport = async (report: typeof reports[0]) => {
    if (!report.reportUrl || !user?.uid) {
      toast({ variant: "destructive", title: "Error", description: "No report file available" });
      return;
    }

    try {
      setDownloadingId(report.id);
      // Get the file data from database using the reportUrl (which is the database key)
      const fileData = await getFileData(user.uid, 'partner/reports', report.reportUrl);
      
      if (!fileData || !fileData.data) {
        toast({ variant: "destructive", title: "Error", description: "Could not retrieve report file" });
        return;
      }

      // Create a link and download
      const link = document.createElement('a');
      link.href = fileData.data; // This is already a data URL (base64)
      link.download = fileData.name || 'report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: "Success", description: "Report downloaded" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to download report" });
    } finally {
      setDownloadingId(null);
    }
  };

  const addParameter = () => {
    setParameters((prev) => [...prev, { name: "", unit: "", min: undefined, max: undefined, optimal: "" }]);
  };

  const updateParam = (idx: number, field: keyof ParameterRange, value: any) => {
    setParameters((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handleSaveBranding = async () => {
    try {
      const uploads: { logoUrl?: string; stampUrl?: string } = {};
      if (logoFile) uploads.logoUrl = await uploadFile(logoFile, 'partner/logo');
      if (stampFile) uploads.stampUrl = await uploadFile(stampFile, 'partner/stamp');
      await savePartnerProfile({ companyName, ...uploads });
      toast({ title: "Branding saved" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to save branding" });
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await addLabTestTemplate({ name: testName, description: reportNotes, parameters });
      toast({ title: "Template saved" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to save template" });
    }
  };

  const handleUploadReport = async () => {
    if (!sampleReportFile) {
      toast({ variant: "destructive", title: "Select a report file" });
      return;
    }
    if (!customerMobile) {
      toast({ variant: "destructive", title: "Enter customer mobile" });
      return;
    }
    try {
      const url = await uploadFile(sampleReportFile, 'partner/reports');
      await addReportUpload({ customerMobile, reportUrl: url, sampleName: testName, parameters, status: 'pending' });
      toast({ title: "Report uploaded", description: "Review and approve before customer can see it" });
      // Clear form
      setSampleReportFile(null);
      setCustomerMobile("");
      setSampleName("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to upload report" });
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      await approveReport(reportId);
      toast({ title: "Report approved", description: "Customer can now view this report" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to approve report" });
    }
  };

  const handleReject = async (reportId: string) => {
    try {
      await rejectReport(reportId, rejectionReason || "Report rejected by partner");
      toast({ title: "Report rejected", description: "This report will not be sent to customer" });
      setRejectingId(null);
      setRejectionReason("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to reject report" });
    }
  };

  const handleAddSample = async () => {
    if (!customerMobile || !sampleName) {
      toast({ variant: "destructive", title: "Missing info", description: "Enter sample name and customer mobile." });
      return;
    }
    try {
      await addSampleIntake({ customerMobile, sampleName, notes: reportNotes });
      toast({ title: "Sample logged", description: "Sample recorded; upload report when ready." });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to add sample" });
    }
  };

  const handleSuggest = () => {
    const suggested = suggestRanges(testName.toLowerCase());
    setParameters(suggested);
    if (suggested.length === 0) toast({ description: "No preset found; add parameters manually." });
  };

  const whatsappHelp = () => {
    toast({
      title: "WhatsApp sending",
      description: "Use WhatsApp Cloud API or Twilio WhatsApp to send the PDF via a backend call.",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Partner Portal" description="Upload reports, manage branding, and design test parameters." />

      {/* Reports Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Reports Management</CardTitle>
          <CardDescription>Review and approve reports before sending to customers</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-muted-foreground">No reports yet. Upload a report below to get started.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{report.sampleName || "Lab Report"}</h4>
                      <p className="text-sm text-muted-foreground">Customer: {report.customerMobile}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.status === 'pending' && (
                        <>
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-600">Pending Review</span>
                        </>
                      )}
                      {report.status === 'approved' && (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Approved</span>
                        </>
                      )}
                      {report.status === 'rejected' && (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium text-red-600">Rejected</span>
                        </>
                      )}
                      {report.status === 'sample' && (
                        <>
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Sample Only</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Report Details Preview */}
                  {previewId === report.id && (
                    <div className="bg-slate-50 p-3 rounded space-y-2">
                      {report.reportUrl && (
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1">Report File:</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReport(report)}
                            disabled={downloadingId === report.id}
                          >
                            {downloadingId === report.id ? "Downloading..." : "📄 Download Report"}
                          </Button>
                        </div>
                      )}
                      {report.parameters && report.parameters.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-600 mb-1">Parameters:</p>
                          <div className="flex flex-wrap gap-1">
                            {report.parameters.map((p, idx) => (
                              <span key={idx} className="text-xs bg-white border rounded px-2 py-1">
                                {p.name} ({p.min}-{p.max} {p.unit})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {report.partnerEmail && (
                        <div>
                          <p className="text-xs font-medium text-slate-600">Partner Email: {report.partnerEmail}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => setPreviewId(previewId === report.id ? null : report.id)}>
                      {previewId === report.id ? "Hide Details" : "Show Details"}
                    </Button>

                    {report.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleApprove(report.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve & Send
                        </Button>
                        {rejectingId === report.id ? (
                          <>
                            <Input
                              size={1}
                              placeholder="Rejection reason (optional)"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="h-8 text-xs"
                            />
                            <Button size="sm" variant="destructive" onClick={() => handleReject(report.id)}>
                              Confirm
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setRejectingId(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setRejectingId(report.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                      </>
                    )}

                    {report.status === 'rejected' && report.rejectionReason && (
                      <p className="text-xs text-red-600 flex-1">Reason: {report.rejectionReason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Company name, logo, and stamp/signature.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Labs" />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </div>
          <div className="space-y-2">
            <Label>Stamp / Signature</Label>
            <Input type="file" accept="image/*" onChange={(e) => setStampFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSaveBranding} disabled={uploading}>{uploading ? "Saving..." : "Save Branding"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer & Report Upload</CardTitle>
          <CardDescription>Select customer by mobile and upload PDF.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Customer mobile (registered)</Label>
            <Input value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} placeholder="10-digit number" />
          </div>
          <div className="space-y-2">
            <Label>Sample name / ID</Label>
            <Input value={sampleName} onChange={(e) => setSampleName(e.target.value)} placeholder="e.g., Pond A - Water" />
          </div>
          <div className="space-y-2">
            <Label>Report PDF</Label>
            <Input type="file" accept="application/pdf" onChange={(e) => setSampleReportFile(e.target.files?.[0] || null)} />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} placeholder="Notes visible to customer" />
          </div>
          <div className="flex items-end gap-2 flex-wrap">
            <Button onClick={handleUploadReport} disabled={uploading}>{uploading ? "Uploading..." : "Upload & Notify"}</Button>
            <Button variant="outline" onClick={handleAddSample} disabled={uploading}>Save Sample (no PDF yet)</Button>
            <Button variant="outline" onClick={whatsappHelp}>Send via WhatsApp (how-to)</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Designer</CardTitle>
          <CardDescription>Add parameters, ranges, and colors. AI presets available.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Test name</Label>
              <Input value={testName} onChange={(e) => setTestName(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleSuggest}>AI presets</Button>
            </div>
            <div className="flex items-end justify-end">
              <Button onClick={handleSaveTemplate}>Save Template</Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            {parameters.map((p, idx) => (
              <div key={idx} className="grid gap-2 md:grid-cols-5 items-end">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={p.name} onChange={(e) => updateParam(idx, 'name', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Unit</Label>
                  <Input value={p.unit || ''} onChange={(e) => updateParam(idx, 'unit', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Min</Label>
                  <Input type="number" value={p.min ?? ''} onChange={(e) => updateParam(idx, 'min', e.target.value === '' ? undefined : Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label>Max</Label>
                  <Input type="number" value={p.max ?? ''} onChange={(e) => updateParam(idx, 'max', e.target.value === '' ? undefined : Number(e.target.value))} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1 w-full">
                    <Label>Optimal</Label>
                    <Input value={p.optimal || ''} onChange={(e) => updateParam(idx, 'optimal', e.target.value)} />
                  </div>
                  <RangePill range={p} />
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addParameter}>Add Parameter</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
