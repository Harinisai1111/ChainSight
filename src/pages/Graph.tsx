import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Upload as UploadIcon, RefreshCw, Loader2, AlertTriangle, Download } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import UltraGraphVisualization from "@/components/UltraGraphVisualization";
import { graphApi, uploadApi, type GraphData } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { toast } from "@/components/ToastNotification";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CompactHeatmap from "@/components/CompactHeatmap";
import { Grid3X3 } from "lucide-react";

export default function Graph() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uploadIdParam = searchParams.get('uploadId');
  
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDemo, setUseDemo] = useState(true); // Default to demo mode
  
  // Graph parameters
  const [selectedUploadId, setSelectedUploadId] = useState<string>(uploadIdParam || '');
  const [topK, setTopK] = useState(20);
  const [hop, setHop] = useState(2);
  const [uploads, setUploads] = useState<any[]>([]);
  
  // Track if we've fetched uploads already
  const hasFetchedUploads = useRef(false);

  // Fetch available uploads on mount (only once)
  useEffect(() => {
    if (hasFetchedUploads.current) return;
    hasFetchedUploads.current = true;
    
    const fetchUploads = async () => {
      try {
        const response = await uploadApi.getHistory(1, 50, 'completed');
        setUploads(response.uploads || []);
        
        // Auto-select first upload if one is specified in URL or if none selected
        if (uploadIdParam && response.uploads?.some((u: any) => u.id === uploadIdParam)) {
          setSelectedUploadId(uploadIdParam);
        } else if (response.uploads?.length > 0 && !selectedUploadId) {
          setSelectedUploadId(response.uploads[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch uploads:', err);
        // Stay in demo mode
      }
    };
    fetchUploads();
  }, [uploadIdParam]);

  // Fetch graph data - only when explicitly triggered by button click
  const fetchGraphData = useCallback(async () => {
    if (!selectedUploadId) {
      setError('Please select an upload first');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await graphApi.getSuspiciousSubgraph(selectedUploadId, topK, hop);
      setGraphData(data);
      setUseDemo(false);
    } catch (err: any) {
      console.error('Failed to fetch graph:', err);
      setError(err.message || 'Failed to load graph data');
      // Keep existing data or demo mode
    } finally {
      setIsLoading(false);
    }
  }, [selectedUploadId, topK, hop]);

  // Handle local file upload (fallback)
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Validate basic structure
      if (!jsonData.nodes || !jsonData.edges) {
        throw new Error('Invalid graph data format');
      }
      
      setGraphData(jsonData);
      setUseDemo(false);
      toast.success(`Successfully loaded ${jsonData.nodes.length} nodes and ${jsonData.edges.length} edges`);
    } catch (error) {
      console.error('Error parsing file:', error);
      setError('Invalid JSON file. Please upload a valid graph data file.');
      toast.error('Invalid JSON file. Please upload valid graph data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-12 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-on-scroll">
          <div>
            <h2 className="text-4xl font-bold text-white uppercase italic tracking-tighter leading-none mb-4">
              GRAPH <span className="text-white/20">VISUALIZER</span>
            </h2>
            <p className="text-gray-500 font-light tracking-[0.2em] uppercase text-[10px]">
              Multi-hop transaction topology. Neural mapping active.
            </p>
          </div>
          <div className="flex space-x-4">
            <label htmlFor="file-upload">
              <Button 
                variant="outline"
                className="rounded-none border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-500 px-8 py-6 text-[10px] font-bold tracking-widest uppercase italic"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading}
              >
                <UploadIcon className="h-4 w-4 mr-3 text-white/40" />
                IMPORT_JSON
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            {graphData && !useDemo && (
              <Button 
                variant="outline"
                onClick={() => {
                  setGraphData(null);
                  setUseDemo(true);
                }}
                className="rounded-none border-white/5 bg-transparent text-white/40 hover:text-white hover:border-white/20 transition-all duration-500 px-8 py-6 text-[10px] font-bold tracking-widest uppercase italic"
              >
                <RefreshCw className="h-4 w-4 mr-3 opacity-40" />
                RESET_CORE
              </Button>
            )}

            {/* Compact Heatmap Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline"
                  className="rounded-none border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-500 px-8 py-6 text-[10px] font-bold tracking-widest uppercase italic"
                >
                  <Grid3X3 className="h-4 w-4 mr-3 text-white/40" />
                  HEAT_MAP
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[800px] sm:max-w-[800px] bg-black/95 border-l border-white/10 p-8 overflow-y-auto">
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-white uppercase italic tracking-widest text-lg">NEURAL_FREQUENCY_ANALYSIS</SheetTitle>
                </SheetHeader>
                <CompactHeatmap uploadId={selectedUploadId} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Data Source Controls */}
        <div className="glass-card p-10 border-white/5 animate-on-scroll mb-12">
          <div className="flex flex-wrap items-end gap-10">
            <div className="flex-1 min-w-[280px]">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase italic mb-4 block">
                TARGET_DATA_SET:
              </label>
              <Select value={selectedUploadId} onValueChange={setSelectedUploadId}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-none h-14 tracking-widest text-xs font-mono uppercase italic px-6 focus:ring-0 focus:ring-offset-0 hover:border-white/30 transition-all duration-500">
                  <SelectValue placeholder="INITIALIZE SELECTOR..." />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 rounded-none text-white tracking-widest text-[10px]">
                  {uploads.map((upload) => (
                    <SelectItem key={upload.id} value={upload.id} className="focus:bg-white focus:text-black rounded-none cursor-pointer">
                      {upload.name || upload.filename} // {new Date(upload.date || upload.uploadedAt || '').toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-[160px]">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase italic mb-4 block">
                NODE_K_LIMIT:
              </label>
              <Select value={topK.toString()} onValueChange={(v) => setTopK(parseInt(v))}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-none h-14 tracking-widest text-xs font-mono uppercase italic px-6 focus:ring-0 focus:ring-offset-0 hover:border-white/30 transition-all duration-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 rounded-none text-white tracking-widest text-[10px]">
                  <SelectItem value="10" className="focus:bg-white focus:text-black rounded-none cursor-pointer">10_NODES</SelectItem>
                  <SelectItem value="20" className="focus:bg-white focus:text-black rounded-none cursor-pointer">20_NODES</SelectItem>
                  <SelectItem value="50" className="focus:bg-white focus:text-black rounded-none cursor-pointer">50_NODES</SelectItem>
                  <SelectItem value="100" className="focus:bg-white focus:text-black rounded-none cursor-pointer">100_NODES</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-[160px]">
              <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase italic mb-4 block">
                HOP_PROPAGATION:
              </label>
              <Select value={hop.toString()} onValueChange={(v) => setHop(parseInt(v))}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-none h-14 tracking-widest text-xs font-mono uppercase italic px-6 focus:ring-0 focus:ring-offset-0 hover:border-white/30 transition-all duration-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 rounded-none text-white tracking-widest text-[10px]">
                  <SelectItem value="1" className="focus:bg-white focus:text-black rounded-none cursor-pointer">01_HOP</SelectItem>
                  <SelectItem value="2" className="focus:bg-white focus:text-black rounded-none cursor-pointer">02_HOPS</SelectItem>
                  <SelectItem value="3" className="focus:bg-white focus:text-black rounded-none cursor-pointer">03_HOPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="bg-white text-black hover:bg-gray-200 rounded-none h-14 px-12 text-[10px] tracking-[0.3em] font-bold transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.05)] uppercase italic"
              onClick={fetchGraphData}
              disabled={isLoading || !selectedUploadId}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-3" />
              )}
              SYNC_TOPOLOGY
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-10 border border-red-500/20 bg-red-500/5 animate-on-scroll">
            <div className="flex items-center space-x-6">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-xs font-bold tracking-widest text-red-500 uppercase italic mb-1">{error}</p>
                <p className="text-[10px] tracking-widest text-red-500/60 uppercase italic opacity-60">FALLBACK: DEMO_TOPOLOGY_ACTIVE.</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-32 border border-white/5 bg-white/[0.02]">
            <Loader2 className="h-10 w-10 animate-spin text-white/20 mb-6" />
            <span className="text-[10px] tracking-extra-widest text-gray-500 uppercase italic animate-pulse">RECONSTRUCTING NEURAL GRAPH...</span>
          </div>
        )}

        {/* Demo Mode Info */}
        {useDemo && !isLoading && (
          <div className="p-10 border border-white/5 bg-white/[0.02] animate-on-scroll">
            <div className="flex items-start space-x-8">
              <div className="p-4 border border-white/10 bg-white/5">
                <Network className="h-6 w-6 text-white/40" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white uppercase italic tracking-tighter mb-2">DEMO_MODE_ACTIVE</h3>
                <p className="text-[10px] tracking-widest text-gray-500 uppercase italic leading-loose max-w-2xl">
                  {uploads.length === 0 
                    ? "RECORDS_NOT_FOUND. INITIALIZE DATA INGESTION PROTOCOLS TO ANALYZE REAL-TIME TRANSACTION VECTORS."
                    : "SELECT TARGET_DATA_SET ABOVE TO SYNC LIVE TOPOLOGY OR REMAIN IN DEMO_SANDBOX."
                  }
                </p>
                {uploads.length === 0 && (
                  <Button 
                    className="mt-8 bg-white text-black hover:bg-gray-200 rounded-none px-10 py-6 text-[10px] tracking-[0.2em] font-bold transition-all duration-500 uppercase italic"
                    onClick={() => navigate('/cryptoflow/upload')}
                  >
                    INITIALIZE_UPLOAD
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Graph Visualization */}
        {!isLoading && (
          <ErrorBoundary>
            {graphData && graphData.nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 glass-card border-dashed">
                <Network className="h-16 w-16 text-white/5 mb-6" />
                <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter mb-2">NO_SUSPICIOUS_VECTORS_FOUND</h3>
                <p className="text-[10px] tracking-widest text-gray-500 uppercase italic max-w-md text-center">
                  The ML model did not detect any high-risk nodes within the specified parameters. 
                  Try increasing the NODE_K_LIMIT or HOP_PROPAGATION.
                </p>
              </div>
            ) : (
              <UltraGraphVisualization data={graphData || undefined} />
            )}
          </ErrorBoundary>
        )}
      </div>
    </DashboardLayout>
  );
}

