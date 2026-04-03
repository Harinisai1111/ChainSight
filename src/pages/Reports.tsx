import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, Download, Calendar, Filter, Loader2, AlertTriangle, Shield, Zap, Search, ArrowUpRight } from "lucide-react";
import { reportsApi, uploadApi, type Report } from "@/lib/api";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reportType, setReportType] = useState('compliance');
  const [timePeriod, setTimePeriod] = useState('month');
  const [format, setFormat] = useState('pdf');
  const [selectedUploadId, setSelectedUploadId] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [reportsRes, uploadsRes] = await Promise.all([
          reportsApi.getHistory(undefined, 1, 20).catch(() => ({ reports: [], pagination: {} })),
          uploadApi.getHistory(1, 50, 'completed').catch(() => ({ uploads: [], pagination: {} })),
        ]);
        setReports(reportsRes.reports || []);
        setUploads(uploadsRes.uploads || []);
        if (uploadsRes.uploads?.length > 0) setSelectedUploadId(uploadsRes.uploads[0].id);
      } catch (err: any) {
        console.error('Failed to fetch reports:', err);
        setError(err.message || 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedUploadId) { setError('Please select an upload first'); return; }
    setIsGenerating(true);
    setError(null);
    try {
      // Map frontend values to backend schema
      const typeMap: Record<string, string> = {
        'analysis': 'summary',
        'sar': 'investigation',
        'risk': 'compliance',
        'compliance': 'compliance'
      };

      const formatMap: Record<string, string> = {
        'pdf': 'pdf',
        'xlsx': 'excel',
        'json': 'json'
      };

      const newReport = await reportsApi.generate({
        uploadId: selectedUploadId,
        type: typeMap[reportType] || 'summary',
        format: formatMap[format] || 'pdf',
        time_period: timePeriod, // preserved as extra metadata
      });
      setReports([newReport, ...reports]);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (reportId: string, filename: string) => {
    try {
      const blob = await reportsApi.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download report');
    }
  };

  const filterReportsByType = (type?: string) => {
    if (!type || type === 'all') return reports;
    // Map the filter tab back to backend types for matching
    const typeLabelMap: Record<string, string> = {
      'compliance': 'compliance',
      'sar': 'investigation',
      'analysis': 'summary'
    };
    const targetType = typeLabelMap[type.toLowerCase()] || type.toLowerCase();
    return reports.filter(r => (r.report_type || (r as any).type || '').toLowerCase() === targetType);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 animate-on-scroll show">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Compliance Archive</h2>
            <p className="text-gray-500 text-[11px] font-medium uppercase tracking-[0.2em]">Archival-grade documentation and audit protocols.</p>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-full border border-white/5">
             <div className="w-2 h-2 rounded-full gradient-green glow-green"></div>
             <span className="text-[11px] font-bold tracking-widest uppercase">Vault Secure</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500/50 hover:text-red-500 text-[10px] font-bold">Dismiss</button>
          </div>
        )}

        {/* Report Generator (Bento Large) */}
        <div className="glass-card p-10 space-y-10 group relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-grid-3d scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-xl font-bold tracking-tight">Custom Document Generation</h3>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:gradient-green group-hover:text-black transition-all">
               <Zap className="h-5 w-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Source Vector</label>
              <select 
                value={selectedUploadId} 
                onChange={(e) => setSelectedUploadId(e.target.value)}
                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white tracking-widest uppercase focus:outline-none focus:bg-white/10 transition-all cursor-pointer"
              >
                <option value="" disabled>Select Upload</option>
                {uploads.map((upload) => (
                  <option key={upload.id} value={upload.id} className="bg-black text-white">{upload.name || upload.filename}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Report Protocol</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white tracking-widest uppercase focus:outline-none focus:bg-white/10 transition-all cursor-pointer"
              >
                <option value="compliance">Compliance STD</option>
                <option value="sar">Suspicious ACT REP</option>
                <option value="analysis">Vector Analysis</option>
                <option value="risk">Risk Assessment</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Temporal Window</label>
              <select 
                value={timePeriod} 
                onChange={(e) => setTimePeriod(e.target.value)}
                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white tracking-widest uppercase focus:outline-none focus:bg-white/10 transition-all cursor-pointer"
              >
                <option value="today">Today (T-Alpha)</option>
                <option value="week">7D Window</option>
                <option value="month">30D Window</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Output Encoding</label>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white tracking-widest uppercase focus:outline-none focus:bg-white/10 transition-all cursor-pointer"
              >
                <option value="pdf">PDF Archive</option>
                <option value="xlsx">Excel Dataset</option>
                <option value="json">JSON Object</option>
              </select>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2">
               <Calendar className="h-4 w-4 text-gray-500" />
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Protocol validation active</span>
            </div>
            <button 
              onClick={handleGenerateReport}
              disabled={isGenerating || !selectedUploadId}
              className={`px-12 py-4 rounded-full font-bold text-[11px] tracking-[0.2em] uppercase transition-all shadow-2xl ${
                isGenerating || !selectedUploadId 
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:scale-105'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Execute Generation'}
            </button>
          </div>
        </div>

        {/* Historical Archive */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h3 className="text-xl font-bold tracking-tight">Historical Archive</h3>
            <div className="bg-white/5 p-1 rounded-full flex space-x-1">
              {['ALL', 'COMPLIANCE', 'SAR'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-6 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab.toLowerCase() ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
                <span className="text-[10px] tracking-widest uppercase font-bold animate-pulse">Syncing Archive...</span>
              </div>
            ) : filterReportsByType(activeTab).length === 0 ? (
              <div className="py-20 text-center glass-card border-dashed">
                <span className="text-[10px] text-gray-600 tracking-widest uppercase font-bold">No historical documents found</span>
              </div>
            ) : (
              filterReportsByType(activeTab).map((report) => (
                <div key={report.id} className="glass-card p-8 flex items-center justify-between group hover:border-white/20 transition-all duration-500 animate-on-scroll show">
                  <div className="flex items-center space-x-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:gradient-green group-hover:text-black transition-all">
                       <FileText className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-lg font-bold tracking-tight uppercase">{(report.report_type || (report as any).type || '').replace('_', ' ')} RECOVERY</h4>
                       <div className="flex items-center space-x-6 text-[9px] font-bold tracking-widest uppercase text-gray-500">
                          <span className="flex items-center"><Calendar className="h-3 w-3 mr-2" /> {new Date(report.createdAt || (report as any).created_at).toLocaleDateString()}</span>
                          <span className="text-white/40">{report.format.toUpperCase()}</span>
                          <span className="text-white/20">UUID: {report.id.slice(0, 8)}</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      report.status === 'completed' ? 'gradient-green text-black glow-green' : 'bg-white/5 text-gray-500'
                    }`}>
                      {report.status === 'completed' ? 'Ready' : report.status.toUpperCase()}
                    </div>
                    {report.status === 'completed' && (
                      <button 
                        onClick={() => handleDownloadReport(report.id, `${report.report_type || (report as any).type}_report.${report.format}`)}
                        className="p-4 bg-white/5 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all shadow-xl"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
