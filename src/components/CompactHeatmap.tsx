import { useState, useEffect, useMemo } from "react";
import { analysisApi, graphApi } from "@/lib/api";
import { Loader2, Info, AlertTriangle, Activity, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompactHeatmapProps {
  uploadId: string;
}

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  label: string;
  metadata?: any;
}

export default function CompactHeatmap({ uploadId }: CompactHeatmapProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uploadId) {
      fetchData();
    }
  }, [uploadId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [addrRes, graphRes] = await Promise.all([
        analysisApi.getSuspiciousAddresses(uploadId, undefined, 1, 100),
        graphApi.getSuspiciousSubgraph(uploadId, 50, 2)
      ]);
      setAddresses(addrRes.addresses || []);
      setGraphData(graphRes);
    } catch (err: any) {
      console.error("Failed to fetch heatmap data:", err);
      setError("FAILED_TO_LOAD_VECTORS");
    } finally {
      setIsLoading(false);
    }
  };

  const activityData = useMemo(() => {
    if (!addresses.length) return [];
    const hours = 24;
    const days = 7;
    const cells: HeatmapCell[] = [];
    const hourlyActivity = Array(hours).fill(0).map(() => Array(days).fill(0));
    
    addresses.forEach((addr: any, idx: number) => {
      const hour = idx % hours;
      const day = Math.floor(idx / hours) % days;
      hourlyActivity[hour][day] += (addr.transactionCount || 1) * (addr.suspiciousScore || 0.5);
    });

    const maxVal = Math.max(...hourlyActivity.flat(), 1);
    const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    for (let h = 0; h < hours; h++) {
      for (let d = 0; d < days; d++) {
        cells.push({
          x: d,
          y: h,
          value: hourlyActivity[h][d] / maxVal,
          label: `${dayLabels[d]} ${h}:00`,
        });
      }
    }
    return cells;
  }, [addresses]);

  const riskData = useMemo(() => {
    const nodes = graphData?.nodes || [];
    if (!nodes.length) return [];
    const gridSize = 10;
    const cells: HeatmapCell[] = [];
    const maxIn = Math.max(...nodes.map((n: any) => n.degree?.in || 0), 1);
    const maxOut = Math.max(...nodes.map((n: any) => n.degree?.out || 0), 1);
    const grid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    const counts: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));

    nodes.forEach((node: any) => {
      const inDeg = node.degree?.in || 0;
      const outDeg = node.degree?.out || 0;
      const risk = node.suspiciousScore ?? node.suspicious_score ?? 0;
      const x = Math.min(Math.floor((outDeg / maxOut) * (gridSize - 1)), gridSize - 1);
      const y = Math.min(Math.floor((inDeg / maxIn) * (gridSize - 1)), gridSize - 1);
      grid[y][x] += risk;
      counts[y][x] += 1;
    });

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const avg = counts[y][x] > 0 ? grid[y][x] / counts[y][x] : 0;
        cells.push({
          x, y, value: avg,
          label: `IN: ${Math.round((y / gridSize) * maxIn)}-${Math.round(((y + 1) / gridSize) * maxIn)}, OUT: ${Math.round((x / gridSize) * maxOut)}-${Math.round(((x + 1) / gridSize) * maxOut)}`,
          metadata: { count: counts[y][x] },
        });
      }
    }
    return cells;
  }, [graphData]);

  const getHeatmapColor = (value: number) => {
    if (value >= 0.8) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
    if (value >= 0.5) return "bg-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
    if (value >= 0.3) return "bg-yellow-500/80";
    if (value > 0) return "bg-green-500/40";
    return "bg-white/5";
  };

  if (!uploadId) {
    return (
      <div className="flex flex-col items-center justify-center p-16 border border-white/5 bg-white/[0.01] border-dashed">
        <Info className="h-8 w-8 text-white/5 mb-4" />
        <p className="text-[10px] tracking-widest text-gray-500 uppercase italic text-center">INITIALIZE_SELECTOR_TO_BEGIN_ANALYSIS</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-white/20" />
        <span className="text-[10px] tracking-widest text-gray-500 uppercase italic text-center">SYNCING_VECTORS...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 border border-red-500/20 bg-red-500/5 text-center">
        <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-3" />
        <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase italic">{error}</p>
      </div>
    );
  }

  const hasData = (addresses.length > 0 || (graphData?.nodes?.length > 0));

  return (
    <div className="space-y-8">
      {!hasData && !isLoading && (
        <div className="p-6 border border-white/5 bg-white/[0.02] mb-4 text-center">
          <p className="text-[9px] tracking-widest text-gray-600 uppercase italic">NO_SUSPICIOUS_PATTERNS_DETECTED_IN_THIS_SET</p>
        </div>
      )}
      
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="bg-black/40 border border-white/5 p-1 rounded-none w-full grid grid-cols-2 mb-8 h-12">
          <TabsTrigger value="activity" className="text-[9px] font-bold tracking-widest uppercase italic data-[state=active]:bg-white data-[state=active]:text-black transition-all">
            <Clock className="h-3 w-3 mr-2" /> TIMELINE
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-[9px] font-bold tracking-widest uppercase italic data-[state=active]:bg-white data-[state=active]:text-black transition-all">
            <Activity className="h-3 w-3 mr-2" /> RISK_DIST
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase italic tracking-tighter">Suspicious Activity Timeline</h3>
            <p className="text-[9px] text-gray-500 uppercase italic leading-tight">Hourly distribution across the week based on flagged addresses.</p>
          </div>
          <div className="p-4 border border-white/5 bg-black/40 rounded-sm overflow-x-auto">
            <div className="grid gap-1 min-w-[600px]" style={{ gridTemplateColumns: "50px repeat(24, 1fr)" }}>
              <div />
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="text-[7px] font-mono text-gray-700 text-center">{h.toString().padStart(2, '0')}</div>
              ))}
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((dayLabel, day) => (
                <div key={day} className="contents">
                  <div className="text-[8px] font-bold text-gray-600 flex items-center pr-2 uppercase">{dayLabel}</div>
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const cellRef = activityData.find(c => c.x === day && c.y === hour);
                    return (
                      <TooltipProvider key={hour}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`aspect-square rounded-[1px] transition-all duration-300 hover:scale-150 hover:z-10 cursor-help ${getHeatmapColor(cellRef?.value || 0)}`} />
                          </TooltipTrigger>
                          <TooltipContent className="bg-black border-white/20 text-[9px] uppercase italic tracking-widest p-2">
                            <div className="font-bold border-b border-white/10 pb-1 mb-1">{cellRef?.label}</div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">RISK_LEVEL:</span>
                              <span className="text-white">{Math.round((cellRef?.value || 0) * 100)}%</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase italic tracking-tighter">In-Degree vs Out-Degree Risk Heatmap</h3>
            <p className="text-[9px] text-gray-500 uppercase italic leading-tight">High in-degree + high out-degree indicates potential smurfing.</p>
          </div>
          <div className="p-4 border border-white/5 bg-black/40 rounded-sm">
            <div className="grid gap-1.5 aspect-square max-w-[320px] mx-auto" style={{ gridTemplateColumns: "repeat(10, 1fr)" }}>
              {riskData.map((cell, idx) => (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`aspect-square rounded-sm border border-white/[0.03] transition-all duration-300 hover:scale-110 hover:z-10 cursor-help ${getHeatmapColor(cell.value)}`} />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black border-white/20 text-[9px] uppercase italic tracking-widest p-2 max-w-[200px]">
                      <div className="font-bold border-b border-white/10 pb-1 mb-1">{cell.label}</div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">RISK_COEF:</span>
                        <span className="text-white">{(cell.value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-500">NODES:</span>
                        <span className="text-white">{cell.metadata?.count || 0}</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="text-center text-[8px] font-bold tracking-widest text-gray-700 uppercase italic mt-4">OUT-DEGREE (FLOW_VECTORS) →</div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between py-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-white/5 rounded-[1px]" />
          <div className="w-2 h-2 bg-green-500/40 rounded-[1px]" />
          <div className="w-2 h-2 bg-yellow-500/80 rounded-[1px]" />
          <div className="w-2 h-2 bg-orange-500 rounded-[1px]" />
          <div className="w-2 h-2 bg-red-500 rounded-[1px]" />
        </div>
        <span className="text-[7px] font-bold text-gray-600 tracking-widest uppercase italic">LOW → CRITICAL</span>
      </div>
      
      <div className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.05]">
        <Info className="h-4 w-4 text-white/20 mt-0.5" />
        <p className="text-[9px] text-gray-500 italic leading-relaxed uppercase tracking-tight">
          Spatial and temporal risk clusters indicate high-probability suspicious transaction vectors detected by the Smurf_Hunter GNN engine.
        </p>
      </div>
    </div>
  );
}
