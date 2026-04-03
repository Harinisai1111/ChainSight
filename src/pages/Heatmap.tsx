import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Grid3X3, RefreshCw, Loader2, TrendingUp, AlertTriangle,
  Activity, Clock, Zap, Info
} from "lucide-react";
import { analysisApi, uploadApi, graphApi } from "@/lib/api";

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
  label?: string;
  metadata?: any;
}

export default function Heatmap() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploads, setUploads] = useState<any[]>([]);
  const [selectedUploadId, setSelectedUploadId] = useState<string>("");
  const [patterns, setPatterns] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("risk");
  const [colorIntensity, setColorIntensity] = useState([70]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await uploadApi.getHistory(1, 50);
        const list = response.uploads || [];
        setUploads(list);
        if (list.length > 0) setSelectedUploadId(list[0].id);
      } catch (err) {
        console.error("Failed to fetch uploads:", err);
      }
    };
    fetchUploads();
  }, []);

  useEffect(() => {
    if (selectedUploadId) fetchAnalysisData();
  }, [selectedUploadId]);

  const fetchAnalysisData = async () => {
    if (!selectedUploadId) return;
    setIsLoading(true);
    try {
      const [patternsRes, addressesRes, graphRes] = await Promise.all([
        analysisApi.getPatterns(selectedUploadId).catch(() => []),
        analysisApi.getSuspiciousAddresses(selectedUploadId, undefined, 1, 100).catch(() => ({ addresses: [] })),
        graphApi.getSuspiciousSubgraph(selectedUploadId, 50, 2).catch(() => null),
      ]);
      setPatterns(Array.isArray(patternsRes) ? patternsRes : (patternsRes as any)?.patterns || []);
      setAddresses((addressesRes as any)?.addresses || []);
      setGraphData(graphRes);
      // toast removed for cleaner institutional UI
    } catch (err) {
      console.error("Failed to fetch analysis:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getUploadLabel = (upload: any): string => {
    const name = upload.filename || upload.name || upload.id;
    const raw = upload.uploadedAt || upload.date || upload.uploaded_at || upload.created_at || "";
    let dateStr = "";
    try { dateStr = raw ? new Date(raw).toLocaleDateString() : ""; } catch { dateStr = raw; }
    return dateStr ? `${name} — ${dateStr}` : name;
  };

  const riskHeatmapData = useMemo(() => {
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
          label: `In: ${Math.round((y / gridSize) * maxIn)}-${Math.round(((y + 1) / gridSize) * maxIn)}, Out: ${Math.round((x / gridSize) * maxOut)}-${Math.round(((x + 1) / gridSize) * maxOut)}`,
          metadata: { count: counts[y][x] },
        });
      }
    }
    return cells;
  }, [graphData]);

  const patternHeatmapData = useMemo(() => {
    const patternTypes = ["Structuring", "Layering", "Smurfing", "Chain/Intermediary"];
    const severities = ["critical", "high", "medium", "low"];
    const cells: HeatmapCell[] = [];
    patternTypes.forEach((type, y) => {
      severities.forEach((severity, x) => {
        const matching = patterns.filter((p: any) => p.type === type && p.severity === severity);
        const count = matching.length;
        const avgConf = count > 0 ? matching.reduce((sum: number, p: any) => sum + (p.confidence || 0), 0) / count : 0;
        cells.push({ x, y, value: count > 0 ? avgConf : 0, label: `${type} - ${severity}`, metadata: { count, avgConfidence: avgConf } });
      });
    });
    return cells;
  }, [patterns]);

  const activityHeatmapData = useMemo(() => {
    if (!addresses.length) return [];
    const hours = 24;
    const days = 7;
    const cells: HeatmapCell[] = [];
    const hourlyActivity = Array(hours).fill(0).map(() => Array(days).fill(0));
    addresses.forEach((addr: any, idx: number) => {
      const txCount = addr.transactionCount || 1;
      const hour = idx % hours;
      const day = Math.floor(idx / hours) % days;
      hourlyActivity[hour][day] += txCount * (addr.suspiciousScore || 0.5);
    });
    const maxVal = Math.max(...hourlyActivity.flat(), 1);
    for (let h = 0; h < hours; h++) {
      for (let d = 0; d < days; d++) {
        cells.push({
          x: d, y: h, value: hourlyActivity[h][d] / maxVal,
          label: `${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d]} ${h}:00`,
          metadata: { rawValue: hourlyActivity[h][d] },
        });
      }
    }
    return cells;
  }, [addresses]);

  const getHeatmapColor = (value: number, intensity: number = 70) => {
    const v = Math.pow(value, 1 / (intensity / 50));
    if (v >= 0.8) return `rgba(239, 68, 68, ${0.3 + v * 0.7})`;
    if (v >= 0.5) return `rgba(245, 158, 11, ${0.3 + v * 0.7})`;
    if (v >= 0.3) return `rgba(234, 179, 8, ${0.3 + v * 0.6})`;
    if (v > 0) return `rgba(34, 197, 94, ${0.2 + v * 0.5})`;
    return "rgba(100, 116, 139, 0.1)";
  };

  const stats = useMemo(() => ({
    highRisk: addresses.filter((a: any) => (a.suspiciousScore ?? 0) >= 0.65).length,
    mediumRisk: addresses.filter((a: any) => (a.suspiciousScore ?? 0) >= 0.35 && (a.suspiciousScore ?? 0) < 0.65).length,
    criticalPatterns: patterns.filter((p: any) => p.severity === "critical").length,
    totalNodes: graphData?.nodes?.length || 0,
  }), [addresses, patterns, graphData]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const severityLabels = ["Critical", "High", "Medium", "Low"];
  const patternLabels = ["Structuring", "Layering", "Smurfing", "Chain"];
  return (
    <DashboardLayout>
      <div className="space-y-12 relative">
        {/* Header */}
        <div className="flex items-center justify-between animate-on-scroll">
          <div>
            <h2 className="text-4xl font-bold text-white uppercase italic tracking-tighter leading-none mb-4">
              HEATMAP <span className="text-white/20">DISTRIBUTION</span>
            </h2>
            <p className="text-gray-500 font-light tracking-[0.2em] uppercase text-[10px]">
              Spatial risk analysis. Topological clustering enabled.
            </p>
          </div>
          <Button 
            onClick={fetchAnalysisData} 
            disabled={isLoading || !selectedUploadId} 
            className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-6 text-[10px] tracking-widest font-bold transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.05)] uppercase italic"
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            REFRESH VECTORS
          </Button>
        </div>

        {/* Controls */}
        <div className="glass-card p-10 border-white/5 animate-on-scroll">
          <div className="flex flex-wrap items-center gap-12">
            <div className="flex-1 min-w-[300px] space-y-4">
              <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">SELECT DATASET:</label>
              <Select value={selectedUploadId} onValueChange={setSelectedUploadId}>
                <SelectTrigger className="bg-black/40 border-white/10 rounded-none h-12 text-[10px] tracking-widest uppercase italic focus:ring-0">
                  <SelectValue placeholder="Choose an upload..." />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/10 rounded-none">
                  {uploads.length === 0 ? (
                    <SelectItem value="none" disabled className="text-[10px] tracking-widest uppercase italic font-mono">No uploads found</SelectItem>
                  ) : (
                    uploads.map((upload) => (
                      <SelectItem key={upload.id} value={upload.id} className="text-[10px] tracking-widest uppercase italic font-mono focus:bg-white focus:text-black">
                        {getUploadLabel(upload)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[300px] space-y-4">
              <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">COLOR_INTENSITY: {colorIntensity[0]}%</label>
              <Slider 
                value={colorIntensity} 
                onValueChange={setColorIntensity} 
                min={20} max={100} step={5} 
                className="w-full" 
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "HIGH RISK NODES", value: stats.highRisk, color: "text-red-500", Icon: AlertTriangle, desc: "S-Vector > 0.65" },
            { label: "MEDIUM RISK NODES", value: stats.mediumRisk, color: "text-orange-500", Icon: Activity, desc: "S-Vector > 0.35" },
            { label: "CRITICAL PATTERNS", value: stats.criticalPatterns, color: "text-white", Icon: Zap, desc: "Direct Flags" },
            { label: "TOTAL NODES", value: stats.totalNodes, color: "text-white/40", Icon: TrendingUp, desc: "Active Topology" },
          ].map(({ label, value, color, Icon, desc }) => (
            <div key={label} className="glass-card p-8 group animate-on-scroll border-white/5 hover:border-white/20 transition-all duration-700">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase italic leading-none group-hover:text-white transition-colors duration-500">
                  {label}
                </span>
                <Icon className={`h-4 w-4 ${color} opacity-30 group-hover:opacity-100 transition-all duration-500`} />
              </div>
              <div className={`text-3xl font-bold ${color} tracking-tighter italic leading-none mb-2`}>
                {value}
              </div>
              <p className="text-[9px] tracking-widest text-gray-600 uppercase italic">{desc}</p>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
          <TabsList className="bg-black border border-white/5 p-1 rounded-none h-auto">
            <TabsTrigger 
              value="risk" 
              className="rounded-none px-10 py-4 text-[10px] font-bold tracking-widest uppercase italic data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-500"
            >
              RISK DISTRIBUTION
            </TabsTrigger>
            <TabsTrigger 
              value="patterns" 
              className="rounded-none px-10 py-4 text-[10px] font-bold tracking-widest uppercase italic data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-500"
            >
              PATTERN MATRIX
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="rounded-none px-10 py-4 text-[10px] font-bold tracking-widest uppercase italic data-[state=active]:bg-white data-[state=active]:text-black transition-all duration-500"
            >
              ACTIVITY TIMELINE
            </TabsTrigger>
          </TabsList>

          <TabsContent value="risk" className="animate-on-scroll">
            <div className="glass-card p-10 border-white/5 space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter leading-none mb-2">In-Degree vs Out-Degree Risk Heatmap</h3>
                  <p className="text-gray-600 text-[10px] tracking-widest uppercase italic">High in-degree + high out-degree indicates potential smurfing.</p>
                </div>
                <div className="flex gap-4">
                  {[{ color: "rgba(34,197,94,0.3)", label: "MIN" }, { color: "rgba(239,68,68,0.3)", label: "MAX" }].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2 border border-white/5 px-3 py-1 bg-white/[0.02]">
                      <div className="w-2 h-2" style={{ backgroundColor: color }} />
                      <span className="text-[9px] tracking-widest text-gray-500 uppercase font-bold italic">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[500px] border border-white/5 bg-white/[0.02]">
                  <Loader2 className="h-10 w-10 animate-spin text-white/10 mb-4" />
                  <span className="text-[10px] tracking-extra-widest text-gray-600 uppercase italic animate-pulse">GENERATING SPATIAL MAPPINGS...</span>
                </div>
              ) : riskHeatmapData.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid gap-2 border border-white/5 p-4 bg-black" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}>
                    {riskHeatmapData.map((cell, idx) => (
                      <div 
                        key={idx} 
                        className="aspect-square border border-white/[0.03] rounded-sm transition-all duration-500 hover:scale-110 hover:z-10 cursor-crosshair relative group shadow-sm"
                        style={{ backgroundColor: getHeatmapColor(cell.value, colorIntensity[0]) }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-3 bg-black border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                          <p className="text-[10px] font-bold tracking-widest uppercase italic mb-1">{cell.label}</p>
                          <div className="flex justify-between items-center gap-6">
                            <span className="text-[9px] text-gray-500 uppercase italic">RISK_COEF:</span>
                            <span className="text-xs font-mono font-bold text-white">{(cell.value * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between items-center gap-6">
                            <span className="text-[9px] text-gray-500 uppercase italic">NODE_COUNT:</span>
                            <span className="text-xs font-mono font-bold text-white">{cell.metadata?.count || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-[10px] font-bold tracking-[0.4em] text-gray-700 uppercase italic">OUT-DEGREE (SENDING_VECTOR) →</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] border border-white/5 bg-white/[0.01]">
                  <Info className="h-10 w-10 mb-6 text-white/5" />
                  <p className="text-[10px] tracking-extra-widest text-gray-600 uppercase italic">NO TOPOLOGICAL DATA DETECTED. SELECT DATASET.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="animate-on-scroll">
            <div className="glass-card p-10 border-white/5 space-y-10">
              <div>
                <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter leading-none mb-2">PATTERN TYPE VS SEVERITY</h3>
                <p className="text-gray-600 text-[10px] tracking-widest uppercase italic">SYSTEMATIC DISTRIBUTION OF SMURFING | LAYERING | STRUCTURING</p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-[500px] border border-white/5 bg-white/[0.02]">
                   <Loader2 className="h-10 w-10 animate-spin text-white/10" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      <div className="h-12" />
                      {severityLabels.map((label) => (
                        <div key={label} className="h-12 flex items-center justify-center border border-white/5 bg-white/[0.02]">
                          <span className="text-[9px] font-bold tracking-extra-widest uppercase italic text-gray-500">{label}</span>
                        </div>
                      ))}
                    </div>
                    {patternLabels.map((pattern, y) => (
                      <div key={pattern} className="grid grid-cols-5 gap-4 mb-4">
                        <div className="h-20 flex items-center p-6 border border-white/5 bg-black">
                           <span className="text-[10px] font-bold tracking-widest text-white uppercase italic leading-tight">{pattern}</span>
                        </div>
                        {severityLabels.map((_, x) => {
                          const cell = patternHeatmapData.find((c) => c.x === x && c.y === y);
                          return (
                            <div 
                              key={x} 
                              className="h-20 border border-white/[0.03] transition-all hover:scale-105 hover:z-10 cursor-help flex flex-col items-center justify-center relative group"
                              style={{ backgroundColor: getHeatmapColor(cell?.value || 0, colorIntensity[0]) }}
                            >
                              <span className="text-xl font-bold text-white tracking-tighter italic leading-none">{cell?.metadata?.count || 0}</span>
                              <span className="text-[8px] tracking-widest text-white/40 uppercase mt-1 italic">{cell?.value ? `${(cell.value * 100).toFixed(0)}% CONF` : "-"}</span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-3 bg-black border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-2xl backdrop-blur-xl">
                                <p className="text-[10px] font-bold tracking-widest uppercase italic mb-1">{pattern} // {severityLabels[x]}</p>
                                <p className="text-[9px] text-gray-500 uppercase italic">AVG_CONFIDENCE: {Math.round((cell?.metadata?.avgConfidence || 0) * 100)}%</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="animate-on-scroll">
            <div className="glass-card p-10 border-white/5 space-y-10">
              <div>
                <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter leading-none mb-2">Suspicious Activity Timeline</h3>
                <p className="text-gray-600 text-[10px] tracking-widest uppercase italic">Hourly distribution across the week based on flagged addresses.</p>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px] border border-white/5 bg-white/[0.02]">
                  <Loader2 className="h-10 w-10 animate-spin text-white/10" />
                </div>
              ) : activityHeatmapData.length > 0 ? (
                <div className="overflow-x-auto pb-6">
                  <div className="min-w-[1000px] p-6 border border-white/5 bg-black/40 rounded-sm">
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: "80px repeat(24, 1fr)" }}>
                      {/* Hour Headers */}
                      <div />
                      {Array.from({ length: 24 }).map((_, h) => (
                        <div key={h} className="text-[9px] font-mono text-gray-500 text-center uppercase tracking-tighter">{h.toString().padStart(2, '0')}H</div>
                      ))}
                      
                      {/* Day Rows */}
                      {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((dayLabel, d) => (
                        <div key={d} className="contents">
                          <div className="text-[10px] font-bold text-gray-600 flex items-center pr-4 uppercase italic tracking-widest">{dayLabel}</div>
                          {Array.from({ length: 24 }).map((_, h) => {
                            const cell = activityHeatmapData.find((c) => c.x === d && c.y === h);
                            return (
                              <div 
                                key={h} 
                                className="aspect-square border border-white/[0.03] rounded-sm transition-all hover:scale-150 hover:z-10 cursor-crosshair relative group shadow-sm"
                                style={{ backgroundColor: getHeatmapColor(cell?.value || 0, colorIntensity[0]) }}
                              >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 bg-black border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20 shadow-2xl">
                                  <span className="text-[9px] font-bold tracking-widest uppercase italic">{cell?.label} // {((cell?.value || 0) * 100).toFixed(0)}% RISK</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-10 mt-12 py-6 border-t border-white/5">
                      <span className="text-[10px] font-bold tracking-widest text-gray-700 uppercase italic">INTENSITY_SCALE:</span>
                      <div className="flex gap-1 bg-black p-1 border border-white/10">
                        {[0.1, 0.3, 0.5, 0.7, 0.9].map((val) => (
                          <div key={val} className="w-12 h-2" style={{ backgroundColor: getHeatmapColor(val, colorIntensity[0]) }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase italic">LOW → CRITICAL</span>
                    </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] border border-white/5 bg-white/[0.01]">
                   <Info className="h-10 w-10 mb-6 text-white/5" />
                   <p className="text-[10px] tracking-extra-widest text-gray-600 uppercase italic">TEMPORAL PROTOCOLS INACTIVE. SELECT DATASET.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer info */}
        <div className="glass-card p-10 border-white/5 border-dashed relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="flex items-start gap-8">
            <div className="w-12 h-12 flex items-center justify-center border border-white/10 text-white/10">
              <Info className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter leading-none mb-6">SPATIAL_ANALYSIS_LOG</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-white uppercase italic mb-2">01 // TOPOLOGY</p>
                  <p className="text-[10px] tracking-widest text-gray-600 uppercase italic leading-relaxed">Risk clusters typically manifest in cells with high combined flow vectors.</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-white uppercase italic mb-2">02 // PATTERNS</p>
                  <p className="text-[10px] tracking-widest text-gray-600 uppercase italic leading-relaxed">Matrix view provides multi-dimensional verification of GNN detected suspicious activity.</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-white uppercase italic mb-2">03 // TEMPORAL</p>
                  <p className="text-[10px] tracking-widest text-gray-600 uppercase italic leading-relaxed">Timeline intensity assists in identifying coordinated laundering sessions across time zones.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}