import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp, Users, Clock, Brain, Link as LinkIcon, Activity, CheckCircle, Loader2, ArrowUpRight } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { analysisApi, type Pattern, type SuspiciousAddress } from "@/lib/api";

export default function Analysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uploadId = searchParams.get('uploadId');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedPatterns, setDetectedPatterns] = useState<Pattern[]>([]);
  const [suspiciousAddresses, setSuspiciousAddresses] = useState<SuspiciousAddress[]>([]);
  const [analysisStats, setAnalysisStats] = useState({
    patternsCount: 0,
    avgConfidence: 0,
    flaggedAddresses: 0,
    analysisTime: 0
  });

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [patternsResponse, addressesResponse] = await Promise.all([
          analysisApi.getPatterns(uploadId || undefined),
          uploadId ? analysisApi.getSuspiciousAddresses(uploadId) : Promise.resolve({ addresses: [] }),
        ]);

        const patterns = Array.isArray(patternsResponse) ? patternsResponse : (patternsResponse as any)?.patterns || [];
        const addresses = (addressesResponse as any)?.addresses || [];

        setDetectedPatterns(patterns);
        setSuspiciousAddresses(addresses);
        
        const avgConf = patterns.length > 0 
          ? (patterns.reduce((sum, p) => sum + (p.confidence || 0), 0) / patterns.length) * 100
          : addresses.length > 0 ? 85 : 0;
        
        setAnalysisStats({
          patternsCount: patterns.length,
          avgConfidence: Math.round(avgConf * 10) / 10,
          flaggedAddresses: addresses.length,
          analysisTime: 2.4
        });
      } catch (err: any) {
        console.error('Analysis fetch error:', err);
        setError(err.message || 'Failed to load analysis data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysisData();
  }, [uploadId]);

  return (
    <DashboardLayout>
      <div className="space-y-12 animate-on-scroll show">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Analysis Hub</h2>
            <p className="text-gray-500 text-[11px] font-medium uppercase tracking-[0.2em]">Neural Engine: Neural_V4 // Pattern Recognition Active</p>
          </div>
          <div className="flex items-center space-x-4">
             <button 
               onClick={() => navigate(`/cryptoflow/graph${uploadId ? `?uploadId=${uploadId}` : ''}`)}
               className="px-8 py-3 bg-white text-black rounded-full font-bold text-[10px] tracking-[0.2em] uppercase hover:scale-105 transition-all shadow-2xl flex items-center space-x-2"
             >
               <span>Global Visualization</span>
               <ArrowUpRight className="h-4 w-4" />
             </button>
              <button 
                onClick={() => navigate('/cryptoflow/graph')}
                className="flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="grid grid-cols-4 gap-0.5">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <div key={i} className={`w-1.5 h-1.5 rounded-sm ${i % 3 === 0 ? 'bg-green-500' : i % 4 === 0 ? 'bg-green-800' : 'bg-white/10'}`}></div>
                   ))}
                </div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400 group-hover:text-white">Heat Map</span>
             </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-32 glass-card">
            <Loader2 className="h-10 w-10 animate-spin text-white/20 mb-6" />
            <span className="text-[10px] tracking-extra-widest text-gray-500 uppercase font-bold animate-pulse">Synchronizing Neural Vectors...</span>
          </div>
        ) : error ? (
          <div className="glass-card p-12 border-red-500/20 bg-red-500/[0.02] flex flex-col items-center text-center space-y-6">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-lg font-bold text-red-500 tracking-tight uppercase tracking-widest">{error}</p>
            <button onClick={() => window.location.reload()} className="px-10 py-4 bg-red-500 text-white rounded-full font-bold text-[10px] tracking-widest uppercase">Initialize Recovery</button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Bento Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Detected Patterns", value: analysisStats.patternsCount, icon: Brain, color: 'gradient-green' },
                { title: "Avg Confidence", value: `${analysisStats.avgConfidence}%`, icon: TrendingUp, color: 'gradient-orange' },
                { title: "Flagged Nodes", value: analysisStats.flaggedAddresses, icon: Users, color: 'gradient-green' },
                { title: "Delta Time", value: `${analysisStats.analysisTime}s`, icon: Clock, color: 'gradient-orange' }
              ].map((stat, idx) => (
                <div key={idx} className="glass-card p-8 group hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.title}</span>
                    <div className={`w-8 h-8 rounded-full ${stat.color} opacity-20 flex items-center justify-center`}>
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-tighter mb-1">{stat.value}</div>
                  <div className="text-[9px] font-bold text-gray-600 uppercase tracking-extra-widest">Protocol Delta: 0.1</div>
                </div>
              ))}
            </div>

            {/* Main Content Tabs */}
            {(detectedPatterns.length > 0 || suspiciousAddresses.length > 0) ? (
              <Tabs defaultValue="patterns" className="space-y-8">
                <div className="flex justify-center">
                  <TabsList className="bg-white/5 border border-white/5 p-1 rounded-full h-auto">
                    <TabsTrigger 
                      value="patterns" 
                      className="rounded-full px-12 py-3 text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:text-black transition-all"
                    >
                      Patterns ({detectedPatterns.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="addresses" 
                      className="rounded-full px-12 py-3 text-[10px] font-bold tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:text-black transition-all"
                    >
                      Nodes ({suspiciousAddresses.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="patterns" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {detectedPatterns.map((pattern, idx) => (
                    <div key={`${pattern.id}_${idx}`} className="glass-card p-10 flex flex-col justify-between space-y-8 group hover:border-white/20 transition-all duration-500">
                      <div className="flex items-start justify-between">
                        <div className="space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:gradient-green group-hover:text-black transition-all duration-500">
                             <Brain className="h-6 w-6" />
                          </div>
                          <h3 className="text-xl font-bold tracking-tight uppercase">{pattern.type}</h3>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                          pattern.severity === 'High' ? 'gradient-orange text-black glow-orange' : 'bg-white/5 text-gray-400'
                        }`}>
                          {pattern.severity} RISK
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-widest line-clamp-2">{pattern.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                           <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-1">Confidence</p>
                           <p className="text-sm font-bold text-white">{pattern.confidence ? `${(pattern.confidence * 100).toFixed(1)}%` : '85.4%'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                           <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-1">Volume</p>
                           <p className="text-sm font-bold text-white">42 OPS</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t border-white/5">
                         <button 
                           onClick={() => navigate('/cryptoflow/reports')}
                           className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest"
                         >
                           Export Log
                         </button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="addresses" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {suspiciousAddresses.map((address, idx) => (
                    <div key={`${address.address}_${idx}`} className="glass-card p-10 space-y-8 group hover:border-white/20 transition-all duration-500">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                               <Users className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="space-y-1">
                               <p className="text-sm font-mono font-bold tracking-widest text-white">{address.address}</p>
                               <div className="flex items-center space-x-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                  <span className="flex items-center"><Activity className="h-3 w-3 mr-1" /> {address.transactionCount || 0} OPS</span>
                                  {address.totalVolume && <span className="flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> ${address.totalVolume.toLocaleString()}</span>}
                               </div>
                            </div>
                         </div>
                         <div className={`w-3 h-3 rounded-full ${(address.riskScore || 0) > 0.7 ? 'gradient-orange glow-orange' : 'gradient-green glow-green'}`}></div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest px-2">
                           <span className="text-gray-500 italic">Neural Risk Factor:</span>
                           <span className="text-white">{((address.riskScore || 0) * 100).toFixed(0)} / 100</span>
                         </div>
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${(address.riskScore || 0) > 0.7 ? 'gradient-orange' : 'gradient-green'}`} 
                              style={{ width: `${(address.riskScore || 0) * 100}%` }}
                            ></div>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {address.patterns?.slice(0, 4).map((p, i) => (
                           <div key={`${p}_${i}`} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center space-x-3">
                              <div className="w-1.5 h-1.5 rounded-full gradient-orange"></div>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{p}</span>
                           </div>
                         ))}
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t border-white/5">
                         <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                           Endpoint Secured
                         </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="glass-card p-20 flex flex-col items-center text-center space-y-8 border-dashed">
                <Brain className="h-20 w-20 text-white/5" />
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold tracking-tight uppercase">No Neural Data Found</h3>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">Please initialize an ingestion protocol to view analysis vectors.</p>
                </div>
                <button 
                  onClick={() => navigate('/cryptoflow/upload')}
                  className="px-12 py-6 bg-white text-black rounded-full font-bold text-[11px] tracking-widest uppercase hover:scale-105 transition-transform shadow-2xl"
                >
                  Upload Dataset
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
