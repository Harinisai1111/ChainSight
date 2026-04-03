import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Upload as UploadIcon, FileText, AlertCircle, CheckCircle2, X, Table, AlertTriangle, Loader2, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { uploadApi, type Upload as UploadType } from "@/lib/api";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadType | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const expectedColumns = [
    { name: "Source_Wallet_ID", required: true },
    { name: "Dest_Wallet_ID", required: true },
    { name: "Timestamp", required: true },
    { name: "Amount", required: true },
    { name: "Token_Type", required: false }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadComplete(false);
      setUploadResult(null);
      setUploadError(null);
      parseFilePreview(file);
    }
  };

  const parseFilePreview = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        const preview = lines.slice(1, 11).map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx]?.trim() || '';
          });
          return row;
        });
        
        setPreviewData(preview);
        validateColumns(headers);
      }
    };
    reader.readAsText(file);
  };

  const validateColumns = (headers: string[]) => {
    const errors: string[] = [];
    const mapping: any = {};
    const normalize = (str: string) => str.toLowerCase().replace(/[_\s-]/g, '');
    
    expectedColumns.forEach(expected => {
      const normalizedExpected = normalize(expected.name);
      const match = headers.find(h => {
        const normalizedHeader = normalize(h);
        return normalizedHeader === normalizedExpected || 
               normalizedHeader.includes(normalizedExpected) ||
               normalizedExpected.includes(normalizedHeader);
      });
      
      if (match) {
        mapping[expected.name] = match;
      } else if (expected.required) {
        errors.push(`Missing required column: ${expected.name}`);
      }
    });
    
    setColumnMapping(mapping);
    setValidationErrors(errors);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);
    setUploadError(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 10));
    }, 300);

    try {
      const result = await uploadApi.uploadFile(selectedFile);
      clearInterval(progressInterval);
      setProgress(100);
      setUploadResult(result);
      setUploadComplete(true);
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setProgress(0);
    setUploadComplete(false);
    setUploadResult(null);
    setUploadError(null);
    setPreviewData([]);
    setColumnMapping(null);
    setValidationErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 animate-on-scroll show">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Ingest Protocol</h2>
            <p className="text-gray-500 text-[11px] font-medium uppercase tracking-[0.2em]">Secure monolithic data transfer system initialized.</p>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-full border border-white/5">
             <div className="w-2 h-2 rounded-full gradient-green glow-green"></div>
             <span className="text-[11px] font-bold tracking-widest uppercase">Encryption: AES-256</span>
          </div>
        </div>

        {/* Bento Layout for Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Upload Area (Large) */}
          <div className="lg:col-span-2 glass-card p-10 flex flex-col min-h-[400px]">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em]">Source File</h3>
              <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center space-x-1">
                <span>Requirements</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            {!selectedFile ? (
              <div
                className="flex-1 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center space-y-6 hover:border-white/40 hover:bg-white/[0.02] cursor-pointer transition-all duration-500 py-20"
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) { setSelectedFile(file); parseFilePreview(file); }
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-bold tracking-tight">Drop files or click to browse</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Supported formats: CSV, JSON, XLSX</p>
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.json,.xlsx,.xls" onChange={handleFileSelect} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-6">
                <div className="bg-white/5 rounded-[2rem] p-8 flex items-center justify-between border border-white/5">
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold tracking-tight">{selectedFile.name}</p>
                      <p className="text-[10px] tracking-widest text-gray-500 uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB // BINARY_METADATA</p>
                    </div>
                  </div>
                  {!uploading && !uploadComplete && (
                    <button onClick={handleRemoveFile} className="p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  {uploadComplete && (
                    <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center text-black">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="space-y-4 px-4 py-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest px-2">
                      <span className="text-gray-400 animate-pulse">Transmitting vectors...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full gradient-green transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 flex items-center space-x-4">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <p className="text-sm font-bold text-red-500 uppercase tracking-widest">Protocol Failure: {uploadError}</p>
                  </div>
                )}

                {!uploading && !uploadComplete && validationErrors.length === 0 && (
                  <button
                    className="w-full py-6 rounded-full bg-white text-black font-bold tracking-[0.2em] uppercase text-sm hover:scale-[1.02] transition-all shadow-xl"
                    onClick={handleUpload}
                  >
                    Execute Synchronisation
                  </button>
                )}

                {uploadComplete && (
                  <button
                    className="w-full py-6 rounded-full gradient-green text-black font-bold tracking-[0.2em] uppercase text-sm hover:scale-[1.02] transition-all shadow-xl"
                    onClick={() => navigate(`/cryptoflow/analysis${uploadResult?.id ? `?uploadId=${uploadResult.id}` : ''}`)}
                  >
                    Open Analysis Hub
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Operational Specs (Smaller) */}
          <div className="glass-card p-10 space-y-10">
            <div className="space-y-1">
               <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em]">Validation Matrix</h3>
               <p className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">Automatic vector mapping protocol.</p>
            </div>

            <div className="space-y-4">
              {expectedColumns.map((col, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[11px] font-bold tracking-wider text-gray-300">{col.name}</span>
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${col.required ? 'bg-orange-500/10 text-orange-400' : 'bg-white/5 text-gray-500'}`}>
                    {col.required ? 'Required' : 'Optional'}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-white/5 rounded-[2rem] p-6 space-y-4 border border-white/5">
               <div className="flex items-center space-x-2">
                 <AlertTriangle className="h-4 w-4 text-orange-500" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Strict Schema Only</span>
               </div>
               <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest">Mismatch in core vectors will trigger a system rejection. Ensure Source_Wallet_ID and Dest_Wallet_ID are present.</p>
            </div>
          </div>
        </div>

        {/* Validation Errors & Preview Section */}
        {previewData.length > 0 && !uploading && !uploadComplete && (
          <div className="grid grid-cols-1 gap-8">
            {validationErrors.length > 0 && (
              <div className="glass-card p-10 border-red-500/20 bg-red-500/[0.02]">
                <div className="flex items-center space-x-4 mb-6">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <h3 className="text-xl font-bold tracking-tight text-red-500">Validation Conflict</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {validationErrors.map((error, idx) => (
                    <div key={idx} className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card p-10 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight">Vector Preview</h3>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Top 10 entries detected</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] font-bold uppercase tracking-widest">
                  <thead>
                    <tr className="text-gray-500 border-b border-white/5">
                      {Object.keys(previewData[0]).map((h, i) => (
                        <th key={i} className="text-left py-4 px-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        {Object.values(row).map((v: any, j) => (
                          <td key={j} className="py-4 px-4 text-gray-400">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
